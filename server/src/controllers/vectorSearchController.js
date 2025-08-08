import { vectorSearch } from "../lab/vector-search-1.lab.js";
import { ChatBedrockConverse } from "@langchain/aws";
import { ChatOpenAI } from "@langchain/openai"; // Only needed for LiteLLM proxy
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import { db } from "../utils/database.js";

// Store search results (keep this in memory for now)
const sessionSearchResults = new Map();

/**
 * Initialize the appropriate LLM model based on environment configuration
 * @returns {ChatBedrockConverse|ChatOpenAI} - The configured LLM model
 */
function initializeModel() {
    const useBedrock = process.env.LLM_BEDROCK === 'true';
    const useProxy = process.env.LLM_PROXY_ENABLED === 'true';
    const proxyType = process.env.LLM_PROXY_TYPE;

    console.log(`LLM Configuration: bedrock=${useBedrock}, proxy=${useProxy}, proxyType=${proxyType}`);

    if (useBedrock && !useProxy) {
        // Direct Bedrock connection - works with any Bedrock model (Anthropic, etc.)
        console.log('Using direct AWS Bedrock connection');
        return new ChatBedrockConverse({
            model: process.env.LLM_MODEL || "us.anthropic.claude-3-haiku-20240307-v1:0",
            region: process.env.AWS_REGION || "us-east-1",
            temperature: 0.7,
            maxTokens: 4096,
        });
    } else if (useProxy && proxyType === 'litellm') {
        // LiteLLM proxy - uses OpenAI-compatible interface regardless of actual provider
        console.log(`Using LiteLLM proxy for provider: ${process.env.LLM_PROVIDER}`);
        const proxyService = process.env.LLM_PROXY_SERVICE || 'litellm-service';
        const proxyPort = process.env.LLM_PROXY_PORT || '4000';
        const baseURL = `http://${proxyService}:${proxyPort}`;

        // provides an OpenAI-compatible interface
        return new ChatOpenAI({
            apiKey: "sk-litellm-proxy-key",
            configuration: {
                baseURL: baseURL,
            },
            model: process.env.LLM_MODEL || "claude-3-haiku",
            temperature: 0.7,
            maxTokens: 4096,
        });
    } else {
        throw new Error(`Invalid LLM configuration. Set LLM_BEDROCK=true for direct Bedrock, or LLM_PROXY_ENABLED=true with LLM_PROXY_TYPE=litellm for proxy`);
    }
}

/**
 * Formats search results for the LLM including comprehensive property and review data
 * @param {Array} searchResults - Array of property objects from MongoDB
 * @param {string} contextPrefix - Prefix message for the context
 * @returns {string} - Formatted context information for the LLM
 */
function formatPropertiesForLLM(searchResults, contextPrefix = "") {
    if (!searchResults || searchResults.length === 0) {
        return "";
    }

    let contextInfo = contextPrefix;

    searchResults.forEach((property, index) => {
        contextInfo += `=== PROPERTY ${index + 1} ===\n`;
        contextInfo += `Property ID: ${property._id}\n`;
        contextInfo += `Name: ${property.name || 'N/A'}\n`;
        contextInfo += `Property Type: ${property.property_type || 'N/A'}\n`;
        contextInfo += `Room Type: ${property.room_type || 'N/A'}\n`;
        contextInfo += `Price: $${property.price?.$numberDecimal || property.price || 'N/A'} per night\n`;
        contextInfo += `Location: ${property.address?.market || ''}, ${property.address?.country || ''}\n`;
        contextInfo += `Neighborhood: ${property.address?.suburb || property.address?.government_area || 'N/A'}\n`;
        contextInfo += `Accommodates: ${property.accommodates || 'N/A'} guests\n`;
        contextInfo += `Bedrooms: ${property.bedrooms || 'N/A'}\n`;
        contextInfo += `Bathrooms: ${property.bathrooms?.$numberDecimal || property.bathrooms || 'N/A'}\n`;
        contextInfo += `Beds: ${property.beds || 'N/A'}\n`;
        contextInfo += `Minimum nights: ${property.minimum_nights || 'N/A'}\n`;
        
        // Property description
        if (property.description) {
            contextInfo += `Description: ${property.description.substring(0, 500)}${property.description.length > 500 ? '...' : ''}\n`;
        }
        
        // Host information
        if (property.host) {
            contextInfo += `Host: ${property.host.host_name || 'N/A'}\n`;
            contextInfo += `Host Response Rate: ${property.host.host_response_rate || 'N/A'}%\n`;
            contextInfo += `Host Response Time: ${property.host.host_response_time || 'N/A'}\n`;
            contextInfo += `Superhost: ${property.host.host_is_superhost ? 'Yes' : 'No'}\n`;
        }
        
        // Amenities
        if (property.amenities && property.amenities.length > 0) {
            contextInfo += `Amenities: ${property.amenities.join(', ')}\n`;
        }
        
        // Review scores
        if (property.review_scores) {
            contextInfo += `REVIEW SCORES:\n`;
            contextInfo += `- Overall Rating: ${property.review_scores.review_scores_rating || 'N/A'}/100\n`;
            contextInfo += `- Accuracy: ${property.review_scores.review_scores_accuracy || 'N/A'}/10\n`;
            contextInfo += `- Cleanliness: ${property.review_scores.review_scores_cleanliness || 'N/A'}/10\n`;
            contextInfo += `- Check-in: ${property.review_scores.review_scores_checkin || 'N/A'}/10\n`;
            contextInfo += `- Communication: ${property.review_scores.review_scores_communication || 'N/A'}/10\n`;
            contextInfo += `- Location: ${property.review_scores.review_scores_location || 'N/A'}/10\n`;
            contextInfo += `- Value: ${property.review_scores.review_scores_value || 'N/A'}/10\n`;
        }
        
        // Review count
        contextInfo += `Total Reviews: ${property.number_of_reviews || 0}\n`;
        
        // Recent reviews (show up to 3 most recent)
        if (property.reviews && property.reviews.length > 0) {
            contextInfo += `RECENT GUEST REVIEWS:\n`;
            const recentReviews = property.reviews.slice(-3).reverse(); // Get last 3 reviews, most recent first
            recentReviews.forEach((review, reviewIndex) => {
                const reviewDate = review.date?.$date ? new Date(review.date.$date).toLocaleDateString() : review.date || 'N/A';
                contextInfo += `  Review ${reviewIndex + 1}:\n`;
                contextInfo += `    Date: ${reviewDate}\n`;
                contextInfo += `    Reviewer: ${review.reviewer_name || 'Anonymous'}\n`;
                contextInfo += `    Comment: ${review.comments || 'No comment'}\n`;
            });
        }
        
        // Additional details
        if (property.neighborhood_overview) {
            contextInfo += `Neighborhood Overview: ${property.neighborhood_overview}\n`;
        }
        
        if (property.transit) {
            contextInfo += `Transportation: ${property.transit}\n`;
        }
        
        contextInfo += `\n`;
    });
    
    contextInfo += `\nPlease use this information to provide helpful recommendations and answer questions about these properties. Focus on the aspects that matter most to the user's query. When mentioning specific properties, please reference them by their Property ID so users can easily identify them.`;
    
    return contextInfo;
}

export async function getVectorSearch(req, res) {
    const { query, property_type } = req.body;
    
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    try {
        const items = await vectorSearch(query, property_type);
        
        res.status(201).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export async function getChat(req, res) {
    const { message, sessionId = 'default', username = 'default', property_type = 'Apartment' } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message parameter is required' });
    }

    try {
        // Create a composite session ID that includes username
        const compositeSessionId = `${username}_${sessionId}`;

        // Initialize the appropriate model based on configuration
        const model = initializeModel();

        // Check if user is referring to previous search results
        const previousResults = sessionSearchResults.get(compositeSessionId) || [];
        let searchResults = [];
        let contextInfo = "";
        
        // Check if the message is asking about previous results
        const isReferringToPrevious = /\b(first|second|third|show me|property|#?\d+)\b/i.test(message) && previousResults.length > 0;
        
        if (isReferringToPrevious) {
            // Use previous search results
            searchResults = previousResults;
            contextInfo = formatPropertiesForLLM(
                searchResults, 
                "\n\nBased on your previous search, here are the properties I found:\n\n"
            );
        } else {
            // Perform new vector search
            try {
                searchResults = await vectorSearch(message, property_type);
                // Store results for future reference using composite session ID
                sessionSearchResults.set(compositeSessionId, searchResults);
                contextInfo = formatPropertiesForLLM(
                    searchResults, 
                    "\n\nHere are some relevant properties I found based on your search:\n\n"
                );
            } catch (searchError) {
                console.error('Vector search error:', searchError);
                contextInfo = "\n\nI'm having trouble searching for properties right now, but I can still help with general travel questions and recommendations.";
            }
        }

        // Create MongoDB chat message history with composite session ID
        const chatHistory = new MongoDBChatMessageHistory({
            collection: db.collection("chat_history"),
            sessionId: compositeSessionId
        });

        // Create memory with MongoDB chat history
        const memory = new ConversationSummaryBufferMemory({
            llm: model,
            maxTokenLimit: 2000,
            returnMessages: true,
            memoryKey: "chat_history",
            chatHistory: chatHistory,
        });

        // Update the system prompt to handle property references
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are a helpful AI assistant for an Airbnb-like accommodation platform. You can help users find properties, answer questions about bookings, and provide travel recommendations. Be friendly, helpful, and informative.

When property information is provided, use it to give specific, detailed recommendations based on:
- Property features and amenities
- Guest review scores and ratings
- Recent guest comments and experiences
- Host quality and responsiveness
- Location and neighborhood details
- Value for money

Pay special attention to:
- Review scores (accuracy, cleanliness, communication, location, value)
- Guest feedback patterns in recent reviews
- Host responsiveness and superhost status
- Property location and accessibility

Always be accurate about the details provided. Don't make up information not present in the property data. When recommending properties, consider both the property features and the guest review feedback to provide balanced, helpful advice.

When mentioning specific properties in your response, always include their Property ID in your recommendations so users can easily identify and link to them.

If a user asks about "the first property", "property #1", or similar references, they are referring to the first property from the most recent search results or recommendations you provided.

If no specific properties are found, provide general travel advice and suggestions for what to look for when booking accommodations.`],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        // Create the conversation chain with search results and review integration
        const chain = RunnableSequence.from([
            {
                input: (initialInput) => initialInput.input + contextInfo,
                chat_history: async (initialInput) => {
                    // Load chat history from memory
                    try {
                        const memoryVariables = await memory.loadMemoryVariables({});
                        return memoryVariables.chat_history || [];
                    } catch (error) {
                        console.error('Memory loading error:', error);
                        return [];
                    }
                },
            },
            prompt,
            model,
        ]);

        // Get response from the model
        const response = await chain.invoke({ input: message });

        // Save the conversation to memory (this will persist to MongoDB)
        await memory.saveContext(
            { input: message },
            { output: response.content }
        );

        res.status(200).json({ 
            reply: response.content,
            sessionId: compositeSessionId,
            username: username,
            searchResults: searchResults.length > 0 ? searchResults : null,
            foundProperties: searchResults.length
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: error.message });
    }
}

// Clear conversation from MongoDB
export async function clearChat(req, res) {
    const { sessionId = 'default', username = 'default' } = req.body;
    
    try {
        // Create composite session ID
        const compositeSessionId = `${username}_${sessionId}`;
        
        // Clear in-memory search results
        sessionSearchResults.delete(compositeSessionId);
        
        // Generate new session ID for fresh conversation
        const newSessionId = generateNewSessionId(sessionId);
        const newCompositeSessionId = `${username}_${newSessionId}`;
        
        res.status(200).json({ 
            message: 'New conversation started',
            newSessionId: newCompositeSessionId,
            username: username,
            previousSessionId: compositeSessionId
        });
    } catch (error) {
        console.error('Error starting new chat session:', error);
        res.status(500).json({ message: error.message });
    }
}

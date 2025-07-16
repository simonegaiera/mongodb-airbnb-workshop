import { vectorSearch } from "../lab/vector-search-1.lab.js";
import { ChatBedrockConverse } from "@langchain/aws";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";

// Store conversation memories (in production, use a database)
const conversationMemories = new Map();

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
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message parameter is required' });
    }

    try {
        // Initialize Bedrock model using ChatBedrockConverse
        const model = new ChatBedrockConverse({
            model: process.env.LLM_MODEL || "us.anthropic.claude-sonnet-4-20250514-v1:0",
            region: process.env.AWS_REGION || "us-east-1",
            temperature: 0.7,
            maxTokens: 4096,
        });

        // Get or create conversation memory for this session
        let memory = conversationMemories.get(sessionId);
        if (!memory) {
            memory = new ConversationSummaryBufferMemory({
                llm: model,
                maxTokenLimit: 2000,
                returnMessages: true,
                memoryKey: "chat_history",
            });
            conversationMemories.set(sessionId, memory);
        }

        // Create prompt template with conversation history
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful AI assistant for an Airbnb-like platform. You can help users find properties, answer questions about bookings, and provide travel recommendations. Be friendly and helpful."],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        // Create the conversation chain with fixed memory handling
        const chain = RunnableSequence.from([
            {
                input: (initialInput) => initialInput.input,
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

        // Save the conversation to memory
        await memory.saveContext(
            { input: message },
            { output: response.content }
        );

        res.status(200).json({ 
            reply: response.content,
            sessionId: sessionId
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: error.message });
    }
}

// Optional: Add function to clear conversation memory
export async function clearChat(req, res) {
    const { sessionId = 'default' } = req.body;
    
    try {
        conversationMemories.delete(sessionId);
        res.status(200).json({ message: 'Conversation cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

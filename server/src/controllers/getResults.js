import { connectToDatabase, client } from "../utils/database.js";
import { resultsCollectionName, participantsCollectionName, resultsDatabaseName, databaseName } from '../config/config.js';


export async function getParticipant(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.findOne({ _id: databaseName }, { projection: { _id: 0, name: 1 } })

        console.info(`[getParticipant] SUCCESS: Retrieved participant data for ${databaseName}`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[getParticipant] ERROR: Failed to retrieve participant data for ${databaseName}:`, error.message);
        console.error(`[getParticipant] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

export async function getParticipants(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.find({}).toArray()
        
        console.info(`[getParticipants] SUCCESS: Retrieved ${items.length} participants`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[getParticipants] ERROR: Failed to retrieve participants:`, error.message);
        console.error(`[getParticipants] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};


export async function getSectionResults(req, res) {
    try {
        const leaderboard = process.env.LEADERBOARD || 'timed';
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        
        // Use different views based on leaderboard type
        const viewName = leaderboard === 'score' ? 'score_leaderboard' : 'timed_leaderboard';
        const collection = database.collection(viewName);

        const data = await collection.find({}).toArray();
        
        const whoami = await database.collection(participantsCollectionName).findOne({ _id: databaseName }, { projection: { _id: 0, name: 1 } })

        let items;
        
        if (leaderboard === 'score') {
            const pointsByUsername = {};
            data.forEach(item => {  
                item.users.forEach(user => {
                    const displayName = user.user ? user.user : user.username;

                    if (pointsByUsername[displayName]) {  
                        pointsByUsername[displayName] += user.points;  
                    } else {  
                        pointsByUsername[displayName] = user.points;  
                    }  
                });  
            });  
            // Convert the object into an array of key-value pairs and sort them
            const sortedPointsArray = Object.entries(pointsByUsername).sort((a, b) => b[1] - a[1]);
            const sortedPointsByUsername = Object.fromEntries(sortedPointsArray);
            
            items = {
                whoami: whoami ? whoami.name : databaseName,
                results: sortedPointsByUsername,
                data: data,
                leaderboardType: 'score'
            };
        } else {
            // For timed leaderboard, return whoami and results as data
            items = {
                whoami: whoami ? whoami.name : databaseName,
                results: data,
                leaderboardType: 'timed'
            };
        }
        
        const resultCount = Array.isArray(items.results) ? items.results.length : Object.keys(items.results).length;
        console.info(`[getResults] SUCCESS: ${items.leaderboardType} leaderboard response sent with ${resultCount} results`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[getResults] ERROR: Failed to process ${process.env.LEADERBOARD || 'timed'} leaderboard request:`, error.message);
        console.error(`[getResults] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

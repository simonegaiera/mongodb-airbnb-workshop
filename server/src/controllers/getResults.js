import { connectToDatabase, client } from "../utils/database.js";
import { resultsCollectionName, participantsCollectionName, resultsDatabaseName, databaseName } from '../config/config.js';
import { logInfo, logError } from '../utils/logger.js';


export async function getParticipant(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.findOne({ _id: databaseName }, { projection: { _id: 0, name: 1 } })

        logInfo(req, `[getParticipant] SUCCESS: Retrieved participant data for ${databaseName}`);
        res.status(200).json(items);
    } catch (error) {
        logError(req, `[getParticipant] ERROR: Failed to retrieve participant data for ${databaseName}:`, error);
        res.status(500).json({ message: error.message });
    }
};

export async function getParticipants(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.find({}).toArray()
        
        logInfo(req, `[getParticipants] SUCCESS: Retrieved ${items.length} participants`);
        res.status(200).json(items);
    } catch (error) {
        logError(req, `[getParticipants] ERROR: Failed to retrieve participants:`, error);
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
        logInfo(req, `[getResults] SUCCESS: ${items.leaderboardType} leaderboard response sent with ${resultCount} results`);
        res.status(200).json(items);
    } catch (error) {
        logError(req, `[getResults] ERROR: Failed to process ${process.env.LEADERBOARD || 'timed'} leaderboard request:`, error);
        res.status(500).json({ message: error.message });
    }
};

export async function getResultsByNameAndUsername(req, res) {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({ message: 'Name parameter is required' });
        }

        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);

        // The username is derived from the database name (which represents the current user)
        const username = databaseName;

        // Filter by both name and username
        const filter = {
            name: name,
            username: username
        };

        const results = await collection.findOne(filter);

        logInfo(req, `[getResultsByNameAndUsername] SUCCESS: Retrieved results for name: ${name} - found: ${results ? 'yes' : 'no'}`);
        res.status(200).json({
            results: results,
            count: results ? 1 : 0
        });
    } catch (error) {
        logError(req, `[getResultsByNameAndUsername] ERROR: Failed to retrieve results:`, error);
        res.status(500).json({ message: error.message });
    }
};

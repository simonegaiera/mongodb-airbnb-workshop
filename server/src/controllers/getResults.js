import { connectToDatabase, client } from "../utils/database.js";
import { resultsCollectionName, resultsDatabaseName } from '../config/config.js';


export async function getSectionResults(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);
        
        const pipeline = [
            {
                '$sort': {
                    'timestamp': -1
                }
            }, {
                '$group': {
                    '_id': {
                        'section': '$section', 
                        'name': '$name'
                    }, 
                    'users': {
                        '$push': {
                            'username': '$username', 
                            'timestamp': '$timestamp'
                        }
                    }
                }
            }, {
                '$addFields': {
                    'users': {
                        '$map': {
                            'input': {
                                '$range': [
                                    0, {
                                        '$size': '$users'
                                    }
                                ]
                            }, 
                            'as': 'index', 
                            'in': {
                                'username': {
                                    '$arrayElemAt': [
                                        '$users.username', '$$index'
                                    ]
                                }, 
                                'points': {
                                    '$subtract': [
                                        100, {
                                            '$cond': {
                                                'if': { '$lte': ['$$index', 10] },
                                                'then': { '$multiply': ['$$index', 5] },
                                                'else': 50
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }, {
                '$sort': {
                    '_id.section': 1, 
                    '_id.name': 1
                }
            }
        ]
        
        const data = await collection.aggregate(pipeline).toArray();
        
        const pointsByUsername = {};  
        data.forEach(item => {  
            item.users.forEach(user => {  
                if (pointsByUsername[user.username]) {  
                    pointsByUsername[user.username] += user.points;  
                } else {  
                    pointsByUsername[user.username] = user.points;  
                }  
            });  
        });  
        // Convert the object into an array of key-value pairs
        const sortedPointsArray = Object.entries(pointsByUsername).sort((a, b) => b[1] - a[1]);
        // If you need the result back in an object format
        const sortedPointsByUsername = Object.fromEntries(sortedPointsArray);
        
        const items = {
            results: sortedPointsByUsername,
            data: data
        }
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

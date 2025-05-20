import { connectToDatabase, client } from "../utils/database.js";
import { resultsCollectionName, participantsCollectionName, resultsDatabaseName, databaseName } from '../config/config.js';


export async function getParticipant(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.findOne({ _id: databaseName }, { projection: { _id: 0, name: 1 } })

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export async function getParticipants(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(participantsCollectionName);

        const items = await collection.find({}).toArray()
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export async function getSectionResults(req, res) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);
        
        const pipeline = [
            {
                '$sort': { 'timestamp': 1 }
            },
            {
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
            },
            {
                '$addFields': {
                    'users': {
                        '$map': {
                            'input': { '$range': [0, { '$size': '$users' }] },
                            'as': 'index',
                            'in': {
                                'username': { '$arrayElemAt': [ '$users.username', '$$index' ] },
                                'points': {
                                    '$subtract': [
                                        100,
                                        {
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
            },
            // Unwind the users array to perform lookup for each user separately
            {
                '$unwind': '$users'
            },
            // Lookup participant info using the username field inside users
            {
                '$lookup': {
                    'from': 'participants',
                    'localField': 'users.username',
                    'foreignField': '_id',
                    'as': 'participants_info'
                }
            },
            // Add the participant name as the field "user" on the users object
            {
                '$addFields': {
                    'users.user': { '$arrayElemAt': [ '$participants_info.name', 0 ] }
                }
            },
            // Remove participants_info and regroup the users back into an array
            {
                '$project': { 'participants_info': 0 }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'users': { '$push': '$users' }
                }
            },
            {
                '$sort': { '_id.section': 1, '_id.name': 1 }
            }
        ];

        const data = await collection.aggregate(pipeline).toArray();
        
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
        
        const whoami = await database.collection(participantsCollectionName).findOne({ _id: databaseName }, { projection: { _id: 0, name: 1 } })

        const items = {
            whoami: whoami ? whoami.name : databaseName,
            results: sortedPointsByUsername,
            data: data
        };
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

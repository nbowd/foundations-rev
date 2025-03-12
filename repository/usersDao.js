const {GetCommand, PutCommand, DeleteCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb")
const documentClient = require('../utils/config');

async function getUsers(){
    const command = new ScanCommand({
        TableName: "FoundationalUsers"
    });

    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        console.error(err);
        return null;
    }
};

async function getUserByUsername(username) {
    const command = new QueryCommand({
        TableName: "FoundationalUsers",
        IndexName: "username-index",
        KeyConditionExpression: "username = :username",
        ExpressionAttributeValues: {
            ":username": username
        }
    })
    
    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getUserById(user_id) {
    const command = new GetCommand({
        TableName: "FoundationalUsers",
        Key: {user_id}
    })

    try{
        const data = await documentClient.send(command);
        return data.Item;
    }catch(err){
        console.error(err);
        return null;
    }
};

async function createUser(user) {
    const command = new PutCommand({
        TableName: 'FoundationalUsers',
        Item: user
    })

    try {
        await documentClient.send(command);
        return user
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = { getUsers, createUser, getUserByUsername, getUserById };
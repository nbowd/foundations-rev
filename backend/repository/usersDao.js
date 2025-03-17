const {GetCommand, PutCommand, DeleteCommand, ScanCommand, QueryCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")
const {documentClient} = require('../utils/config');
const logger = require('../utils/logger');

/* istanbul ignore next */
async function getUsers(){
    const command = new ScanCommand({
        TableName: "FoundationalUsers"
    });

    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        logger.error(err);
        return null;
    }
};

/* istanbul ignore next */
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
        logger.error(error);
        return null;
    }
}

/* istanbul ignore next */
async function getUserById(user_id) {
    const command = new GetCommand({
        TableName: "FoundationalUsers",
        Key: {user_id}
    })

    try{
        const data = await documentClient.send(command);
        return data.Item;
    }catch(err){
        logger.error(err);
        return null;
    }
};

/* istanbul ignore next */
async function createUser(user) {
    const command = new PutCommand({
        TableName: 'FoundationalUsers',
        Item: user
    })

    try {
        await documentClient.send(command);
        return user
    } catch (error) {
        logger.log(error);
        return null;
    }
}

/* istanbul ignore next */
async function changeRole(user_id, role) {
    const command = new UpdateCommand({
        TableName: "FoundationalUsers",
        Key: { user_id },
        UpdateExpression: "SET #r = :role",
        ExpressionAttributeNames: {
            "#r": "role"
        },
        ExpressionAttributeValues: {
            ":role": role
        },
        ReturnValues: "ALL_NEW"
    });

    try {
        const data = await documentClient.send(command);
        return data.Attributes;
    } catch (error) {
        logger.log(error);
        return null;
    }
}

/* istanbul ignore next */
async function deleteUser(user_id) {
    const command = new DeleteCommand({
        TableName: "FoundationalUsers",
        Key: {user_id},
        ReturnValues: "ALL_OLD"
    })

    try{
        const data = await documentClient.send(command);
        return data.Attributes;
    }catch(err){
        logger.error(err);
        return null;
    }
}

module.exports = { getUsers, createUser, getUserByUsername, getUserById, deleteUser, changeRole };
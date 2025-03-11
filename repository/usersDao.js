const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({region: "us-west-2"});
const documentClient = DynamoDBDocumentClient.from(client);

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

module.exports = { getUsers, createUser, getUserByUsername };
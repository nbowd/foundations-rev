const {GetCommand, PutCommand, DeleteCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb")
const documentClient = require('../utils/config');

async function getTickets(){
    const command = new ScanCommand({
        TableName: "FoundationalTickets"
    });

    try{
        const data = await documentClient.send(command);
        return data.Items;
    }catch(err){
        console.error(err);
        return null;
    }
};

async function getTicketsByStatus(status) {
    const command = new QueryCommand({
        TableName: "FoundationalTickets",
        IndexName: "status-index",
        KeyConditionExpression: "#s = :status",
        ExpressionAttributeNames: {
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ":status": status
        }
    })

    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (error) {
        console.error(error);
        return null;
    }
};

async function getTicketsByAuthor(author) {
    const command = new QueryCommand({
        TableName: "FoundationalTickets",
        IndexName: "author-index",
        KeyConditionExpression: "author = :author",
        ExpressionAttributeValues: {
            ":author": author
        }
    })

    try {
        const data = await documentClient.send(command);
        return data.Items;
    } catch (error) {
        console.error(error);
        return null;
    }
};

async function createTicket(ticket) {
    const command = new PutCommand({
        TableName: 'FoundationalTickets',
        Item: ticket
    })

    try {
        await documentClient.send(command);
        return ticket
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = { getTickets, createTicket, getTicketsByStatus, getTicketsByAuthor};
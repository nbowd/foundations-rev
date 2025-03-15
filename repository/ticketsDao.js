const {GetCommand, PutCommand, DeleteCommand, ScanCommand, QueryCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")
const {documentClient, s3} = require('../utils/config');
const {PutObjectCommand, GetObjectCommand  } = require("@aws-sdk/client-s3");
const uuid = require('uuid');

/* istanbul ignore next */
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

/* istanbul ignore next */
async function getTicketsById(ticket_id){
    const command = new GetCommand({
        TableName: "FoundationalTickets",
        Key: {ticket_id}
    });

    try{
        const data = await documentClient.send(command);
        return data.Item;
    }catch(err){
        console.error(err);
        return null;
    }
};

/* istanbul ignore next */
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

/* istanbul ignore next */
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

/* istanbul ignore next */
async function getTicketsByType(type) {
    const command = new QueryCommand({
        TableName: "FoundationalTickets",
        IndexName: "type-index",
        KeyConditionExpression: "#t = :type",
        ExpressionAttributeNames: {
            "#t": "type"
        },
        ExpressionAttributeValues: {
            ":type": type
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

/* istanbul ignore next */
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

/* istanbul ignore next */
async function changeStatus(ticket_id, user_id, status) {
    const command = new UpdateCommand({
        TableName: "FoundationalTickets",
        Key: { ticket_id },
        UpdateExpression: "SET #sts = :newSts, #res = :resolver",
        ExpressionAttributeNames: {
            "#sts": "status",  // alias for reserved 'status' keyword
            "#res": "resolver"
        },
        ExpressionAttributeValues: {
            ":newSts": status,
            ":resolver": user_id
        },
        ReturnValues: "ALL_NEW"
    });

    try {
        const data = await documentClient.send(command);
        return data.Attributes;
    } catch (error) {
        console.log(error)
    }
}

/* istanbul ignore next */
async function uploadReceipt(file) {
    const fileName = `receipts/${uuid.v4()}.jpg`;

    const command = new PutObjectCommand({
        Bucket: "foundational-receipts",
        Key: fileName,
        Body: file,
        ContentType: "image/jpeg",
        ReturnValues: ""
    });

    try {
        await s3.send(command);
        return fileName;
    } catch (error) {
        console.log(error);
    }
};

/* istanbul ignore next */
async function updateTicket(ticket_id, fileName) {
    const command = new UpdateCommand({
        TableName: "FoundationalTickets",
        Key: { ticket_id },
        UpdateExpression: "SET receipt = :receipt",
        ExpressionAttributeValues: {
            ":receipt": fileName
        },
        ReturnValues: "ALL_NEW"
    });

    try {
        const data = await documentClient.send(command);
        return data.Attributes;
    } catch (error) {
        console.log(error)
    }
};

/* istanbul ignore next */
async function deleteTicket(ticket_id) {
    const command = new DeleteCommand({
        TableName: "FoundationalTickets",
        Key: {ticket_id},
        ReturnValues: "ALL_OLD"
    })

    try{
        const data = await documentClient.send(command);
        return data.Attributes;
    }catch(err){
        console.error(err);
        return null;
    }
}

module.exports = { getTickets, createTicket, getTicketsByStatus, getTicketsByAuthor, getTicketsById, changeStatus, deleteTicket, getTicketsByType, uploadReceipt, updateTicket };
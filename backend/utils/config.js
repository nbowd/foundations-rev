const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {DynamoDBDocumentClient} = require("@aws-sdk/lib-dynamodb")
const { S3Client } = require("@aws-sdk/client-s3");

// DynamoDB
const client = new DynamoDBClient({region: "us-west-2"});
const documentClient = DynamoDBDocumentClient.from(client);

// S3 Bucket
const s3 = new S3Client({region: "us-west-2"});

module.exports = {documentClient, s3};
const {GetCommand, PutCommand, DeleteCommand, UpdateCommand} = require("@aws-sdk/lib-dynamodb")
const {PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const  { getSignedUrl } =  require("@aws-sdk/s3-request-presigner");
const {documentClient, s3} = require('../utils/config');
const uuid = require('uuid');
const logger = require('../utils/logger');

/* istanbul ignore next */
async function createProfile(profile) {
    const command = new PutCommand({
        TableName: 'FoundationalProfile',
        Item: profile,
        ReturnValues: "ALL_OLD"
    })

    try {
        const newProfile = await documentClient.send(command);
        return newProfile
    } catch (error) {
        logger.log(error);
        return null;
    }
};

/* istanbul ignore next */
async function getProfileById(user_id) {
    const command = new GetCommand({
        TableName: "FoundationalProfile",
        Key: { user_id }
    });

    try{
        const data = await documentClient.send(command);
        return data.Item;
    }catch(err){
        logger.error(err);
        return null;
    }
}

/* istanbul ignore next */
async function getSignedUrlForImage(fileKey, bucket) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });
    
      return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1-hour access
}

/* istanbul ignore next */
async function updateProfile(user_id, profile) {
    const command = new UpdateCommand({
        TableName: "FoundationalProfile",
        Key: { user_id },
        UpdateExpression: "SET first_name = :first_name, last_name = :last_name, office_location = :office_location, title = :title, profile_picture = :profile_picture",
        ExpressionAttributeValues: {
            ":first_name": profile.first_name,
            ":last_name": profile.last_name,
            ":office_location": profile.office_location,
            ":title": profile.title,
            ":profile_picture": profile.profile_picture
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
async function uploadPhoto(file) {
    const fileName = `profile/${uuid.v4()}.jpg`;

    const command = new PutObjectCommand({
        Bucket: "foundational-profile",
        Key: fileName,
        Body: file,
        ContentType: "image/jpeg",
    });

    try {
        await s3.send(command);
        return fileName;
    } catch (error) {
        logger.log(error);
        return null;
    }
};

/* istanbul ignore next */
async function deleteProfile(user_id) {
    const command = new DeleteCommand({
        TableName: "FoundationalProfile",
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

module.exports = { createProfile, deleteProfile, updateProfile, getProfileById, uploadPhoto, getSignedUrlForImage };
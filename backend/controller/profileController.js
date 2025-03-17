const express = require('express');
const profileService = require('../service/profileService');
const { authenticateToken } = require("../utils/middleware");

const profileRouter = express.Router();

function validatePhoto(user_id, file){
    if (!user_id || !file) {
        return false;
    } else {
        return user_id.length > 0 && file.length > 0;
    }
}

/* istanbul ignore next */
function validatePhotoMiddleware(req, res, next) {
    if (validatePhoto(req.params.user_id, req.body)) {
        next();
    } else {
        return res.status(400).json({error: "Bad Request", status: 400, message: "No image uploaded"});
    }
}

/* istanbul ignore next */
profileRouter.patch('/:user_id', authenticateToken, async function(req, res) {
    const user_id = req.params.user_id;
    const body = req.body;
    const user = req.user;

    const profile = await profileService.updateProfile(user_id, body, user);

    if (profile.error) {
        return res.status(profile.status).json(profile);
    }

    return res.status(200).json(profile.profile);
})

/* istanbul ignore next */
profileRouter.post('/:user_id/photo', authenticateToken, validatePhotoMiddleware, async function(req, res){
    const user_id = req.params.user_id;
    const file = req.body;

    const profile = await profileService.addPhoto(user_id, file, req.user);

    if (profile.error) {
        return res.status(profile.status).json(profile);
    }

    return res.status(200).json(profile.profile);
});

module.exports = {validatePhoto, profileRouter};
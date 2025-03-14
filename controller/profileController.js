const router = require('express');
const profileService = require('../service/profileService');
const { authenticateToken } = require("../utils/middleware");
const profileRouter = router.Router();

profileRouter.patch('/:user_id', authenticateToken, async function(req, res) {
    const user_id = req.params.user_id;
    const body = req.body;
    const user = req.user;

    const profile = await profileService.updateProfile(user_id, body, user);

    if (profile.error && profile.error === 'Missing') {
        return res.status(400).send(profile.message);
    }

    if (profile.error && profile.error === 'Forbidden') {
        return res.status(403).send(profile.message);
    }

    return res.status(202).send(profile.profile);
})


module.exports = profileRouter;
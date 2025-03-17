const express = require('express')
const jwt = require('jsonwebtoken');
const usersService = require('../service/usersService');
const { validateUserMiddleware } = require('../utils/middleware');

const loginRouter = express.Router();

/* istanbul ignore next */
loginRouter.post('/', validateUserMiddleware, async function(req, res) {
    const user = await usersService.loginUser(req.body);

    if (user.error) {
        return res.status(user.status).json(user);
    }
    const token = jwt.sign(
        {
            id: user.user.user_id,
        },
        process.env.secretKey,
        {
            expiresIn: "15m"
        }
    );

    return res.status(200).json({user: user.user, token});
})

module.exports = {loginRouter};
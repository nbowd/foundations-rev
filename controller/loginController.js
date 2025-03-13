const router = require('express')
const jwt = require('jsonwebtoken');
const usersService = require('../service/usersService');
const { validateUserMiddleware } = require('../utils/middleware');

const loginRouter = router.Router();

loginRouter.post('/', validateUserMiddleware, async function(req, res) {
    const user = await usersService.loginUser(req.body);

    if (user.error == 'username' || user.error == 'password') {
        return res.status(400).send(user.message);
    }
    
    const token = jwt.sign(
        {
            id: user.user.user_id,
            username: user.user.username,
            role: user.user.role
        },
        process.env.secretKey,
        {
            expiresIn: "15m"
        }
    );

    return res.status(201).json({user: user.user, token});
})

module.exports = loginRouter;
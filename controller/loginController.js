const router = require('express')
const usersService = require('../service/usersService');
const { validateUserMiddleware } = require('../utils/middleware');

const loginRouter = router.Router();

loginRouter.post('/', validateUserMiddleware, async function(req, res) {
    const user = await usersService.loginUser(req.body);

    if (user.error == 'username' || user.error == 'password') {
        return res.status(400).send(user.message);
    }
    
    return res.status(201).json(user.user);
})

module.exports = loginRouter;
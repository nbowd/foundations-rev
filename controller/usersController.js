const router = require('express')
const usersService = require('../service/usersService');

const usersRouter = router.Router();

usersRouter.get('/', async function(req, res) {
    const users = await usersService.getUsers();
    return res.status(200).json(users);
})

usersRouter.post('/', async function(req, res) {
    const user = await usersService.createUser(req.body);
    if (user.error == 'duplicate') {
        return res.status(400).send(user.message);
    }

    return res.status(201).json(user.user);
})

module.exports = usersRouter;
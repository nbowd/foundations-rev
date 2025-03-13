const router = require('express')
const usersService = require('../service/usersService');
const { validateUserMiddleware } = require('../utils/middleware');

const usersRouter = router.Router();

usersRouter.get('/', async function(req, res) {
    const users = await usersService.getUsers();
    return res.status(200).json(users);
})

usersRouter.post('/', validateUserMiddleware, async function(req, res) {
    const user = await usersService.createUser(req.body);

    if (user.error == 'duplicate') {
        return res.status(400).send(user.message);
    }

    return res.status(201).json(user.user);
})

usersRouter.delete('/:user_id', async function(req, res) {
    const user = await usersService.deleteUser(req.params.user_id);

    if (user.error == 'missing') {
        return res.status(404).send(user.message);
    }

    return res.status(200).json(user);
})

module.exports = usersRouter;
const router = require('express')
const usersService = require('../service/usersService');
const { validateUserMiddleware, authenticateToken, validateManagerMiddleWare } = require('../utils/middleware');

const usersRouter = router.Router();

function validateChangeRole(user_id, role, user){
    return (user_id && role && user);
}

function validateChangeRoleMiddleware(req, res, next) {
    const user_id = req.params.user_id;
    const { role } = req.body;
    const user = req.user;

    if (validateChangeRole(user_id, role, user)) {
        next();
    } else {
        return res.status(400).send("Missing user_id path param, role body attribute, user auth");
    }
}

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

usersRouter.patch('/:user_id', authenticateToken, validateManagerMiddleWare, validateChangeRoleMiddleware, async function(req,res) {
    const user = await usersService.changeRole(req.params.user_id, req.body)
    
    return res.status(202).json(user.user);
});

usersRouter.delete('/:user_id', async function(req, res) {
    const user = await usersService.deleteUser(req.params.user_id);

    if (user.error == 'missing') {
        return res.status(404).send(user.message);
    }

    return res.status(200).json(user);
})

module.exports = usersRouter;
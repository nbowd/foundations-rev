const router = require('express')

const usersRouter = router.Router();

usersRouter.get('/', function(req, res) {
    return res.status(200).send("Get users endpoint");
})

module.exports = usersRouter;
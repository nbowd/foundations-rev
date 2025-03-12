const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

// Routes
const usersController = require('./controller/usersController');
const loginController = require('./controller/loginController');
const ticketsController = require('./controller/ticketsController');

function loggerMiddleware(req, res, next){
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
}

const app = express();
app.use(bodyParser.json());
app.use(loggerMiddleware);

app.use('/users', usersController);
app.use('/login', loginController);
app.use('/tickets', ticketsController);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
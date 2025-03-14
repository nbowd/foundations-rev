const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

// Routes
const usersController = require('./controller/usersController');
const loginController = require('./controller/loginController');
const ticketsController = require('./controller/ticketsController');
const profileController = require('./controller/profileController');

function loggerMiddleware(req, res, next){
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
}

const app = express();
app.use(bodyParser.json());
app.use(express.raw({ type: "image/*", limit: "5mb" })); // Accept raw binary image data
app.use(loggerMiddleware);

app.use('/users', usersController);
app.use('/login', loginController);
app.use('/tickets', ticketsController);
app.use('/profile', profileController);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
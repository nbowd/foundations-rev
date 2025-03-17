const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');

// Routes
const {usersRouter} = require('./controller/usersController');
const {loginRouter} = require('./controller/loginController');
const {ticketsRouter} = require('./controller/ticketsController');
const {profileRouter} = require('./controller/profileController');

function loggerMiddleware(req, res, next){
    logger.info(`Incoming ${req.method} : ${req.url}`);
    next();
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.raw({ type: "image/*", limit: "5mb" })); // Accept raw binary image data
app.use(loggerMiddleware);

app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/tickets', ticketsRouter);
app.use('/profile', profileRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
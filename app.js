const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// Routes
const usersController = require('./controller/usersController');
const loginController = require('./controller/loginController');
const ticketsController = require('./controller/ticketsController');

app.use(bodyParser.json());

app.use('/users', usersController);
app.use('/login', loginController);
app.use('/tickets', ticketsController);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
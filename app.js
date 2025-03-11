const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// Routes
const usersRouter = require('./routers/users');

app.use(bodyParser.json());

app.use('/users', usersRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
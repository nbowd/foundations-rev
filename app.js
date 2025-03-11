const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// Routes
const usersRouter = require('./routers/users');
const loginRouter = require('./routers/login');
const ticketsRouter = require('./routers/tickets');

app.use(bodyParser.json());

app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/tickets', ticketsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
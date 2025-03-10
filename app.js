const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// Routes

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
})
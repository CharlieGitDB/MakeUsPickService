const express = require('express');
require('dotenv-flow').config();
const sessionRouter = require('./routes/session');
const choiceRouter = require('./routes/choice');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/session', sessionRouter);
app.use('/choice', choiceRouter);

app.listen(PORT, () => {
    console.log(`App running on ${PORT}!`);
});
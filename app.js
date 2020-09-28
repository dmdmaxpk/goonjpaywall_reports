const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const swStats = require('swagger-stats');

// Import database models
require('./models/Report');

// Connection to Database
const config = require('./config');

mongoose.connect(config.mongoDB['paywallReports']);
mongoose.connection.on('error', err => console.error(`Error: ${err.message}`));

const app = express();

app.use(swStats.getMiddleware({}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mongoSanitize());

// Import routes
app.use('/', require('./routes/index'));

// Start Server
let { port } = config;
app.listen(port, () => {
    console.log(`APP is running on port ${port}`);
});
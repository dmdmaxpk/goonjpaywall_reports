const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const cors = require('cors');

// Import database models
require('./models/Report');
require('./models/SubscriberReport');
require('./models/AffiliateReport');

// Connection to Database
const config = require('./config');
mongoose.connect(config.mongoDB['goonj_paywall_reports']);
mongoose.connection.on('error', err => console.error(`Error: ${err.message}`));

const app = express();

// Middlewares
app.use(cors());
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
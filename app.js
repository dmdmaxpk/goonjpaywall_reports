const express = require('express');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// Import database models
require('./models/Report');
require('./models/SubscriberReport');
require('./models/AffiliateReport');
require('./models/ChurnReport');
require('./models/PayingUser');
require('./models/Revenue');

// Connection to Database
const config = require('./config');
mongoose.connect(config.mongoDB['goonj_paywall_reports'], {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false});
mongoose.connection.on('error', err => console.error(`Error: ${err.message}`));

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(mongoSanitize());

// Import routes
app.use('/', require('./routes/index'));

var CronJob = require('cron').CronJob;
var job = new CronJob('3 1 * * *', function() {
    console.log('paywall daily reporting cron: ' + (new Date()));

    axios.get(config.base_path + "/cron/cron-compute-daily-data-reports")
    .then(function(response){
        console.log('paywall daily - response.data: ', response.data);
    })
    .catch(function(err){
        console.log('paywall daily - err: ', err);
    });
}, null, true, 'Asia/Karachi');
job.start();

var CronJob = require('cron').CronJob;
var job = new CronJob('0 09 1 * *', function() {
    console.log('paywall monthly reporting cron: ' + (new Date()));

    axios.get(config.base_path + "/cron/cron-compute-monthly-data-reports")
    .then(function(response){
        console.log('paywall monthly - response.data: ', response.data);
    })
    .catch(function(err){
        console.log('paywall monthly - err: ', err);
    });
}, null, true, 'America/Los_Angeles');
job.start();

// Start Server
let { port } = config;
app.listen(port, () => {
    console.log(`APP is running on port ${port}`);

    console.log('paywall monthly reporting cron: ' + (new Date()));

    axios.get(config.base_path + "/cron/cron-compute-monthly-data-reports")
    .then(function(response){
        console.log('paywall monthly - response.data: ', response.data);
    })
    .catch(function(err){
        console.log('paywall monthly - err: ', err);
    });
});
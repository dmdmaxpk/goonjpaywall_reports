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


var CronJob = require('cron').CronJob;
var job = new CronJob('15 5 * * *', function() {
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


// Start Server
let { port } = config;
app.listen(port, () => {
    console.log(`APP is running on port ${port}`);
});
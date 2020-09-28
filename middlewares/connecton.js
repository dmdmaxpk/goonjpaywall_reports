const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

const config = require('./../config');
let url = require('url');

let connect = async (req, res, next) => {
    check(req, res, next)
};

function check(req, res, next) {
    if (url.pathname === 'reports'){
        if (mongoose.connection.name !== 'goonj_paywall_reports'){
            updateConnection('goonj_paywall_reports', req, res, next);
        }
    }
    else
    {
        if (mongoose.connection.name !== 'goonjpaywall'){
            updateConnection('goonjpaywall', req, res, next);
        }
    }

    res.status(403).send("Database Access Denied");
}

function updateConnection(db, req, res, next) {

    console.log('config.mongoDB[db]: ', config.mongoDB[db]);
    MongoClient.connect("mongodb://localhost:27017/", async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("Database Access Denied");
        }else{
            console.error('client.db(db): ', client.db(db));

            req.db = client.db(db);
            next();
        }
    });

    // mongoose.connect(config.mongoDB[db]);
    // mongoose.connection.on('error', err => {
    //     console.error(`Error: ${err.message}`);
    //     res.status(403).send("Database Access Denied");
    // });
    // mongoose.connection.on('connected', connectionString => {
    //     console.log('Database Connection is updated successfully. Connection String: ', connectionString, db);
    //     next();
    // });
}


module.exports = {
    connect: connect
};
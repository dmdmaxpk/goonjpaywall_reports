const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
let url = require('url');

let connect = async (req, res, next) => {
    console.log('config.mongoDB[\'goonjpaywall\']: ', config.mongoDB['goonjpaywall']);
    await MongoClient.connect(config.mongoDB['goonjpaywall'], async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("goonjpaywall - Database Access Denied");
        }else{
            req.db = client.db('goonjpaywall');
            console.log('======================='); return;
            next();
        }
    });
};

let connect1 = async (req, res, next) => {
    await check(req, res, next)
};

let check = async (req, res, next) => {
    if (url.pathname === 'reports'){
        if (mongoose.connection.name !== 'goonj_paywall_reports')
            await updateConnection('goonj_paywall_reports', req, res, next);
    }
    else
    {
        if (mongoose.connection.name !== 'goonjpaywall')
            await updateConnection('goonjpaywall', req, res, next);
    }
};

let updateConnection = async (db, req, res, next) => {
    await MongoClient.connect("mongodb://localhost:27017/", async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("Database Access Denied-2");
        }else{
            req.db = client.db(db);
            console.log('=======================', )
            next();
        }
    });
};


module.exports = {
    connect: connect,
    check: check,
    updateConnection: updateConnection
};
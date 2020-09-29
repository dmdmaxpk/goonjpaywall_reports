const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
const helper = require('./../helper/helper');
let url = require('url');

let connect = async (req, res, next) => {
    await check(req, res, next)
};

let check = async (req, res, next) => {
    console.log('isConnected: ', helper.isConnected);
    if (!helper.isConnected)
        await updateConnection(req, res, next);
};

let updateConnection = async (req, res, next) => {
    console.log('config.mongoDB: ', config.mongoDB['goonjpaywall']);
    await MongoClient.connect(config.mongoDB['goonjpaywall'], async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("goonjpaywall - Database Access Denied");
        }else{
            req.db = client.db('goonjpaywall');
            helper.isConnected = true;
            console.log('======================='); return;
            next();
        }
    });
};


module.exports = {
    connect: connect,
    check: check,
    updateConnection: updateConnection
};
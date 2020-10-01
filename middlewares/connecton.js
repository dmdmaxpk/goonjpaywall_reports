var MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
const helper = require('./../helper/helper');

let connect = async (req, res, next) => {
    if (!helper.paywallIsConnected())
        await updateConnection(req, res, next);

    next();
};

let updateConnection = async (req, res, next) => {
    await MongoClient.connect(config.mongoDB['goonjpaywall'], async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("goonjpaywall - Database Access Denied");
        }else{
            req.db = client.db('goonjpaywall');
            helper.connectPaywall();
            next();
        }
    });
};

module.exports = {
    connect: connect
};
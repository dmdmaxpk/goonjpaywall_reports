var MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
const helper = require('./../helper/helper');

let connect = async (req, res, next) => {
    console.log('helper.getDBInstance(): ', helper.getDBInstance(), typeof helper.getDBInstance());
    if (helper.getDBInstance() === 'undefined')
        await updateConnection(req, res, next);
    else
        req.db = helper.getDBInstance();

    console.log('req.db: ', req.db);
    next();
};

let updateConnection = async (req, res, next) => {
    await MongoClient.connect(config.mongoDB['goonjpaywall'], async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("goonjpaywall - Database Access Denied");
        }else{
            req.db = client.db('goonjpaywall');
            helper.setDBInstance(req.db);
            next();
        }
    });
};

module.exports = {
    connect: connect
};
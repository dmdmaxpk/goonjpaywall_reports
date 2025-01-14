var MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');

const config = require('./../config');
const helper = require('./../helper/helper');

let connect = async (req, res, next) => {
    let connectType = '';
    if (req.url.includes('logger') || req.url.includes('ccd'))
        connectType = 'logger';
    else if (req.url.includes('watch-time'))
        connectType = 'streamlogs';
    else
        connectType = 'goonjpaywall';

    if (!helper.getDBInstance())
        await updateConnection(req, res, next, connectType);
    else{
        req.db = helper.getDBInstance();
        console.log('req.db.databaseName: ', req.db.databaseName);

        if (req.db.databaseName !== connectType){
            console.log('=================: ');
            await updateConnection(req, res, next, connectType);
        }

        next();
    }
};


let updateConnection = async (req, res, next, connectType) => {
    return new Promise(async (resolve, reject) => {
        console.log('updateConnection - config.mongoDB: ', config.mongoDB[connectType]);

        const option = {
            poolSize: 10, // Maintain up to 10 socket connections
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 3000000,
            socketTimeoutMS: 3000000, // Close sockets after 45 seconds of inactivity
            serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 5 seconds
        };

        await MongoClient.connect(config.mongoDB[connectType], option, function (err, client) {
            if(err){
                console.error(`Error: ${err.message}`);
                res.status(403).send(connectType, "  - Database Access Denied");
            }else{
                req.db = client.db(connectType);
                console.log('updateConnection - req.db: ', connectType);

                helper.setDBInstance(req.db);

                if (next !== null)
                    resolve(next());
                else
                    resolve(true);
            }
        });
    });
};

module.exports = {
    connect: connect,
    updateConnection: updateConnection
};
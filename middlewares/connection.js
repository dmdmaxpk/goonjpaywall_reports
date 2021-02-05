var MongoClient = require('mongodb').MongoClient;
const config = require('./../config');
const helper = require('./../helper/helper');

let connect = async (req, res, next) => {

    let connectType = '';
    if (req.url.includes('logger') || req.url.includes('ccd'))
        connectType = 'logger';
    else
        connectType = 'goonjpaywall';

    console.log('connectionType: ', connectType);
    if (!helper.getDBInstance())
        await updateConnection(req, res, next, connectType);
    else{
        req.db = helper.getDBInstance();
        if (req.db.databaseName !== connectType)
            await updateConnection(req, res, next, connectType);

        next();
    }
};


let updateConnection = async (req, res, next, connectType) => {
    return new Promise(async (resolve, reject) => {
            await MongoClient.connect(config.mongoDB[connectType],  async function (err, client) {
            if(err){
                console.error(`Error: ${err.message}`);
                res.status(403).send(connectType, "  - Database Access Denied");
            }else{

                console.log('connectType: ', connectType);
                req.db = await client.db(connectType);
                await helper.setDBInstance(req.db);

                console.log('req.db: ', req.db);

                if (next !== null)
                    resolve(next());
                else{
                    console.log('connectType::::::::::::::::::::::::::::::: ', connectType);
                    resolve(true);
                }
            }
        });
    });
};

module.exports = {
    connect: connect,
    updateConnection: updateConnection
};
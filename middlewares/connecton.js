var MongoClient = require('mongodb').MongoClient;

let connect = async (req, res, next) => {
    await check(req, res, next);
    await MongoClient.connect("mongodb://localhost:27017/", async function(err, client) {
        if(err){
            console.error(`Error: ${err.message}`);
            res.status(403).send("goonjpaywall - Database Access Denied");
        }else{
            req.db = client.db('goonjpaywall');
            console.log('=======================');
            next();
        }
    });
};


module.exports = {
    connect: connect
};
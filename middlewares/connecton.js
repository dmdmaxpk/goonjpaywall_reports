const config = require('../config');
let url = require('url');

let connect = async (req, res, next) => {
    this.check(req, res, next)
};

let check = async (req, res, next) => {
    if (url.pathname === 'reports'){
        if (mongoose.connection.name !== 'goonjPaywallReports'){
            req.db = 'goonjPaywallReports';
            this.updateConnection('goonjPaywallReports', res, next);
        }
    }
    else
    {
        if (mongoose.connection.name !== 'goonjpaywall'){
            req.db = 'goonjpaywall';
            this.updateConnection('goonjpaywall', res, next);
        }
    }

    res.status(403).send("Database Access Denied");
};

let updateConnection = async (db, res, next) => {

    mongoose.connect(config.mongoDB[db]);
    mongoose.connection.on('error', err => {
        console.error(`Error: ${err.message}`);
        res.status(403).send("Database Access Denied");
    });
    mongoose.connection.on('connected', connectionString => {
        console.log('Database Connection is updated successfully. Connection String: ', connectionString);
        next();
    });
};


module.exports = {
    check: check,
    connect: connect,
    updateConnection: updateConnection
};
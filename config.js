const env = process.env.NODE_ENV || 'development';

let config = {
    development: {
        port: '3006',
        mongoDB: {
            goonjpaywall: 'mongodb://localhost:27017',
            goonj_paywall_reports: 'mongodb://localhost:27017/goonj_paywall_reports'
        }
    },
    staging: {
        port: '3006',
        mongoDB: {
            goonjpaywall: 'mongodb://mongodb:27017',
            goonj_paywall_reports: 'mongodb://mongodb:27017/goonj_paywall_reports'
        }
    },
    production: {
        port: process.env.PW_PORT,
        mongoDB: process.env.PW_MONGO_DB_URL
    }
};

console.log("======", env);

if (env === 'development') config = config.development;
if (env === 'staging') config = config.staging;
if (env === 'production') config = config.production;

module.exports = config;

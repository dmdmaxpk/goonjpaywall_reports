const env = process.env.NODE_ENV || 'development';
const paywall_base_url = 'http://127.0.0.1:5001/';

let config = {
    development: {
        port: '5005',
        mongoDB: {
            goonjpaywall: 'mongodb://localhost:27017/goonjpaywall',
            goonjPaywallReports: 'mongodb://localhost:27017/goonjPaywallReports',
        },
        paywall_base_url: paywall_base_url
    },
    staging: {
        port: '5005',
        mongoDB: {
            goonjpaywall: 'mongodb://mongodb:27017/goonjpaywall',
            goonjPaywallReports: 'mongodb://mongodb:27017/goonjPaywallReports',
        },
        paywall_base_url: paywall_base_url
    },
    production: {
        port: process.env.PW_PORT,
        mongoDB: process.env.PW_MONGO_DB_URL,
        paywall_base_url: paywall_base_url
    }
};

console.log("---", env);

if (env === 'development') config = config.development;
if (env === 'staging') config = config.staging;
if (env === 'production') config = config.production;

module.exports = config;

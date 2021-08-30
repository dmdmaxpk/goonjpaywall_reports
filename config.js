const env = process.env.NODE_ENV || 'development';

const port = '3006';
const base_path = 'http://localhost:'+port;
const cron_db_query_data_limit = 300000;
let config = {
    development: {
        port: port,
        base_path: base_path,
        mongoDB: {
            logger: 'mongodb://localhost:27017',
            streamlogs: 'mongodb://10.0.1.70:27017',
            goonjpaywall: 'mongodb://localhost:27017',
            goonj_paywall_reports: 'mongodb://localhost:27017/goonj_paywall_reports'
        },
        cron_db_query_data_limit: cron_db_query_data_limit
    },
    staging: {
        port: port,
        base_path: base_path,
        mongoDB: {
            logger: 'mongodb://mongodb:27017',
            streamlogs: 'mongodb://mongodb:27017',
            goonjpaywall: 'mongodb://mongodb:27017',
            goonj_paywall_reports: 'mongodb://mongodb:27017/goonj_paywall_reports'
        },
        cron_db_query_data_limit: cron_db_query_data_limit
    },
    production: {
        base_path: base_path,
        port: process.env.PW_PORT,
        mongoDB: process.env.PW_MONGO_DB_URL,
        cron_db_query_data_limit: cron_db_query_data_limit
    }
};

console.log("======", env);

config = config.development;
// if (env === 'development') config = config.development;
// if (env === 'staging') config = config.staging;
// if (env === 'production') config = config.production;

module.exports = config;

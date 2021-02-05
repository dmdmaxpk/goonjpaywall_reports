const container = require("../../../configurations/container");
const ccdApiDataRepo = container.resolve('ccdApiDataRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

getCcdApiData = async(req, res) => {
    console.log('getCcdApiData: ');
    let dateData, fromDate, toDate, computedData = [];

    dateData = helper.computeDateFromMonth(req.query);
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('getCcdApiData: ', req.method, dateData);
    await ccdApiDataRepo.getDataFromLogger(req, fromDate, toDate).then(async function (logData) {
        console.log('api data: ', logData.length);

        if (logData.length > 0){
            // computedData = computeAffiliateData(subscriptions);
            // //affiliateWise, statusWise, packageWise, sourceWise
            // await insertNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, fromDate);
        }
    });

};


module.exports = {
    getCcdApiData: getCcdApiData,
};
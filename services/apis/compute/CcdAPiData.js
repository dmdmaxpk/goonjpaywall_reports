const container = require("../../../configurations/container");
const ccdApiDataRepo = container.resolve('ccdApiDataRepo');
const helper = require('../../../helper/helper');
const _ = require('lodash');
const moment = require('moment');

getCcdApiData = async(req, res) => {
    console.log('getCcdApiData: ');
    let dateData, fromDate, toDate, computedData = [];

    dateData = helper.computeDateFromMonth(req.query);
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('getCcdApiData: ', dateData);
    await ccdApiDataRepo.getDataFromLogger(req, fromDate, toDate).then(async function (logData) {
        console.log('api data: ', logData.length);

        if (logData.length === 0)
            logData = [];

        res.send({status: true, computedData: logData});
        return true;
    });
};


module.exports = {
    getCcdApiData: getCcdApiData,
};
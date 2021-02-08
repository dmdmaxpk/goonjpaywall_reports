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

        let history = {}, newObj = {};
        if (logData.length > 0){
            for (let j = 0; j < logData.length; j++) {
                history = logData[j];

                newObj = {};
                newObj.id = Math.random().toString(36).slice(2);
                newObj.service = 'Goonj';
                newObj.channel = 'IVR';
                newObj.msisdn = history.req_body.msisdn;

                if (history.res_body){
                    newObj.api_service_response = JSON.stringify(history.res_body);
                    if (history.res_body.message === 'Requested subscriptions has unsubscribed!')
                        newObj.service_deactivation = 'Yes';
                    else
                        newObj.service_deactivation = 'No';
                }
                else{
                    newObj.api_service_response = 'Null';
                    newObj.service_deactivation = 'No';
                }

                if (history.method === 'ccd_details')
                    newObj.api_type = 'Details';
                else
                    newObj.api_type = 'Unsub';

                newObj.added_dtm = moment(history.added_dtm).format("ddd, MMM Do YYY, h:mm a");
                computedData.push(newObj)
            }
        }

        res.send({status: true, computedData: computedData});
        return true;
    });
};


module.exports = {
    getCcdApiData: getCcdApiData,
};
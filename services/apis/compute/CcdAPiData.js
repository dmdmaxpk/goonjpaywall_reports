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
                    if (history.res_body.code === 0){
                        newObj.service_status_responce = 'Active';
                        newObj.service_deactivation = 'Yes';

                        let data = history.res_body.data;
                        let expiry = data.expiry;

                        if (expiry.length === 0)
                            newObj.service_deactivation_responce = 'Success';
                        else
                            newObj.service_deactivation_responce = 'Failure';
                    }
                    else{
                        newObj.service_deactivation_responce = 'Failure';
                        newObj.service_status_responce = 'Inactive';
                        newObj.service_deactivation = 'No';
                    }
                }
                else{
                    newObj.service_deactivation_responce = 'Failure';
                    newObj.service_status_responce = 'Inactive';
                    newObj.service_deactivation = 'No';
                }

                newObj.added_dtm = moment(history.added_dtm).format("ddd, MMM Do YYY, h:mm a");;
                computedData.push(newObj)
            }
        }

        let responseObj = {status: true, computedData: computedData};
        console.log('responseObj: ');

        return responseObj;
    });
};


module.exports = {
    getCcdApiData: getCcdApiData,
};
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

    console.log('getCcdApiData: ', dateData);
    await ccdApiDataRepo.getDataFromLogger(req, fromDate, toDate).then(async function (logData) {
        console.log('api data: ', logData.length);

        let history = {}, newObj = {};
        if (logData.length > 0){
            for (let j = 0; j < logData.length; j++) {
                history = logData[j];

                console.log('history: ', history);

                newObj = {};
                newObj.id = history._id;
                newObj.service = 'Goonj';
                newObj.channel = 'IVR';
                newObj.msisdn = history.req_body.msisdn;

                console.log('history.res_body.code: ', history.res_body.code);
                if (history.res_body.code === 0){
                    newObj.service_status_responce = 'Active';
                    newObj.service_deactivation_responce = 'Yes';


                    let data = history.res_body.data;
                    let expiry = data.expiry;

                    console.log('expiry: ', expiry);

                    if (expiry.length === 0){
                        newObj.service_deactivation_responce = 'Success';
                    }
                    else{
                        newObj.service_deactivation_responce = 'Failure';
                    }
                }
                else{
                    newObj.service_status_responce = 'Inactive';
                    newObj.service_deactivation_responce = 'No';
                }

                newObj.added_dtm = history.added_dtm;

                console.log('newObj: ', newObj);
                computedData.push(newObj)
            }
        }

        res.send({status: true, computedData: computedData});
    });
};


module.exports = {
    getCcdApiData: getCcdApiData,
};
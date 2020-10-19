const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../helper/helper');
const config = require('../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, hoursFromISODate, finalList = [];
let lastRecode, fetchedRecordsLength = 0, dataLimit = config.cron_db_query_data_limit;

computeCallbackSendReports = async(req, res) => {
    console.log('computeCallbackSendReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    if (fetchedRecordsLength === 0 || fetchedRecordsLength < dataLimit){
        dateData = helper.computeNextDate(req, 1, 7);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
    }

    console.log('computeCallbackSendReports: ', fromDate, toDate);
    subscriptionRepo.getCallbackSendByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions.length);
        fetchedRecordsLength = subscriptions.length;

        if (fetchedRecordsLength > 0){
            finalList = computeUserData(subscriptions);
            insertNewRecord(finalList,  new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        if (fetchedRecordsLength < dataLimit)
            req.day = Number(req.day) + 1;

        console.log('-> day : ', day, req.day, helper.getDaysInMonth(month));
        if (req.day <= helper.getDaysInMonth(month)){
            console.log('dataLimit - fetchedRecordsLength: ', dataLimit, fetchedRecordsLength);
            if (fetchedRecordsLength < dataLimit) {
                console.log('Yes less: ', fetchedRecordsLength < dataLimit);
                if (month < helper.getTodayMonthNo())
                    computeCallbackSendReports(req, res);
                else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                    computeCallbackSendReports(req, res);
            }
            else{
                console.log('Yes greater  - fromDate before: ', fromDate);
                lastRecode = subscriptions[fetchedRecordsLength - 1];
                fromDate = _.clone(lastRecode.added_dtm);
                console.log('Yes greater  - fromDate after: ', fromDate);

                computeCallbackSendReports(req, res);
            }
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('-> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeCallbackSendReports(req, res);
        }
    });
};

function computeUserData(subscriptions) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];
        newObj = {callbackSent : 0, added_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = helper.setDate(new Date(outerObj.subscription_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.isCallbAckSent !== 'no')
                        newObj.callbackSent = newObj.callbackSent + 1;

                    newObj.added_dtm = outerObj.subscription_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return finalList;
}

function insertNewRecord(data, dateString) {
    hoursFromISODate = _.clone(dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0){
            result = result[0];
            if (helper.splitHoursFromISODate(hoursFromISODate))
                result.callbackSend = data;
            else
                result.callbackSend.concat(data);

            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({callbackSend: data, date: dateString});
    });
}


module.exports = {
    computeCallbackSendReports: computeCallbackSendReports,
};
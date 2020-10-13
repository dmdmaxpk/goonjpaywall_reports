const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../helper/helper');
const  _ = require('lodash');


computeCallbackSendReports = async(req, res) => {
    console.log('computeCallbackSendReports');
    let fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 2, 1);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeCallbackSendReports: ', fromDate, toDate);
    subscriptionRepo.getCallbackSendByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions.length);

        if (subscriptions.length > 0){
            finalList = computeUserData(subscriptions);

            console.log('finalList.length : ', finalList.length, finalList);
            if (finalList.length > 0)
                insertNewRecord(finalList,  new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getCallbackSendByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeCallbackSendReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeCallbackSendReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getCallbackSendByDateRange -> month : ', month, req.month, new Date().getMonth());

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
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result calbackSend: ', result);
        console.log('data calbackSend: ', data);
        if (result.length > 0){
            result = result[0];
            result.callbackSend = data;
            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({callbackSend: data, date: dateString});
    });
}


module.exports = {
    computeCallbackSendReports: computeCallbackSendReports,
};
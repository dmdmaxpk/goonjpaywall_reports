const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');

const subscriptionRepo = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeCallbackSendReports = async(req, res) => {
    console.log('computeCallbackSendReports');

    let fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    day = req.day ? req.day : 1;
    day = day > 9 ? day : '0'+Number(day);
    req.day = day;

    month = req.month ? req.month : 2;
    month = month > 9 ? month : '0'+Number(month);
    req.month = month;

    console.log('day : ', day, req.day);
    console.log('month : ', month, req.month);

    fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
    toDate  = _.clone(fromDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    console.log('computeCallbackSendReports: ', fromDate, toDate);
    subscriptionRepo.getCallbackSendByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions.length);

        if (subscriptions.length > 0){
            finalList = computeUserData(subscriptions);

            console.log('finalList.length : ', finalList.length, finalList);
            if (finalList.length > 0)
                insertNewRecord(finalList,  new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getCallbackSendByDateRange -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeCallbackSendReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getCallbackSendByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeCallbackSendReports(req, res);
        }
    });
};

function computeUserData(subscriptions) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];
        newObj = {callbackSent : 0, added_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = setDate(new Date(outerObj.subscription_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.isCallbAckSent !== 'no')
                        newObj.callbackSent = newObj.callbackSent + 1;

                    newObj.added_dtm = outerObj.subscription_dtm;
                    newObj.added_dtm_hours = setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0);
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

function setDate(date, h=null,m, s, mi){
    if (h !== null)
        date.setHours(h);

    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}

function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    computeCallbackSendReports: computeCallbackSendReports,
};
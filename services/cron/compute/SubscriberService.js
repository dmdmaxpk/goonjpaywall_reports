const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriberRepo = container.resolve('subscriberRepository');
const helper = require('../../../helper/helper');

let fromDate, toDate, day, month, finalList = [];

computeSubscriberReports = async(req, res) => {
    console.log('computeSubscriberReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */

    // dateData = helper.computeTodayDate(req);
    dateData = helper.computeNextDate(req, 1, 2);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeSubscriberReports: ', fromDate, toDate);
    await subscriberRepo.getSubscribersByDateRange(req, fromDate, toDate).then(async function (subscribers) {
        console.log('subscribers: ', subscribers.length);

        if (subscribers.length > 0){
            finalList = computeSubscriberData(subscribers);

            console.log('finalList.length : ', finalList.total.length);
            if (finalList.total.length > 0)
                await insertNewRecord(finalList, fromDate);
        }
    });


    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('computeSubscriberReports -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        if (month < helper.getTodayMonthNo())
            computeSubscriberReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            computeSubscriberReports(req, res);
    }
    else{
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('computeSubscriberReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeSubscriberReports(req, res);
    }

    return true;
};

function computeSubscriberData(subscribers) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = {total: []};
    for (let j=0; j < subscribers.length; j++) {

        outerObj = subscribers[j];
        newObj = {total : 0, added_dtm: ''};
        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscribers.length; k++) {

                innerObj = subscribers[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    newObj.total = newObj.total + 1;

                    newObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            finalList.total.push(newObj);
        }
    }

    return finalList;
}

async function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];
            result.subscribers = data;
            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({subscribers: data, date: dateString});
    });
}

module.exports = {
    computeSubscriberReports: computeSubscriberReports,
};
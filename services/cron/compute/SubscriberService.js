const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriberRepo = container.resolve('subscriberRepository');
const helper = require('../../../helper/helper');

let dateData, fromDate, toDate, day, month, finalList = [];

computeSubscriberReports = async(req, res) => {
    console.log('computeSubscriberReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 30, 8);
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
    console.log('getSubscribersByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeSubscriberReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeSubscriberReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getSubscribersByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeSubscriberReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeSubscriberReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeSubscriberReports = async(req, res) => {
    console.log('promiseBasedComputeSubscriberReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeTodayDate(req);
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

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeSubscriberReports - data compute - done');
            delete req.day;
            delete req.month;
        }

        resolve(0);
    });
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
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

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
    promiseBasedComputeSubscriberReports: promiseBasedComputeSubscriberReports,
};
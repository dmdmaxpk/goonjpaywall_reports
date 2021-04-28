const container = require("../../../configurations/container");
const ChurnRepoAPi = require('../../../repos/apis/ChurnRepo');
const statisticsRepo = container.resolve('statisticsRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
computeRequestCountReports = async(req, res) => {
    console.log('computeRequestCountReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 1);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeRequestCountReports: ', fromDate, toDate);
    await statisticsRepo.getRequestCountByDateRange(req, fromDate, toDate).then(async function (requestCounts) {
        console.log('requestCounts.length: ', requestCounts);

        if (requestCounts.length > 0){
            finalList = computeRequestCountData(requestCounts);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecord(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeRequestCountReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeRequestCountReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeRequestCountReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeRequestCountReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};
promiseBasedComputeRequestCountReports = async(req, res) => {
    console.log('promiseBasedComputeRequestCountReports: ');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeRequestCountReports: ', fromDate, toDate);
        await statisticsRepo.getRequestCountByDateRange(req, fromDate, toDate).then(async function (requestCounts) {
            console.log('requestCounts.length: ', requestCounts.length);

            if (requestCounts.length > 0){
                finalList = computeRequestCountData(requestCounts);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertDailyBaseChargeNewRecord(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeRequestCountReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computeDailyBaseChargeReports = async(req, res) => {
    console.log('computeDailyBaseChargeReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 1);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeDailyBaseChargeReports: ', fromDate, toDate);
    await statisticsRepo.getRequestCountByDateRange(req, fromDate, toDate).then(async function (dailyBaseCharge) {
        console.log('dailyBaseCharge: ', dailyBaseCharge);

        if (dailyBaseCharge.length > 0) await insertDailyBaseChargeNewRecord(dailyBaseCharge[0], fromDate);
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('computeNextDateWithLocalTime -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeDailyBaseChargeReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeDailyBaseChargeReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('computeNextDateWithLocalTime -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeDailyBaseChargeReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeDailyBaseChargeReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};
promiseBasedComputeDailyBaseChargeReports = async(req, res) => {
    console.log('promiseBasedComputeDailyBaseChargeReports: ');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeDailyBaseChargeReports: ', fromDate, toDate);
        await statisticsRepo.getDailyBaseChargeByDateRange(req, fromDate, toDate).then(async function (dailyBaseCharge) {
            console.log('dailyBaseCharge.length: ', dailyBaseCharge.length);

            if (dailyBaseCharge.length) await insertDailyBaseChargeNewRecord(dailyBaseCharge[0], fromDate);
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeDailyBaseChargeReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeRequestCountData(records) {
    let newObj = {}, success = 0, graced = 0, finalList = [];

    for (const record of records) {
        if (record._id === 'Success'){
            success = record.count;
            newObj.success = record.count;
        }
        if (record._id === 'graced'){
            graced = record.count;
            newObj.graced = record.count;
        }
    }

    newObj.total = success + graced;
    console.log('newObj: ', newObj);
    finalList.push(newObj);

    return finalList;
}

async function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await ChurnRepoAPi.getChurnByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.requestCount = data;

            await ChurnRepoAPi.updateChurnReport(result, result._id);
        }
        else
            await ChurnRepoAPi.createChrunReport({requestCount: data, date: dateString});
    });
}

async function insertDailyBaseChargeNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertDailyBaseChargeNewRecord', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    console.log('data: ', data)

    await ChurnRepoAPi.getChurnByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.baseCharge = data.count;
            console.log('result.baseCharge: ', result.baseCharge)
            await ChurnRepoAPi.updateChurnReport(result, result._id);
        }
        else
            await ChurnRepoAPi.createChrunReport({requestCount: data, date: dateString});
    });
}


module.exports = {
    computeRequestCountReports: computeRequestCountReports,
    promiseBasedComputeRequestCountReports: promiseBasedComputeRequestCountReports,

    computeDailyBaseChargeReports: computeDailyBaseChargeReports,
    promiseBasedComputeDailyBaseChargeReports: promiseBasedComputeDailyBaseChargeReports,
};
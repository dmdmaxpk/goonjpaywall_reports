const container = require("../../../configurations/container");
const ChurnRepoAPi = require('../../../repos/apis/ChurnRepo');
const churnRepo = container.resolve('churnRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
computeChurnReports = async(req, res) => {
    console.log('computeChurnReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 3);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeChurnReports: ', fromDate, toDate);
    await churnRepo.getChurnByDateRange(req, fromDate, toDate).then(async function (churn) {
        console.log('churn.length: ', churn);

        if (churn.length > 0){
            finalList = computeChurnData(churn);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecord(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', day, req.day, month, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        console.log('if - 1: ', month, helper.getTodayMonthNo(), ' - ', month < helper.getTodayMonthNo());
        console.log('if - 2: ', req.day, helper.getTodayDayNo(), ' - ', month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo());

        if (month < helper.getTodayMonthNo()){
            console.log('if-----: ');
            computeChurnReports(req, res);
        }
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo()){
            console.log('else if-----: ');
            computeChurnReports(req, res);
        }
    }
    else{
        console.log('else - 1: ', req.month, helper.getTodayMonthNo());

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeChurnReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeChurnReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};
promiseBasedComputeChurnReports = async(req, res) => {
    console.log('promiseBasedComputeChurnReports: ');
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

        console.log('computeChurnReports: ', fromDate, toDate);
        await churnRepo.getChurnByDateRange(req, fromDate, toDate).then(async function (churn) {
            console.log('churn.length: ', churn.length);

            if (churn.length > 0){
                finalList = computeChurnData(churn);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecord(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeChurnReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeChurnData(records) {
    let newObj = {}, success = 0, expired = 0, finalList = [];
    for (const record of records) {
        if (record._id === 'Success'){
            success = record.count;
            newObj.success = record.count;
        }
        if (record._id === 'expired'){
            expired = record.count;
            newObj.expired = record.count;
        }
    }

    newObj.churn = success - expired;
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
            result.churn = data;

            await ChurnRepoAPi.updateChurnReport(result, result._id);
        }
        else
            await ChurnRepoAPi.createChrunReport({churn: data, date: dateString});
    });
}


module.exports = {
    computeChurnReports: computeChurnReports,
    promiseBasedComputeChurnReports: promiseBasedComputeChurnReports,
};
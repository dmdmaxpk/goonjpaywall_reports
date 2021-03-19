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
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        console.log('if - 1: ', Number(month), Number(helper.getTodayMonthNo()), ' - ', Number(month) < Number(helper.getTodayMonthNo()));
        console.log('if - 2: ', Number(req.day), Number(helper.getTodayDayNo()), ' - ', Number(month) === Number(helper.getTodayMonthNo()),  Number(req.day) <= Number(helper.getTodayDayNo()));

        if (Number(month) < Number(helper.getTodayMonthNo())){
            console.log('if-----: ');
            computeChurnReports(req, res);
        }
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo())){
            console.log('else if-----: ');
            computeChurnReports(req, res);
        }
    }
    else{
        console.log('else - 1: ', req.month, helper.getTodayMonthNo());

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
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
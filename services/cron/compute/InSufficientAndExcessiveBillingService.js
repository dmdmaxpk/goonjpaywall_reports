const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeInsufficientBalanceReports = async(req, res) => {
    console.log('computeInsufficientBalanceReports: ');
    let dateData, fromDate, toDate, day, month;

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

    console.log('computeInsufficientBalanceReports: ', fromDate, toDate);
    await billingHistoryRepo.getInsufficientBalanceByDateRange(req, fromDate, toDate).then(async function (insufficientBalance) {
        console.log('insufficientBalance: ', insufficientBalance);

        if (insufficientBalance.length > 0)
            insufficientBalance = insufficientBalance[0];
        else{
            insufficientBalance = {};
            insufficientBalance.count = 0;
        }

        console.log('insufficientBalance - 1: ', insufficientBalance);
        await insertInsufficientBalanceNewRecord(insufficientBalance, fromDate);

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeInsufficientBalanceReports -> day : ', day, req.day, month, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo()){
                console.log('1: ');
                computeInsufficientBalanceReports(req, res);
            }
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo()){
                console.log('2: ');
                computeInsufficientBalanceReports(req, res);
            }
            else if(helper.yearsDifferenceWise){
                console.log('3: ');
                computeInsufficientBalanceReports(req, res);
            }
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeInsufficientBalanceReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo()){
                console.log('4: ');
                computeInsufficientBalanceReports(req, res);
            }
        }

        if (helper.isToday(fromDate)){
            console.log('computeInsufficientBalanceReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeInsufficientBalanceReports = async(req, res) => {
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate;

        console.log('promiseBasedComputeInsufficientBalanceReports: ');

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeInsufficientBalanceReports: ', fromDate, toDate);
        await billingHistoryRepo.getInsufficientBalanceByDateRange(req, fromDate, toDate).then(async function (insufficientBalance) {
            console.log('insufficientBalance: ', insufficientBalance);

            if (insufficientBalance.length > 0)
                insufficientBalance = insufficientBalance[0];
            else{
                insufficientBalance = {};
                insufficientBalance.count = 0;
            }

            console.log('insufficientBalance - 1: ', insufficientBalance);
            await insertInsufficientBalanceNewRecord(insufficientBalance, fromDate);
        });


        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeInsufficientBalanceReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computeExcessiveBillingReports = async(req, res) => {
    console.log('computeExcessiveBillingReports: ');
    let dateData, fromDate, toDate, day, month;

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 14, 1);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeExcessiveBillingReports: ', fromDate, toDate);
    await billingHistoryRepo.getExcessiveBillingCountByDateRange(req, fromDate, toDate).then(async function (excessiveBillingCount) {
        console.log('excessiveBillingCount: ', excessiveBillingCount.length);

        if (excessiveBillingCount.length > 0)
            excessiveBillingCount = excessiveBillingCount[0];
        else{
            excessiveBillingCount = {};
            excessiveBillingCount.count = 0;
        }

        console.log('excessiveBillingCount - 1: ', excessiveBillingCount);
        await insertExcessiveBillingNewRecord(excessiveBillingCount, fromDate);

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeExcessiveBillingReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeExcessiveBillingReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeExcessiveBillingReports(req, res);
            else if(helper.yearsDifferenceWise)
                computeExcessiveBillingReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeExcessiveBillingReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeExcessiveBillingReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeExcessiveBillingReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};
promiseBasedComputeExcessiveBillingReports = async(req, res) => {
    console.log('promiseBasedComputeExcessiveBillingReports: ');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate;

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeExcessiveBillingReports: ', fromDate, toDate);
        await billingHistoryRepo.getExcessiveBillingCountByDateRange(req, fromDate, toDate).then(async function (excessiveBillingCount) {
            console.log('excessiveBillingCount: ', excessiveBillingCount.length);

            if (excessiveBillingCount.length > 0)
                excessiveBillingCount = excessiveBillingCount[0];
            else{
                excessiveBillingCount = {};
                excessiveBillingCount.count = 0;
            }

            console.log('excessiveBillingCount - 1: ', excessiveBillingCount);
            await insertExcessiveBillingNewRecord(excessiveBillingCount, fromDate);
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeExcessiveBillingReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

async function insertInsufficientBalanceNewRecord(insufficientBalance, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertInsufficientBalanceNewRecord', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            console.log('if - insufficientBalance: ', insufficientBalance);

            result = result[0];
            result.insufficient_balance = insufficientBalance;

            console.log('result.insufficient_balance: ', result.insufficient_balance);
            await reportsRepo.updateReport(result, result._id);
        }
        else{
            console.log('else - insufficientBalance: ', insufficientBalance);
            await reportsRepo.createReport({
                insufficient_balance: insufficientBalance,
                date: dateString
            });
        }
    });
}
async function insertExcessiveBillingNewRecord(excessiveBillingCount, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertExcessiveBillingNewRecord', dateString);

    console.log('excessiveBillingCount: ', excessiveBillingCount);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.excessive_billing = excessiveBillingCount;

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({
                excessive_billing: excessiveBillingCount,
                date: dateString
            });
    });
}

module.exports = {
    computeInsufficientBalanceReports: computeInsufficientBalanceReports,
    promiseBasedComputeInsufficientBalanceReports: promiseBasedComputeInsufficientBalanceReports,

    computeExcessiveBillingReports: computeExcessiveBillingReports,
    promiseBasedComputeExcessiveBillingReports: promiseBasedComputeExcessiveBillingReports
};
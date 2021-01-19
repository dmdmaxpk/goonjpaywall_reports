const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeInsufficientBalanceReports = async(req, res) => {
    console.log('computeInsufficientBalanceReports: ');
    let dateData, fromDate, toDate, day, month, computedData = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 17, 12);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeInsufficientBalanceReports: ', fromDate, toDate);
    await billingHistoryRepo.getInsufficientBalanceByDateRange(req, fromDate, toDate).then(async function (insufficientBalance) {
        console.log('insufficientBalance: ', insufficientBalance);

        if (insufficientBalance.length > 0){
            insufficientBalance = insufficientBalance.count;
            await insertInsufficientBalanceNewRecord(insufficientBalance, fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeInsufficientBalanceReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeInsufficientBalanceReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeInsufficientBalanceReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeInsufficientBalanceReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeInsufficientBalanceReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeInsufficientBalanceReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeInsufficientBalanceReports = async(req, res) => {
    console.log('promiseBasedComputeInsufficientBalanceReports: ');
    let dateData, fromDate, toDate, day, month;

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 17, 1);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('promiseBasedComputeInsufficientBalanceReports: ', fromDate, toDate);
    await billingHistoryRepo.getInsufficientBalanceByDateRange(req, fromDate, toDate).then(async function (insufficientBalance) {
        console.log('insufficientBalance: ', insufficientBalance);

        if (insufficientBalance.length > 0){
            insufficientBalance = insufficientBalance.count;
            await insertInsufficientBalanceNewRecord(insufficientBalance, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('promiseBasedComputeInsufficientBalanceReports -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        if (month < helper.getTodayMonthNo())
            promiseBasedComputeInsufficientBalanceReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            promiseBasedComputeInsufficientBalanceReports(req, res);
    }
    else{
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('promiseBasedComputeInsufficientBalanceReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            promiseBasedComputeInsufficientBalanceReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('promiseBasedComputeInsufficientBalanceReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeAffiliateReports = async(req, res) => {
    console.log('promiseBasedComputeAffiliateReports: ');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, computedData = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('computeInsufficientBalanceReports: ', fromDate, toDate);
        await billingHistoryRepo.getAffiliateDataByDateRange(req, fromDate, toDate).then(async function (subscriptions) {
            console.log('subscription: ', subscriptions.length);

            if (subscriptions.length > 0){
                computedData = computeInsufficientBalanceData(subscriptions);
                //affiliateWise, statusWise, packageWise, sourceWise
                await insertInsufficientBalanceNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeAffiliateReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};
promiseBasedComputeAffiliateMidsFromSubscriptionsReports = async(req, res) => {
    console.log('promiseBasedComputeAffiliateMidsFromSubscriptionsReports: ');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, affiliateMidsData = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeInsufficientBalanceReports: ', fromDate, toDate);
        await billingHistoryRepo.getAffiliateMidFromSubscriptionsByDateRange(req, fromDate, toDate).then(async function (affiliateMids) {
            console.log('affiliateMids: ', affiliateMids.length);

            if (affiliateMids.length > 0){
                affiliateMidsData = computeAffiliateMidsData(affiliateMids);
                await insertAffiliateMidsNewRecord(affiliateMidsData, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeAffiliateMidsFromSubscriptionsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function insertInsufficientBalanceNewRecord(insufficientBalance, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertInsufficientBalanceNewRecord', dateString);

    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            result.insufficient_balance = insufficientBalance;

            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({
                insufficient_balance: insufficientBalance,
                date: dateString
            });
    });
}
function insertAffiliateMidsNewRecord(affiliateMidsData, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertAffiliateMidsNewRecord', dateString);

    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            result.subscriptions = affiliateMidsData;

            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({
                subscriptions: affiliateMidsData,
                date: dateString
            });
    });
}

module.exports = {
    computeInsufficientBalanceReports: computeInsufficientBalanceReports,
    promiseBasedComputeInsufficientBalanceReports: promiseBasedComputeInsufficientBalanceReports,

    promiseBasedComputeAffiliateReports: promiseBasedComputeAffiliateReports,
    promiseBasedComputeAffiliateMidsFromSubscriptionsReports: promiseBasedComputeAffiliateMidsFromSubscriptionsReports
};
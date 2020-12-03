const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const transactionsRepo = container.resolve('transactionsRepo');
const helper = require('../../../helper/helper');

let dateData, fromDate, toDate, month, computedData;
computeTransactionsAvgPerCustomerReports = async(req, res) => {
    console.log('computeTransactionsAvgPerCustomerReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per month
    * */
    dateData = helper.computeNextMonthDateWithLocalTime(req, 11);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeTransactionsAvgPerCustomerReports: ', fromDate, toDate);
    await transactionsRepo.getTransactionsAvgPerCustomerByDateRange(req, fromDate, toDate).then(async function (transactionRawData) {
        console.log('transactionRawData 1 : ', transactionRawData.length);

        // Now compute and store data in DB
        if (transactionRawData.length > 0){
            computedData = computeTransactionsData(transactionRawData, fromDate, toDate);
            insertNewRecord(computedData.avgTransactionsPerCustomer, fromDate);
        }

        console.log('computeTransactionsAvgPerCustomerReports -> month : ', helper.getDaysInMonth(month));
        req.month = Number(req.month) + 1;
        console.log('computeTransactionsAvgPerCustomerReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month < helper.getTodayMonthNo()){
            console.log('computeTransactionsAvgPerCustomerReports - yes', req.month, helper.getTodayMonthNo());
            computeTransactionsAvgPerCustomerReports(req, res);
        }
        else {
            console.log('computeTransactionsAvgPerCustomerReports - data compute - done');
            delete req.month;
        }
    });
};
promiseBasedComputeTransactionsAvgPerCustomerReports = async(req, res) => {
    console.log('promiseBasedComputeTransactionsAvgPerCustomerReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per month
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeTransactionsAvgPerCustomerReports: ', fromDate, toDate);
        await transactionsRepo.getTransactionsAvgPerCustomerByDateRange(req, fromDate, toDate).then(async function (transactionRawData) {
            console.log('transactionRawData 1 : ', transactionRawData.length);

            // Now compute and store data in DB
            if (transactionRawData.length > 0){
                computedData = computeTransactionsData(transactionRawData, fromDate, toDate);
                insertNewRecord(computedData.avgTransactionsPerCustomer, fromDate);
            }

            console.log('promiseBasedComputeTransactionsAvgPerCustomerReports - data compute - done');
            delete req.month;
            resolve(0);
        });
    });
};

function computeTransactionsData(transactionRawData, fromDate) {
    let rawData, avgTransactionsPerCustomer = [];
    let avgTransactionsObj = {
        package: { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 },
        month: ''
    };

    for (let i = 0 ; i < transactionRawData.length; i++){
        rawData = transactionRawData[i];
        //Package wise subscriptions
        if(rawData.package_id === 'QDfC')
            avgTransactionsObj.package.dailyLive = rawData.avg;
        else if(rawData.package_id === 'QDfG')
            avgTransactionsObj.package.weeklyLive = rawData.avg;
        else if(rawData.package_id === 'QDfH')
            avgTransactionsObj.package.dailyComedy = rawData.avg;
        else if(rawData.package_id === 'QDfI')
            avgTransactionsObj.package.weeklyComedy = rawData.avg;
    }

    avgTransactionsObj.month = fromDate;

    console.log('avgTransactionsObj: ', avgTransactionsObj);
    avgTransactionsPerCustomer.push(avgTransactionsObj);
    return {avgTransactionsPerCustomer: avgTransactionsPerCustomer};
}

function insertNewRecord(avgTransactionsPerCustomer, dateString) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            if (result.transactions){
                if (Array.isArray(result.transactions))
                    result.transactions.push({avgTransactionsPerCustomer: avgTransactionsPerCustomer});
                else
                    result.transactions.avgTransactionsPerCustomer = avgTransactionsPerCustomer;
            }
            else{
                result.transactions = {avgTransactionsPerCustomer: ''};
                result.transactions.avgTransactionsPerCustomer = avgTransactionsPerCustomer;
            }

            reportsRepo.updateReport(result, result._id);
        }
        else{
            let transactions = {};
            transactions.avgTransactionsPerCustomer = avgTransactionsPerCustomer;
            reportsRepo.createReport({transactions: transactions, date: dateString});
        }
    });
}

module.exports = {
    computeTransactionsAvgPerCustomerReports: computeTransactionsAvgPerCustomerReports,
    promiseBasedComputeTransactionsAvgPerCustomerReports: promiseBasedComputeTransactionsAvgPerCustomerReports,
};
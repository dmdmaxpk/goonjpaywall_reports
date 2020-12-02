const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const transactionsRepo = container.resolve('transactionsRepo');
const helper = require('../../../helper/helper');

let dateData, fromDate, toDate, day, month, computedData;
computeTransactionsAvgReports = async(req, res) => {
    console.log('computeTransactionsAvgReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 1, 2);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeTransactionsAvgReports: ', fromDate, toDate);
    await transactionsRepo.getTransactionsAvgByDateRange(req, fromDate, toDate).then(async function (transactionRawData) {
        console.log('transactionRawData 1 : ', transactionRawData.length);

        // Now compute and store data in DB
        if (transactionRawData.length > 0){
            computedData = computeTransactionsData(transactionRawData);
            insertNewRecord(computedData.avgTransactions, fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeTransactionsAvgReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeTransactionsAvgReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeTransactionsAvgReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeTransactionsAvgReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeTransactionsAvgReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeTransactionsAvgReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

function computeTransactionsData(transactionRawData) {

    let avgTransactions = [];
    let avgTransactionsObj = {avg_transactions: 0, billing_dtm: '', billing_dtm_hours: ''};
    avgTransactionsObj.avg_transactions = transactionRawData.avg;
    avgTransactionsObj.billing_dtm = transactionRawData.billing_dtm;
    avgTransactionsObj.billing_dtm_hours = helper.setDate(new Date(transactionRawData.billing_dtm), null, 0, 0, 0);
    avgTransactions.push(avgTransactionsObj);

    return {avgTransactions: avgTransactions};
}

function insertNewRecord(avgTransactions, dateString) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            if (result.transactions){
                if (Array.isArray(result.transactions))
                    result.transactions.push({avgTransactions: avgTransactions});
                else
                    result.transactions.avgTransactions = avgTransactions;
            }
            else{
                result.transactions = {avgTransactions: ''};
                result.transactions.avgTransactions = avgTransactions;
            }

            reportsRepo.updateReport(result, result._id);
        }
        else{
            let transactions = {};
            transactions.avgTransactions = avgTransactions;
            reportsRepo.createReport({transactions: transactions, date: dateString});
        }
    });
}

module.exports = {
    computeTransactionsAvgReports: computeTransactionsAvgReports,
};
const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const transactionsRepo = container.resolve('transactionsRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeTransactionsAvgReports = async(req, res) => {
    console.log('computeTransactionsAvgReports');
    let fromDate, toDate, day, month, computedData;

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
    transactionsRepo.getTransactionsAvgByDateRange(req, fromDate, toDate).then(function (transactionRawData) {
        console.log('transactionRawData: ', transactionRawData.length, transactionRawData);

        if (transactionRawData.length > 0){

            computedData = computeTransactionsData(transactionRawData, fromDate);
            insertNewRecord(computedData.transactionList, computedData.transactionsCount, new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getChargeDetailsByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeTransactionsAvgReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeTransactionsAvgReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeTransactionsAvgReports(req, res);
        }
    });
};

function computeTransactionsData(transactionRawData, fromDate) {

    let rawData, outerObj, innerObj, outer_added_dtm, dateInMili, uniqueSubscribers = 0, totalTransactions = 0, totalPrice = 0;
    let transactionList = [], transactionsCount = [];

    let transactionObj = {totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0};
    let transactionsCountObj = {total: 0};
    for (let i=0; i < transactionRawData.length; i++) {
        rawData = transactionRawData[i];

        // Calculate average transaction rate
        uniqueSubscribers = uniqueSubscribers + 1;
        totalTransactions = totalTransactions + rawData.size;

        if (rawData.transactions.length > 0){
            for (let j= 0 ; j < rawData.transactions.length; j ++){
                outerObj = rawData.transactions[j];

                //get totalPrice to compute avg price
                totalPrice = totalPrice + outerObj['price'];

                //script to get transaction's count per subscriber with in given datetime stemp
                outer_added_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();
                if (dateInMili !== outer_added_dtm) {
                    for (let k = 0; k < rawData.transactions.length; k++) {

                        innerObj = rawData.transactions[k];
                        inner_added_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();
                        if (outer_added_dtm === inner_added_dtm) {
                            dateInMili = inner_added_dtm;

                            transactionsCountObj.total = transactionsCountObj.total + 1;
                        }
                    }
                }
            }

            transactionsCount.push(transactionsCountObj);
        }
    }

    transactionObj.totalTransactions = totalTransactions;
    transactionObj.uniqueSubscribers = uniqueSubscribers;
    transactionObj.totalPrice = totalPrice;
    transactionObj.avg_value = ( totalPrice > 0  && totalTransactions> 0 )? totalTransactions / totalPrice : 0;
    transactionObj.avg_transactions = ( uniqueSubscribers > 0 && totalTransactions> 0 )? totalTransactions / uniqueSubscribers : 0;
    transactionObj.added_dtm = fromDate;
    transactionObj.added_dtm_hours = helper.setDate(new Date(fromDate), null, 0, 0, 0);
    transactionList.push(transactionObj);

    return {transactionList: transactionList, transactionsCount: transactionsCount};
}

function insertNewRecord(transactionAvg, transactionsCount, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('getReportByDateString - result : ', result);
        console.log('transactionAvg : ', transactionAvg);
        console.log('transactionsCount : ', transactionsCount);
        if (result.length > 0) {
            result = result[0];
            result.avgTransactions = transactionAvg;

            if(result.hasOwnProperty('subscribers'))
                result.subscribers.transactionsCount = transactionsCount;
            else{
                let subscribers = {};
                subscribers.transactionsCount = transactionsCount;
                result.subscribers = subscribers;
            }

            reportsRepo.updateReport(result, result._id);
        }
        else{
            let subscribers = {};
            subscribers.transactionsCount = transactionsCount;
            reportsRepo.createReport({avgTransactions: transactionAvg, subscribers: subscribers, date: dateString});
        }
    });
}

module.exports = {
    computeTransactionsAvgReports: computeTransactionsAvgReports,
};
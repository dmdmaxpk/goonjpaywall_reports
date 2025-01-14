const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const transactionsRepo = container.resolve('transactionsRepo');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, computedData;
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeTransactingSubscribersReports = async(req, res) => {
    console.log('computeTransactingSubscribersReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch month wise
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 2);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('fromDate: ', fromDate, toDate);
    query = countQuery(fromDate, toDate);

    await helper.getTotalCount(req, fromDate, toDate, 'subscriptions', query).then(async function (totalCount) {
        console.log('totalCount: ', totalCount);

        if (totalCount > 0) {
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0; i < totalChunks; i++) {
                await transactionsRepo.getTransactionsAvgByDateRange(req, fromDate, toDate, skip, limit).then(async function (transactionRawData) {
                    console.log('transactionRawData 1 : ', transactionRawData.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (transactionRawData.length > 0){
                        computedData = computeTransactionsData(transactionRawData, fromDate);
                        insertNewRecord(computedData.transactionList, computedData.transactionsCount, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await transactionsRepo.getTransactionsAvgByDateRange(req, fromDate, toDate, skip, limit).then(async function (transactionRawData) {
                    console.log('transactionRawData 2 : ', transactionRawData.length);

                    // Now compute and store data in DB
                    if (transactionRawData.length > 0){
                        computedData = computeTransactionsData(transactionRawData, fromDate);
                        insertNewRecord(computedData.transactionList, computedData.transactionsCount, fromDate, 1);
                    }
                });
            }
        }

        // Compute data for next month
        req.month = Number(req.month) + 1;
        console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeTransactingSubscribersReports(req, res);
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

function insertNewRecord(transactionAvg, transactionsCount, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            if (mode === 0){
                result.avgTransactions = transactionAvg;

                if(result.hasOwnProperty('subscribers'))
                    result.subscribers.transactionsCount = transactionsCount;
                else{
                    let subscribers = {};
                    subscribers.transactionsCount = transactionsCount;
                    result.subscribers = subscribers;
                }
            }
            else{
                result.avgTransactions = result.avgTransactions.concat(transactionAvg);

                if(result.hasOwnProperty('subscribers'))
                    result.subscribers.transactionsCount = result.subscribers.transactionsCount.concat(transactionsCount);
                else{
                    let subscribers = {};
                    subscribers.transactionsCount = transactionsCount;
                    result.subscribers = subscribers;
                }
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

function countQuery(from, to){
    return [
        {
            $match:{
                billing_status: "Success",
                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
            }
        },
        {$project:{
                source: {$ifNull: ['$source', 'app'] },
                micro_charge: {$ifNull: ['$micro_charge', 'false'] },
                paywall_id: {$ifNull: ['$paywall_id', 'Dt6Gp70c'] },
                package_id: {$ifNull: ['$package_id', 'QDfC'] },
                operator: {$ifNull: ['$operator', 'telenor'] },
                billing_status: {$ifNull: ['$billing_status', 'expire'] },
                transaction_id: "$transaction_id",
                user_id: "$user_id",
                billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } },
            }
        },
    ];
}

module.exports = {
    computeTransactingSubscribersReports: computeTransactingSubscribersReports,
};
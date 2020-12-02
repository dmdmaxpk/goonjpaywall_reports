const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const transactionsRepo = container.resolve('transactionsRepo');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, computedData;
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
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
    }

    transactionObj.totalTransactions = totalTransactions;
    transactionObj.uniqueSubscribers = uniqueSubscribers;
    transactionObj.avg_transactions = ( uniqueSubscribers > 0 && totalTransactions> 0 )? totalTransactions / uniqueSubscribers : 0;
    transactionObj.billing_dtm = fromDate;
    transactionObj.billing_dtm_hours = helper.setDate(new Date(fromDate), null, 0, 0, 0);
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
        {$match : {
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }},
        {$lookup:{
                from: "billinghistories",
                localField: "subscriber_id",
                foreignField: "subscriber_id",
                as: "histories"}
        },
        { $project: {
                source:"$source",
                added_dtm:"$added_dtm",
                subscription_status:"$subscription_status",
                bill_status: { $filter: {
                        input: "$histories",
                        as: "history",
                        cond: { $or: [
                                { $eq: ['$$history.billing_status',"expired"] },
                                { $eq: ['$$history.billing_status',"unsubscribe-request-recieved"] },
                                { $eq: ['$$history.billing_status',"unsubscribe-request-received-and-expired"] }
                            ]}
                    }} }
        },
        {$project: {
                source:"$source",
                added_dtm:"$added_dtm",
                numOfFailed: { $size:"$bill_status" },
                subscription_status:"$subscription_status",
                billing_status: {"$arrayElemAt": ["$bill_status.billing_status",0]},
                package: {"$arrayElemAt": ["$bill_status.package_id",0]},
                paywall: {"$arrayElemAt": ["$bill_status.paywall_id",0]},
                operator: {"$arrayElemAt": ["$bill_status.operator",0]},
                billing_dtm: {"$arrayElemAt": ["$bill_status.billing_dtm",0]}
            }
        },
        {$match: { numOfFailed: {$gte: 1}  }},
        {$project: {
                _id: 0,
                added_dtm:"$added_dtm",
                source:"$source",
                subscription_status:"$subscription_status",
                billing_status:"$billing_status",
                package: "$package",
                paywall: "$paywall",
                operator: "$operator",
                billing_dtm: "$billing_dtm",
            }
        },
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeTransactionsAvgReports: computeTransactionsAvgReports,
};
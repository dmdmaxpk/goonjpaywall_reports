const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeCallbackSendReports = async(req, res) => {
    console.log('computeCallbackSendReports'); return;

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */

    // dateData = helper.computeTodayDate(req);
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

        if (totalCount > 0){
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0 ; i < totalChunks; i++){
                await subscriptionRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, limit).then(async function (subscriptions) {
                    console.log('subscriptions 1: ', subscriptions.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalList = computeUserData(subscriptions);
                        await insertNewRecord(finalList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await subscriptionRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (subscriptions) {
                    console.log('subscriptions 2: ', subscriptions.length);

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalList = computeUserData(subscriptions);
                        await insertNewRecord(finalList, fromDate, 1);
                    }
                });
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeCallbackSendReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            console.log('IF');
            if (month < helper.getTodayMonthNo())
                computeCallbackSendReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeCallbackSendReports(req, res);
        }
        else{
            console.log('ELSE');
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeCallbackSendReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeCallbackSendReports(req, res);
        }
    });
};

function computeUserData(subscriptions) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];
        newObj = {callbackSent : 0, added_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = helper.setDate(new Date(outerObj.subscription_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.isCallbAckSent === 'yes')
                        newObj.callbackSent = newObj.callbackSent + 1;

                    newObj.added_dtm = outerObj.subscription_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.subscription_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return finalList;
}

async function insertNewRecord(data, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];
            if (mode === 0)
                result.callbackSend = data;
            else
                result.callbackSend = result.callbackSend.concat(data);

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({callbackSend: data, date: dateString});
    });
}

function countQuery(from, to){
    return [
        {
            $match: {
                $or:[{source: "HE"},{source: "affiliate_web"}],
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }
        },
        {
            $lookup:
                {
                    from: "billinghistories",
                    localField: "_id",
                    foreignField: "subscription_id",
                    as: "histories"
                }
        },
        {
            $project: {
                tid: "$affiliate_unique_transaction_id",
                mid: "$affiliate_mid",
                added_dtm: "$added_dtm",
                active: "$active",
                callbackhistory: {
                    $filter: {
                        input: "$histories",
                        as: "histor",
                        cond: {$eq: ["$$histor.billing_status", "Affiliate callback sent" ] }
                    }
                }
            }
        },
        {
            $project: {
                tid: "$tid",
                mid: "$mid",
                isValidUser: {$cond: {if: {$eq:["$active",true]}, then: true, else: false } },
                added_dtm: "$added_dtm",
                callbackhistorySize: {"$size": "$callbackhistory" },
                callbackObj: {$arrayElemAt: ["$callbackhistory",0]},
            }
        },
        {
            $project: {
                tid: "$tid",
                mid: "$mid",
                isValidUser: "$isValidUser",
                callbackhistorySize: "$callbackhistorySize",
                added_dtm: "$added_dtm",
                billing_dm: "$callbackObj.billing_dtm"
            }
        },
        {
            $project: {
                tid: "$tid",
                mid: "$mid",
                isValidUser: "$isValidUser",
                added_dtm:  {$cond: {if: "$isValidUser", then: "$added_dm" , else: "" } },
                subscription_dtm: "$added_dtm",
                isCallbAckSent: {$cond: { if: { $and: [{$gte: ["$callbackhistorySize",1]},{$eq: [ "$isValidUser",true ]} ] } ,then:"yes",else:"no" }} ,
                callBackSentTime: {$cond: {if: "$isValidUser", then: "$billing_dm" , else: "" } }
            }
        },
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeCallbackSendReports: computeCallbackSendReports,
};
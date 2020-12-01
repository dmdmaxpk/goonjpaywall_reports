const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, computedData;
let subscriptionList = [], subscribersList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;

SubscriptionsSourceWiseSuccessfulService = async(req, res) => {
    console.log('SubscriptionsSourceWiseSuccessfulService: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 30, 11);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('fromDate: ', fromDate, toDate);
    query = countQuery(fromDate, toDate);

    await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
        console.log('totalCount: ', totalCount);

        if (totalCount > 0){
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0 ; i < totalChunks; i++){
                await subscriptionRepo.getSubscriptionSourceWiseSuccessfulByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                    console.log('result 1: ', result.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeSubscriptionsSourceWiseSuccessfulData(result);
                        subscriptionList = computedData.subscriptionList;

                        await insertNewRecord(subscriptionList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await subscriptionRepo.getSubscriptionSourceWiseSuccessfulByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                    console.log('result 2: ', result.length);

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeSubscriptionsSourceWiseSuccessfulData(result);
                        subscriptionList = computedData.subscriptionList;

                        await insertNewRecord(subscriptionList, fromDate, 1);
                    }
                });
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('SubscriptionsSourceWiseSuccessfulService -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                SubscriptionsSourceWiseSuccessfulService(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                SubscriptionsSourceWiseSuccessfulService(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('SubscriptionsSourceWiseSuccessfulService -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                SubscriptionsSourceWiseSuccessfulService(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('SubscriptionsSourceWiseSuccessfulService - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};
promiseBasedComputeBillingHistorySuccessfulReports = async(req, res) => {
    console.log('promiseBasedComputeBillingHistorySuccessfulReports: ');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('fromDate: ', fromDate, toDate);
        query = countQuery(fromDate, toDate);

        await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
            console.log('totalCount: ', totalCount);

            if (totalCount > 0){
                computeChunks = helper.getChunks(totalCount);
                totalChunks = computeChunks.chunks;
                lastLimit = computeChunks.lastChunkCount;
                let skip = 0;

                //Loop over no.of chunks
                for (i = 0 ; i < totalChunks; i++){
                    await subscriptionRepo.getSubscriptionSourceWiseSuccessfulByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                        console.log('result 1: ', result.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeSubscriptionsSourceWiseSuccessfulData(result);
                            subscriptionList = computedData.subscriptionList;

                            await insertNewRecord(subscriptionList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await subscriptionRepo.getSubscriptionSourceWiseSuccessfulByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                        console.log('result 2: ', result.length);

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeSubscriptionsSourceWiseSuccessfulData(result);
                            subscriptionList = computedData.subscriptionList;

                            await insertNewRecord(subscriptionList, fromDate, 1);
                        }
                    });
                }
            }

            if (helper.isToday(fromDate)){
                console.log('promiseBasedComputeBillingHistorySuccessfulReports - data compute - done');
                delete req.day;
                delete req.month;
            }
            resolve(0);
        });
    });
};

function computeSubscriptionsSourceWiseSuccessfulData(data) {

    let outerObj, innerObj, subscriptionObj, outer_billing_dtm, inner_billing_dtm;
    let check, subscriptionList = [], hoursArr = [];

    for (let j=0; j < data.length; j++) {

        subscriptionObj = _.cloneDeep(cloneSubscriptionObj());

        outerObj = data[j];
        outer_billing_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();
        thisHour = new Date(outerObj.billing_dtm).getUTCHours();
        check = hoursArr.includes(thisHour);

        if (!check){
            hoursArr.push(thisHour);
            console.log('hoursArr: ', hoursArr.length);

            for (let k=0; k < data.length; k++) {

                innerObj = data[k];
                inner_billing_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();
                if (outer_billing_dtm === inner_billing_dtm){

                    //Source wise total count for subscribers & transactions
                    if(innerObj.source === 'app')
                        subscriptionObj.source.app = subscriptionObj.source.app + 1;
                    if(innerObj.source === 'web')
                        subscriptionObj.source.web = subscriptionObj.source.web + 1;
                    if(innerObj.source === 'gdn2')
                        subscriptionObj.source.gdn2 = subscriptionObj.source.gdn2 + 1;
                    if(innerObj.source === 'HE')
                        subscriptionObj.source.HE = subscriptionObj.source.HE + 1;
                    if(innerObj.source === 'affiliate_web')
                        subscriptionObj.source.affiliate_web = subscriptionObj.source.affiliate_web + 1;

                    /*
                    * Timestepms
                    * */
                    subscriptionObj.billing_dtm = outerObj.billing_dtm;
                    subscriptionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }

            subscriptionList.push(subscriptionObj);
        }
    }

    return { subscriptionList: subscriptionList };
}

async function insertNewRecord(subscriptionList, dateString, mode) {

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];

            console.log('mode: ', mode);

            if (mode === 0){
                if (result.subscriptions)
                    result.subscriptions.sourceWise = subscriptionList;
                else{
                    result.subscriptions = {sourceWise: ''};
                    result.subscriptions.sourceWise = subscriptionList;
                }

            }
            else{
                if (result.subscriptions)
                    result.subscriptions.sourceWise.concat(subscriptionList);
                else{
                    result.subscriptions = {sourceWise: ''};
                    result.subscriptions.sourceWise = subscriptionList;
                }
            }
            await reportsRepo.updateReport(result, result._id);
        }
        else{
            await reportsRepo.createReport({
                subscriptions: subscriptionList,
                date: dateString
            });
        }
    });
}

function cloneSubscriptionObj() {
    return {
        source: {
            app: 0,
            web: 0,
            gdn2: 0,
            HE: 0,
            affiliate_web: 0,
        },
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}

function countQuery(from, to){
    return [
        {
            $match:{
                billing_status: "Success",
                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                let: {subscriber_id: "$subscriber_id"},
                pipeline:[
                    {
                        $match: {
                            $expr: {
                                $and:[
                                    {$eq: ["$subscriber_id", "$$subscriber_id"]},
                                ]
                            }
                        }
                    }
                ],
                as: "subs"
            }
        },
        {
            $group:{ _id: "$subscriber_id" }
        },
        {
            $count: "count"
        }
    ];
}
module.exports = {
    SubscriptionsSourceWiseSuccessfulService: SubscriptionsSourceWiseSuccessfulService,
    promiseBasedComputeBillingHistorySuccessfulReports: promiseBasedComputeBillingHistorySuccessfulReports
};
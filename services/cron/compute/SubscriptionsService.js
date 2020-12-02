const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalData, subscriptionsFinalList = [], subscribersFinalList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeDailySubscriptionReports = async(req, res) => {
    console.log('computeDailySubscriptionReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 16, 10);
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
                await subscriptionRepo.getSubscriptionsByDateRange(req, fromDate, toDate, skip, limit).then(async function (subscriptions) {
                    console.log('subscriptions 1: ', subscriptions.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalData = computeSubscriptionsData(subscriptions);
                        subscriptionsFinalList = finalData.subscriptionsFinalList;
                        subscribersFinalList = finalData.subscribersFinalList;
                        if (subscriptionsFinalList.length > 0 || subscribersFinalList.length > 0){
                            console.log('totalChunks - lastLimit: ', totalChunks, lastLimit);
                            if (totalChunks > 1 || lastLimit > 0)
                                await insertNewRecord(subscriptionsFinalList, subscribersFinalList, fromDate, i);
                            else
                                await insertNewRecord(subscriptionsFinalList, subscribersFinalList, fromDate, i);
                        }
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await subscriptionRepo.getSubscriptionsByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (subscriptions) {
                    console.log('subscriptions 2: ', subscriptions.length);

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalData = computeSubscriptionsData(subscriptions);
                        subscriptionsFinalList = finalData.subscriptionsFinalList;
                        subscribersFinalList = finalData.subscribersFinalList;
                        if (subscriptionsFinalList.length > 0 || subscribersFinalList.length > 0)
                            await insertNewRecord(subscriptionsFinalList, subscribersFinalList, fromDate, 1);
                    }
                });
            }
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('computeDailySubscriptionReports -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        console.log('IF');
        if (month < helper.getTodayMonthNo())
            computeDailySubscriptionReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            computeDailySubscriptionReports(req, res);
    }
    else{
        console.log('ELSE');
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('computeDailySubscriptionReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeDailySubscriptionReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeDailySubscriptionReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeDailySubscriptionReports = async(req, res) => {
    console.log('promiseBasedComputeDailySubscriptionReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeTodayDate(req);
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
                    await subscriptionRepo.getSubscriptionsByDateRange(req, fromDate, toDate, skip, limit).then(async function (subscriptions) {
                        console.log('subscriptions 1: ', subscriptions.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (subscriptions.length > 0){
                            finalData = computeSubscriptionsData(subscriptions);
                            subscriptionsFinalList = finalData.subscriptionsFinalList;
                            subscribersFinalList = finalData.subscribersFinalList;

                            console.log('subscriptionsFinalList - subscribersFinalList: ', subscriptionsFinalList.length, subscribersFinalList.length);
                            if (subscriptionsFinalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(subscriptionsFinalList, subscribersFinalList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await subscriptionRepo.getSubscriptionsByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (subscriptions) {
                        console.log('subscriptions 2: ', subscriptions.length);

                        // Now compute and store data in DB
                        if (subscriptions.length > 0){
                            finalData = computeSubscriptionsData(subscriptions);
                            subscriptionsFinalList = finalData.subscriptionsFinalList;
                            subscribersFinalList = finalData.subscribersFinalList;
                            if (subscriptionsFinalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(subscriptionsFinalList, subscribersFinalList, fromDate, 1);
                        }
                    });
                }
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeDailySubscriptionReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeSubscriptionsData(subscriptions) {

    let subscription_status, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, subscriberObj, subscriptionsFinalList = [], subscribersFinalList = [];
    let check, hoursArr = [];

    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];

        newObj = _.clone(cloneInfoObj());
        subscriberObj = _.clone(cloneSubscribersObj());
        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        thisHour = new Date(outerObj.added_dtm).getUTCHours();
        check = hoursArr.includes(thisHour);

        if (!check){
            hoursArr.push(thisHour);
            console.log('hoursArr: ', hoursArr.length);
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    subscription_status = innerObj.subscription_status;
                    if(subscription_status === "billed") {
                        //Active subscriptions & subscribers
                        newObj.active = newObj.active + 1;
                        subscriberObj.active = subscriberObj.active + 1;
                    }
                    else if (subscription_status === "expired" || subscription_status === "not_billed"){
                        //inactive subscriptions & subscribers
                        newObj.nonActive = newObj.nonActive + 1;
                        subscriberObj.nonActive = subscriberObj.nonActive + 1;
                    }

                    newObj.added_dtm = outerObj.added_dtm;
                    subscriberObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                    subscriberObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            subscriptionsFinalList.push(newObj);
            subscribersFinalList.push(subscriberObj);
        }
    }

    return {subscriptionsFinalList: subscriptionsFinalList, subscribersFinalList: subscribersFinalList};
}

async function insertNewRecord(subscriptionsFinalList, subscribersFinalList, dateString, mode) {
    console.log('dateString: ', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, subscriptionsFinalList.length, subscribersFinalList.length);
    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];

            if (mode === 0){

                if (result.subscriptions)
                    result.subscriptions.activeInActive = subscriptionsFinalList;
                else{
                    result.subscriptions = {activeInActive: ''};
                    result.subscriptions.activeInActive = subscriptionsFinalList;
                }

                if (result.subscribers)
                    result.subscribers.activeInActive = subscribersFinalList;
                else{
                    result.subscribers = {activeInActive: ''};
                    result.subscribers.activeInActive = subscribersFinalList;
                }
            }else{
                if (result.subscriptions)
                    result.subscriptions.activeInActive.concat(subscriptionsFinalList);
                else{
                    result.subscriptions = {activeInActive: ''};
                    result.subscriptions.activeInActive = subscriptionsFinalList;
                }

                if (result.subscribers)
                    result.subscribers.activeInActive.concat(subscribersFinalList);
                else{
                    result.subscribers = {activeInActive: ''};
                    result.subscribers.activeInActive = subscribersFinalList;
                }
            }

            await reportsRepo.updateReport(result, result._id);
        }
        else{
            let subscriptions = {activeInActive: ''};
            subscriptions.activeInActive = subscriptionsFinalList;

            let subscribers = {activeInActive: ''};
            subscribers.activeInActive = subscribersFinalList;
            await reportsRepo.createReport({subscriptions: subscriptions, subscribers: subscribers, date: dateString});
        }
    });
}

function cloneSubscribersObj() {
    return {
        active: 0,
        nonActive: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneInfoObj() {
    return {
        active : 0,
        nonActive: 0,
        added_dtm: '',
        added_dtm_hours: ''
    };
}

function countQuery(from, to){
    return [
        {$match : {
                $or: [{subscription_status: "billed"}, {subscription_status: "not_billed"}, {subscription_status: "expired"}],
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }},
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeDailySubscriptionReports: computeDailySubscriptionReports,
    promiseBasedComputeDailySubscriptionReports: promiseBasedComputeDailySubscriptionReports,
};
const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalData, finalList = [], subscribersFinalList = [];
let computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeDailySubscriptionReports = async(req, res) => {
    console.log('computeDailySubscriptionReports');

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

    await helper.getTotalCount(req, fromDate, toDate, 'subscriptions').then(async function (totalCount) {
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
                        finalList = finalData.finalList;
                        subscribersFinalList = finalData.subscribersFinalList;
                        if (finalList.length > 0 || subscribersFinalList.length > 0){
                            console.log('totalChunks - lastLimit: ', totalChunks, lastLimit);
                            if (totalChunks > 1 || lastLimit > 0)
                                await insertNewRecord(finalList, subscribersFinalList, fromDate, i);
                            else
                                await insertNewRecord(finalList, subscribersFinalList, fromDate, i);
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
                        finalList = finalData.finalList;
                        subscribersFinalList = finalData.subscribersFinalList;
                        if (finalList.length > 0 || subscribersFinalList.length > 0)
                            await insertNewRecord(finalList, subscribersFinalList, fromDate, 1);
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

        await helper.getTotalCount(req, fromDate, toDate, 'subscriptions').then(async function (totalCount) {
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
                            finalList = finalData.finalList;
                            subscribersFinalList = finalData.subscribersFinalList;

                            console.log('finalList - subscribersFinalList: ', finalList.length, subscribersFinalList.length);
                            if (finalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(finalList, subscribersFinalList, fromDate, i);
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
                            finalList = finalData.finalList;
                            subscribersFinalList = finalData.subscribersFinalList;
                            if (finalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(finalList, subscribersFinalList, fromDate, 1);
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

    let dateInMili, subscription_status, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, subscriberObj, finalList = [], subscribersFinalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];

        newObj = _.clone(cloneInfoObj());
        subscriberObj = _.clone(cloneSubscribersObj());
        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;

                    subscription_status = innerObj.subscription_status;
                    if(subscription_status === "billed" || subscription_status === "trial" || subscription_status === "graced") {
                        //Package wise subscriptions
                        if (innerObj.subscribed_package_id === 'QDfC')
                            newObj.package.dailyLive = newObj.package.dailyLive + 1;
                        else if (innerObj.subscribed_package_id === 'QDfG')
                            newObj.package.weeklyLive = newObj.package.weeklyLive + 1;
                        else if (innerObj.subscribed_package_id === 'QDfH')
                            newObj.package.dailyComedy = newObj.package.dailyComedy + 1;
                        else if (innerObj.subscribed_package_id === 'QDfI')
                            newObj.package.weeklyComedy = newObj.package.weeklyComedy + 1;

                        //Paywall wise subscriptions
                        if (innerObj.paywall_id === 'ghRtjhT7')
                            newObj.paywall.comedy = newObj.paywall.comedy + 1;
                        else if (innerObj.paywall_id === 'Dt6Gp70c')
                            newObj.paywall.live = newObj.paywall.live + 1;

                        //Source wise subscriptions
                        if (innerObj.source === 'app')
                            newObj.source.app = newObj.source.app + 1;
                        else if (innerObj.source === 'web')
                            newObj.source.web = newObj.source.web + 1;
                        else if (innerObj.source === 'gdn2')
                            newObj.source.gdn2 = newObj.source.gdn2 + 1;
                        else if (innerObj.source === 'HE')
                            newObj.source.HE = newObj.source.HE + 1;
                        else if (innerObj.source === 'affiliate_web')
                            newObj.source.affiliate_web = Number(newObj.source.affiliate_web) + 1;

                        //Affiliate mid wise subscriptions
                        if (innerObj.affiliate_mid) {
                            if (innerObj.affiliate_mid === 'aff3')
                                newObj.affiliate_mid.aff3 = newObj.affiliate_mid.aff3 + 1;
                            else if (innerObj.affiliate_mid === 'aff3a')
                                newObj.affiliate_mid.aff3a = newObj.affiliate_mid.aff3a + 1;
                            else if (innerObj.affiliate_mid === 'gdn')
                                newObj.affiliate_mid.gdn = newObj.affiliate_mid.gdn + 1;
                            else if (innerObj.affiliate_mid === 'gdn2')
                                newObj.affiliate_mid.gdn2 = newObj.affiliate_mid.gdn2 + 1;
                            else if (innerObj.affiliate_mid === 'goonj')
                                newObj.affiliate_mid.goonj = newObj.affiliate_mid.goonj + 1;
                            else if (innerObj.affiliate_mid === '1565')
                                newObj.affiliate_mid['1565'] = newObj.affiliate_mid['1565'] + 1;
                            else if (innerObj.affiliate_mid === '1')
                                newObj.affiliate_mid['1'] = newObj.affiliate_mid['1'] + 1;
                            else if (innerObj.affiliate_mid === 'null')
                                newObj.affiliate_mid['null'] = newObj.affiliate_mid['null'] + 1;
                        }

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
            finalList.push(newObj);
            subscribersFinalList.push(subscriberObj);
        }
    }

    return {finalList: finalList, subscribersFinalList: subscribersFinalList};
}

async function insertNewRecord(finalList, subscribersFinalList, dateString, mode) {
    console.log('dateString: ', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, finalList.length, subscribersFinalList.length);
    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];

            if (mode === 0){
                result.subscriptions = finalList;

                if (result.subscribers)
                    result.subscribers.activeInActive = subscribersFinalList;
                else{
                    result.subscribers = {activeInActive: ''};
                    result.subscribers.activeInActive = subscribersFinalList;
                }
            }else{
                if (result.subscriptions)
                    result.subscriptions.concat(finalList);
                else
                    result.subscriptions = finalList;

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
            let subscribers = {activeInActive: ''};
            subscribers.activeInActive = subscribersFinalList;
            await reportsRepo.createReport({subscriptions: finalList, subscribers: subscribers, date: dateString});
        }
    });
}

function cloneSubscribersObj() {
    return {
        active: 0,
        nonActive: 0,
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneInfoObj() {
    return {
        active : 0,
        nonActive: 0,
        package: {
            dailyLive: 0,
            weeklyLive: 0,
            dailyComedy: 0,
            weeklyComedy: 0
        },
        paywall: {
            comedy: 0,
            live: 0
        },
        source: {
            app: 0,
            web: 0,
            gdn2: 0,
            HE: 0,
            affiliate_web: 0,
            other_mids: 0
        },
        affiliate_mid: {
            aff3: 0,
            aff3a: 0,
            gdn: 0,
            gdn2: 0,
            goonj: 0,
            '1565': 0,
            '1569': 0,
            '1': 0,
            'null': 0,
        },
        billing_dtm: '',
        billing_dtm_hours: ''
    };
}

module.exports = {
    computeDailySubscriptionReports: computeDailySubscriptionReports,
    promiseBasedComputeDailySubscriptionReports: promiseBasedComputeDailySubscriptionReports,
};
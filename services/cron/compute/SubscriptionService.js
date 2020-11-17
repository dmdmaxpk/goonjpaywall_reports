const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalData, subscriptionFinalList = [], subscribersFinalList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeSubscriptionReports = async(req, res) => {
    console.log('computeSubscriptionReports');

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

    await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
        console.log('totalCount: ', totalCount);

        if (totalCount > 0){
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0 ; i < totalChunks; i++){
                await billingHistoryRepo.computeSubscriptionsFromBillingHistoryByDateRange(req, fromDate, toDate, skip, limit).then(async function (subscriptions) {
                    console.log('subscriptions 1: ', subscriptions.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalData = computeSubscriptionsData(subscriptions);
                        subscriptionFinalList = finalData.subscriptionFinalList;
                        subscribersFinalList = finalData.subscribersFinalList;

                        // console.log('subscriptionFinalList: ', subscriptionFinalList);
                        // console.log('subscribersFinalList: ', subscribersFinalList);
                        if (subscriptionFinalList.length > 0 || subscribersFinalList.length > 0){
                            console.log('totalChunks - lastLimit: ', totalChunks, lastLimit);
                            if (totalChunks > 1 || lastLimit > 0)
                                await insertNewRecord(subscriptionFinalList, subscribersFinalList, fromDate, i);
                            else
                                await insertNewRecord(subscriptionFinalList, subscribersFinalList, fromDate, i);
                        }
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await billingHistoryRepo.computeSubscriptionsFromBillingHistoryByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (subscriptions) {
                    console.log('subscriptions 2: ', subscriptions.length);

                    // Now compute and store data in DB
                    if (subscriptions.length > 0){
                        finalData = computeSubscriptionsData(subscriptions);
                        subscriptionFinalList = finalData.subscriptionFinalList;
                        subscribersFinalList = finalData.subscribersFinalList;
                        if (subscriptionFinalList.length > 0 || subscribersFinalList.length > 0)
                            await insertNewRecord(subscriptionFinalList, subscribersFinalList, fromDate, 1);
                    }
                });
            }
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('computeSubscriptionReports -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        if (month < helper.getTodayMonthNo())
            computeSubscriptionReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            computeSubscriptionReports(req, res);
    }
    else{
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('computeSubscriptionReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeSubscriptionReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeSubscriptionReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeSubscriptionReports = async(req, res) => {
    console.log('promiseBasedComputeSubscriptionReports');
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

        await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
            console.log('totalCount: ', totalCount);

            if (totalCount > 0){
                computeChunks = helper.getChunks(totalCount);
                totalChunks = computeChunks.chunks;
                lastLimit = computeChunks.lastChunkCount;
                let skip = 0;

                //Loop over no.of chunks
                for (i = 0 ; i < totalChunks; i++){
                    await billingHistoryRepo.computeSubscriptionsFromBillingHistoryByDateRange(req, fromDate, toDate, skip, limit).then(async function (subscriptions) {
                        console.log('subscriptions 1: ', subscriptions.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (subscriptions.length > 0){
                            finalData = computeSubscriptionsData(subscriptions);
                            subscriptionFinalList = finalData.subscriptionFinalList;
                            subscribersFinalList = finalData.subscribersFinalList;

                            console.log('subscriptionFinalList - subscribersFinalList: ', subscriptionFinalList.length, subscribersFinalList.length);
                            if (subscriptionFinalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(subscriptionFinalList, subscribersFinalList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await billingHistoryRepo.computeSubscriptionsFromBillingHistoryByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (subscriptions) {
                        console.log('subscriptions 2: ', subscriptions.length);

                        // Now compute and store data in DB
                        if (subscriptions.length > 0){
                            finalData = computeSubscriptionsData(subscriptions);
                            subscriptionFinalList = finalData.subscriptionFinalList;
                            subscribersFinalList = finalData.subscribersFinalList;
                            if (subscriptionFinalList.length > 0 || subscribersFinalList.length > 0)
                                await insertNewRecord(subscriptionFinalList, subscribersFinalList, fromDate, 1);
                        }
                    });
                }
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeSubscriptionReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeSubscriptionsData(subscriptions) {

    let dateInMili, outer_billing_dtm, inner_billing_dtm, subscriptionObj, outerObj, innerObj, billing_status, affiliate_mid, subscriberObj, finalList = [], subscribersFinalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];

        subscriptionObj = _.cloneDeep(cloneInfoObj());
        subscriberObj = _.cloneDeep(cloneSubscribersObj());
        outer_billing_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();

        billing_status = false;
        if (dateInMili !== outer_billing_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_billing_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();

                if (outer_billing_dtm === inner_billing_dtm){
                    dateInMili = inner_billing_dtm;

                    billing_status = innerObj.history.billing_status;
                    //Successful Subscriptions
                    if(billing_status === "Success" || billing_status === "billed"){

                        //Package wise subscriptions
                        if(innerObj.history.package_id === 'QDfC')
                            subscriptionObj.successful.package.dailyLive = Number(subscriptionObj.successful.package.dailyLive) + 1;
                        else if(innerObj.history.package_id === 'QDfG')
                            subscriptionObj.successful.package.weeklyLive = Number(subscriptionObj.successful.package.weeklyLive) + 1;
                        else if(innerObj.history.package_id === 'QDfH')
                            subscriptionObj.successful.package.dailyComedy = Number(subscriptionObj.successful.package.dailyComedy) + 1;
                        else if(innerObj.history.package_id === 'QDfI')
                            subscriptionObj.successful.package.weeklyComedy = Number(subscriptionObj.successful.package.weeklyComedy) + 1;

                        //Paywall wise subscriptions
                        if(innerObj.history.paywall_id === 'ghRtjhT7')
                            subscriptionObj.successful.paywall.comedy = Number(subscriptionObj.successful.paywall.comedy) + 1;
                        else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                            subscriptionObj.successful.paywall.live = Number(subscriptionObj.successful.paywall.live) + 1;

                        //Operator wise subscriptions
                        if(innerObj.history.operator === 'telenor')
                            subscriptionObj.successful.operator.telenor = Number(subscriptionObj.successful.operator.telenor) + 1;
                        else
                            subscriptionObj.successful.operator.easypaisa = Number(subscriptionObj.successful.operator.easypaisa) + 1;

                        //Source wise subscriptions
                        if(innerObj.history.source === 'app')
                            subscriptionObj.successful.source.app = Number(subscriptionObj.successful.source.app) + 1;
                        else if(innerObj.history.source === 'web')
                            subscriptionObj.successful.source.web = Number(subscriptionObj.successful.source.web) + 1;
                        else if(innerObj.history.source === 'gdn2')
                            subscriptionObj.successful.source.gdn2 = Number(subscriptionObj.successful.source.gdn2) + 1;
                        else if(innerObj.history.source === 'HE')
                            subscriptionObj.successful.source.HE = Number(subscriptionObj.successful.source.HE) + 1;
                        else if(innerObj.history.source === 'affiliate_web')
                            subscriptionObj.successful.source.affiliate_web = Number(subscriptionObj.successful.source.affiliate_web) + 1;
                        else
                            subscriptionObj.successful.source.other_mids = Number(subscriptionObj.successful.source.other_mids) + 1;

                        // console.log('subscriptionObj.successful : ', subscriptionObj.successful);
                    }

                    // Graced subscriptions
                    if (billing_status === "graced") {

                        //Package wise subscriptions
                        if(innerObj.history.package_id === 'QDfC')
                            subscriptionObj.graced.package.dailyLive = subscriptionObj.graced.package.dailyLive + 1;
                        else if(innerObj.history.package_id === 'QDfG')
                            subscriptionObj.graced.package.weeklyLive = subscriptionObj.graced.package.weeklyLive + 1;
                        else if(innerObj.history.package_id === 'QDfH')
                            subscriptionObj.graced.package.dailyComedy = subscriptionObj.graced.package.dailyComedy + 1;
                        else if(innerObj.history.package_id === 'QDfI')
                            subscriptionObj.graced.package.weeklyComedy = subscriptionObj.graced.package.weeklyComedy + 1;

                        //Paywall wise subscriptions
                        if(innerObj.history.paywall_id === 'ghRtjhT7')
                            subscriptionObj.graced.paywall.comedy = subscriptionObj.graced.paywall.comedy + 1;
                        else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                            subscriptionObj.graced.paywall.live = subscriptionObj.graced.paywall.live + 1;

                        //Operator wise subscriptions
                        if(innerObj.history.operator === 'telenor')
                            subscriptionObj.graced.operator.telenor = subscriptionObj.graced.operator.telenor + 1;
                        else
                            subscriptionObj.graced.operator.easypaisa = subscriptionObj.graced.operator.easypaisa + 1;

                        //Source wise subscriptions
                        if(innerObj.history.source === 'app')
                            subscriptionObj.graced.source.app = subscriptionObj.graced.source.app + 1;
                        else if(innerObj.history.source === 'web')
                            subscriptionObj.graced.source.web = subscriptionObj.graced.source.web + 1;
                        else if(innerObj.history.source === 'gdn2')
                            subscriptionObj.graced.source.gdn2 = subscriptionObj.graced.source.gdn2 + 1;
                        else if(innerObj.history.source === 'HE')
                            subscriptionObj.graced.source.HE = subscriptionObj.graced.source.HE + 1;
                        else if(innerObj.history.source === 'affiliate_web')
                            subscriptionObj.graced.source.affiliate_web = Number(subscriptionObj.graced.source.affiliate_web) + 1;
                        else
                            subscriptionObj.graced.source.other_mids = Number(subscriptionObj.graced.source.other_mids) + 1;
                    }

                    // Trialed subscriptions
                    if (billing_status === "trial") {

                        //Package wise subscriptions
                        if(innerObj.history.package_id === 'QDfC')
                            subscriptionObj.trial.package.dailyLive = subscriptionObj.trial.package.dailyLive + 1;
                        else if(innerObj.history.package_id === 'QDfG')
                            subscriptionObj.trial.package.weeklyLive = subscriptionObj.trial.package.weeklyLive + 1;
                        else if(innerObj.history.package_id === 'QDfH')
                            subscriptionObj.trial.package.dailyComedy = subscriptionObj.trial.package.dailyComedy + 1;
                        else if(innerObj.history.package_id === 'QDfI')
                            subscriptionObj.trial.package.weeklyComedy = subscriptionObj.trial.package.weeklyComedy + 1;

                        //Paywall wise subscriptions
                        if(innerObj.history.paywall_id === 'ghRtjhT7')
                            subscriptionObj.trial.paywall.comedy = subscriptionObj.trial.paywall.comedy + 1;
                        else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                            subscriptionObj.trial.paywall.live = subscriptionObj.trial.paywall.live + 1;

                        //Operator wise subscriptions
                        if(innerObj.history.operator === 'telenor')
                            subscriptionObj.trial.operator.telenor = subscriptionObj.trial.operator.telenor + 1;
                        else
                            subscriptionObj.trial.operator.easypaisa = subscriptionObj.trial.operator.easypaisa + 1;

                        //Source wise subscriptions
                        if(innerObj.history.source === 'app')
                            subscriptionObj.trial.source.app = subscriptionObj.trial.source.app + 1;
                        else if(innerObj.history.source === 'web')
                            subscriptionObj.trial.source.web = subscriptionObj.trial.source.web + 1;
                        else if(innerObj.history.source === 'gdn2')
                            subscriptionObj.trial.source.gdn2 = subscriptionObj.trial.source.gdn2 + 1;
                        else if(innerObj.history.source === 'HE')
                            subscriptionObj.trial.source.HE = subscriptionObj.trial.source.HE + 1;
                        else if(innerObj.history.source === 'affiliate_web')
                            subscriptionObj.trial.source.affiliate_web = Number(subscriptionObj.trial.source.affiliate_web) + 1;
                        else
                            subscriptionObj.trial.source.other_mids = Number(subscriptionObj.trial.source.other_mids) + 1;
                    }

                    //Affiliate mid wise subscriptions
                    if(billing_status === 'Affiliate callback sent'){

                        affiliate_mid = innerObj.history.transaction_id;
                        affiliate_mid = affiliate_mid.split('*')[1];
                        affiliate_mid = affiliate_mid.trim();

                        if(affiliate_mid === 'aff3')
                            subscriptionObj.affiliate_mid.aff3 = subscriptionObj.affiliate_mid.aff3 + 1;
                        else if(affiliate_mid === 'aff3a')
                            subscriptionObj.affiliate_mid.aff3a = subscriptionObj.affiliate_mid.aff3a + 1;
                        else if(affiliate_mid === 'gdn')
                            subscriptionObj.affiliate_mid.gdn = subscriptionObj.affiliate_mid.gdn + 1;
                        else if(affiliate_mid === 'gdn2')
                            subscriptionObj.affiliate_mid.gdn2 = subscriptionObj.affiliate_mid.gdn2 + 1;
                        else if(affiliate_mid === 'goonj')
                            subscriptionObj.affiliate_mid.goonj = subscriptionObj.affiliate_mid.goonj + 1;
                        else if(affiliate_mid === '1565')
                            subscriptionObj.affiliate_mid['1565'] = subscriptionObj.affiliate_mid['1565'] + 1;
                        else if(affiliate_mid === '1569')
                            subscriptionObj.affiliate_mid['1569'] = subscriptionObj.affiliate_mid['1569'] + 1;
                        else if(affiliate_mid === '1')
                            subscriptionObj.affiliate_mid['1'] = subscriptionObj.affiliate_mid['1'] + 1;
                        else if(affiliate_mid === 'null')
                            subscriptionObj.affiliate_mid['null'] = subscriptionObj.affiliate_mid['null'] + 1;
                    }

                    //Active subscriptions & subscribers
                    if (billing_status === "Success"){
                        // console.log('Active subscriptions - billing_status: ', k, subscriptionsArrIndex, billing_status);

                        subscriptionObj.active = Number(subscriptionObj.active) + 1;
                        subscriberObj.active = Number(subscriberObj.active) + 1;

                        // console.log('subscriptionObj.active : ', subscriptionObj.active);
                    }

                    //inactive subscriptions & subscribers
                    if (billing_status === "expired" || billing_status === "unsubscribe-request-received-and-expired") {
                        subscriptionObj.nonActive = Number(subscriptionObj.nonActive) + 1;
                        subscriberObj.nonActive = Number(subscriberObj.nonActive) + 1;
                    }


                    subscriptionObj.billing_dtm = outerObj.billing_dtm;
                    subscriberObj.billing_dtm = outerObj.billing_dtm;
                    subscriptionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.history.billing_dtm), null, 0, 0, 0);
                    subscriberObj.billing_dtm_hours = helper.setDate(new Date(innerObj.history.billing_dtm), null, 0, 0, 0);
                }
            }
            subscriptionFinalList.push(subscriptionObj);
            subscribersFinalList.push(subscriberObj);
        }
    }

    return {subscriptionFinalList: subscriptionFinalList, subscribersFinalList: subscribersFinalList};
}

function computeSubscriptionsDataOld(subscriptions) {

    console.log(' &&&&&&&&&&&  computeSubscriptionsData   &&&&&&&&&&&&&&&&&&');
    let subscriptionObj, subscriberObj, thisHour, subscriptionsArrIndex, subscribersArrIndex, innerObj, billing_status, affiliate_mid, subscriptionFinalList = [], subscribersFinalList = [];
    for (let k=0; k < subscriptions.length; k++) {

        innerObj = subscriptions[k];
        thisHour = helper.setDate(new Date(innerObj.history.billing_dtm), null, 0, 0, 0);
        subscriptionsArrIndex = helper.checkDataExist(subscriptionFinalList, thisHour, 'billing_dtm_hours');
        subscribersArrIndex = helper.checkDataExist(subscribersFinalList, thisHour, 'billing_dtm_hours');
        billing_status = innerObj.history.billing_status;

        if ( subscriptionsArrIndex !== -1 )
            subscriptionObj = subscriptionFinalList[subscriptionsArrIndex];
        else
            subscriptionObj = _.cloneDeep(cloneSubscriptionsObj());

        if ( subscribersArrIndex !== -1 )
            subscriberObj = subscribersFinalList[subscribersArrIndex];
        else
            subscriberObj = _.cloneDeep(cloneSubscribersObj());

        //Successful Subscriptions
        if(billing_status === "Success" || billing_status === "billed"){

            //Package wise subscriptions
            if(innerObj.history.package_id === 'QDfC')
                subscriptionObj.successful.package.dailyLive = Number(subscriptionObj.successful.package.dailyLive) + 1;
            else if(innerObj.history.package_id === 'QDfG')
                subscriptionObj.successful.package.weeklyLive = Number(subscriptionObj.successful.package.weeklyLive) + 1;
            else if(innerObj.history.package_id === 'QDfH')
                subscriptionObj.successful.package.dailyComedy = Number(subscriptionObj.successful.package.dailyComedy) + 1;
            else if(innerObj.history.package_id === 'QDfI')
                subscriptionObj.successful.package.weeklyComedy = Number(subscriptionObj.successful.package.weeklyComedy) + 1;

            //Paywall wise subscriptions
            if(innerObj.history.paywall_id === 'ghRtjhT7')
                subscriptionObj.successful.paywall.comedy = Number(subscriptionObj.successful.paywall.comedy) + 1;
            else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                subscriptionObj.successful.paywall.live = Number(subscriptionObj.successful.paywall.live) + 1;

            //Operator wise subscriptions
            if(innerObj.history.operator === 'telenor')
                subscriptionObj.successful.operator.telenor = Number(subscriptionObj.successful.operator.telenor) + 1;
            else
                subscriptionObj.successful.operator.easypaisa = Number(subscriptionObj.successful.operator.easypaisa) + 1;

            //Source wise subscriptions
            if(innerObj.history.source === 'app')
                subscriptionObj.successful.source.app = Number(subscriptionObj.successful.source.app) + 1;
            else if(innerObj.history.source === 'web')
                subscriptionObj.successful.source.web = Number(subscriptionObj.successful.source.web) + 1;
            else if(innerObj.history.source === 'gdn2')
                subscriptionObj.successful.source.gdn2 = Number(subscriptionObj.successful.source.gdn2) + 1;
            else if(innerObj.history.source === 'HE')
                subscriptionObj.successful.source.HE = Number(subscriptionObj.successful.source.HE) + 1;
            else if(innerObj.history.source === 'affiliate_web')
                subscriptionObj.successful.source.affiliate_web = Number(subscriptionObj.successful.source.affiliate_web) + 1;
            else
                subscriptionObj.successful.source.other_mids = Number(subscriptionObj.successful.source.other_mids) + 1;

            // console.log('subscriptionObj.successful : ', subscriptionObj.successful);
        }

        // Graced subscriptions
        if (billing_status === "graced") {

            //Package wise subscriptions
            if(innerObj.history.package_id === 'QDfC')
                subscriptionObj.graced.package.dailyLive = subscriptionObj.graced.package.dailyLive + 1;
            else if(innerObj.history.package_id === 'QDfG')
                subscriptionObj.graced.package.weeklyLive = subscriptionObj.graced.package.weeklyLive + 1;
            else if(innerObj.history.package_id === 'QDfH')
                subscriptionObj.graced.package.dailyComedy = subscriptionObj.graced.package.dailyComedy + 1;
            else if(innerObj.history.package_id === 'QDfI')
                subscriptionObj.graced.package.weeklyComedy = subscriptionObj.graced.package.weeklyComedy + 1;

            //Paywall wise subscriptions
            if(innerObj.history.paywall_id === 'ghRtjhT7')
                subscriptionObj.graced.paywall.comedy = subscriptionObj.graced.paywall.comedy + 1;
            else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                subscriptionObj.graced.paywall.live = subscriptionObj.graced.paywall.live + 1;

            //Operator wise subscriptions
            if(innerObj.history.operator === 'telenor')
                subscriptionObj.graced.operator.telenor = subscriptionObj.graced.operator.telenor + 1;
            else
                subscriptionObj.graced.operator.easypaisa = subscriptionObj.graced.operator.easypaisa + 1;

            //Source wise subscriptions
            if(innerObj.history.source === 'app')
                subscriptionObj.graced.source.app = subscriptionObj.graced.source.app + 1;
            else if(innerObj.history.source === 'web')
                subscriptionObj.graced.source.web = subscriptionObj.graced.source.web + 1;
            else if(innerObj.history.source === 'gdn2')
                subscriptionObj.graced.source.gdn2 = subscriptionObj.graced.source.gdn2 + 1;
            else if(innerObj.history.source === 'HE')
                subscriptionObj.graced.source.HE = subscriptionObj.graced.source.HE + 1;
            else if(innerObj.history.source === 'affiliate_web')
                subscriptionObj.graced.source.affiliate_web = Number(subscriptionObj.graced.source.affiliate_web) + 1;
            else
                subscriptionObj.graced.source.other_mids = Number(subscriptionObj.graced.source.other_mids) + 1;
        }

        // Trialed subscriptions
        if (billing_status === "trial") {

            //Package wise subscriptions
            if(innerObj.history.package_id === 'QDfC')
                subscriptionObj.trial.package.dailyLive = subscriptionObj.trial.package.dailyLive + 1;
            else if(innerObj.history.package_id === 'QDfG')
                subscriptionObj.trial.package.weeklyLive = subscriptionObj.trial.package.weeklyLive + 1;
            else if(innerObj.history.package_id === 'QDfH')
                subscriptionObj.trial.package.dailyComedy = subscriptionObj.trial.package.dailyComedy + 1;
            else if(innerObj.history.package_id === 'QDfI')
                subscriptionObj.trial.package.weeklyComedy = subscriptionObj.trial.package.weeklyComedy + 1;

            //Paywall wise subscriptions
            if(innerObj.history.paywall_id === 'ghRtjhT7')
                subscriptionObj.trial.paywall.comedy = subscriptionObj.trial.paywall.comedy + 1;
            else if(innerObj.history.paywall_id === 'Dt6Gp70c')
                subscriptionObj.trial.paywall.live = subscriptionObj.trial.paywall.live + 1;

            //Operator wise subscriptions
            if(innerObj.history.operator === 'telenor')
                subscriptionObj.trial.operator.telenor = subscriptionObj.trial.operator.telenor + 1;
            else
                subscriptionObj.trial.operator.easypaisa = subscriptionObj.trial.operator.easypaisa + 1;

            //Source wise subscriptions
            if(innerObj.history.source === 'app')
                subscriptionObj.trial.source.app = subscriptionObj.trial.source.app + 1;
            else if(innerObj.history.source === 'web')
                subscriptionObj.trial.source.web = subscriptionObj.trial.source.web + 1;
            else if(innerObj.history.source === 'gdn2')
                subscriptionObj.trial.source.gdn2 = subscriptionObj.trial.source.gdn2 + 1;
            else if(innerObj.history.source === 'HE')
                subscriptionObj.trial.source.HE = subscriptionObj.trial.source.HE + 1;
            else if(innerObj.history.source === 'affiliate_web')
                subscriptionObj.trial.source.affiliate_web = Number(subscriptionObj.trial.source.affiliate_web) + 1;
            else
                subscriptionObj.trial.source.other_mids = Number(subscriptionObj.trial.source.other_mids) + 1;
        }

        //Affiliate mid wise subscriptions
        if(billing_status === 'Affiliate callback sent'){

            affiliate_mid = innerObj.history.transaction_id;
            affiliate_mid = affiliate_mid.split('*')[1];
            affiliate_mid = affiliate_mid.trim();

            if(affiliate_mid === 'aff3')
                subscriptionObj.affiliate_mid.aff3 = subscriptionObj.affiliate_mid.aff3 + 1;
            else if(affiliate_mid === 'aff3a')
                subscriptionObj.affiliate_mid.aff3a = subscriptionObj.affiliate_mid.aff3a + 1;
            else if(affiliate_mid === 'gdn')
                subscriptionObj.affiliate_mid.gdn = subscriptionObj.affiliate_mid.gdn + 1;
            else if(affiliate_mid === 'gdn2')
                subscriptionObj.affiliate_mid.gdn2 = subscriptionObj.affiliate_mid.gdn2 + 1;
            else if(affiliate_mid === 'goonj')
                subscriptionObj.affiliate_mid.goonj = subscriptionObj.affiliate_mid.goonj + 1;
            else if(affiliate_mid === '1565')
                subscriptionObj.affiliate_mid['1565'] = subscriptionObj.affiliate_mid['1565'] + 1;
            else if(affiliate_mid === '1569')
                subscriptionObj.affiliate_mid['1569'] = subscriptionObj.affiliate_mid['1569'] + 1;
            else if(affiliate_mid === '1')
                subscriptionObj.affiliate_mid['1'] = subscriptionObj.affiliate_mid['1'] + 1;
            else if(affiliate_mid === 'null')
                subscriptionObj.affiliate_mid['null'] = subscriptionObj.affiliate_mid['null'] + 1;
        }

        //Active subscriptions & subscribers
        if (billing_status === "Success"){
            // console.log('Active subscriptions - billing_status: ', k, subscriptionsArrIndex, billing_status);

            subscriptionObj.active = Number(subscriptionObj.active) + 1;
            subscriberObj.active = Number(subscriberObj.active) + 1;

            // console.log('subscriptionObj.active : ', subscriptionObj.active);
        }

        //inactive subscriptions & subscribers
        if (billing_status === "expired" || billing_status === "unsubscribe-request-received-and-expired") {
            subscriptionObj.nonActive = Number(subscriptionObj.nonActive) + 1;
            subscriberObj.nonActive = Number(subscriberObj.nonActive) + 1;
        }

        //Update timestamp
        subscriptionObj.billing_dtm = innerObj.history.billing_dtm;
        subscriberObj.billing_dtm = innerObj.history.billing_dtm;
        subscriptionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.history.billing_dtm), null, 0, 0, 0);
        subscriberObj.billing_dtm_hours = helper.setDate(new Date(innerObj.history.billing_dtm), null, 0, 0, 0);

        if ( subscriptionsArrIndex !== -1 )
            subscriptionFinalList[subscriptionsArrIndex] = subscriptionObj;
        else
            subscriptionFinalList.push(subscriptionObj);

        if ( subscribersArrIndex !== -1 )
            subscribersFinalList[subscribersArrIndex] = subscriberObj;
        else
            subscribersFinalList.push(subscriberObj);
    }

    // console.log('subscriptionFinalList: ', subscriptionFinalList);
    // console.log('subscribersFinalList: ', subscribersFinalList);
    return {subscriptionFinalList: subscriptionFinalList, subscribersFinalList: subscribersFinalList};
}

async function insertNewRecordOld(subscriptionFinalList, subscribersFinalList, dateString, itration) {
    console.log('dateString: ', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, subscriptionFinalList.length, subscribersFinalList.length);
    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (dbDataArr) {
        if (dbDataArr.length > 0){
            dbDataArr = dbDataArr[0];

            if (itration === 0){
                console.log('iterationNo === if ', itration);

                dbDataArr.subscriptions = subscriptionFinalList;

                if (dbDataArr.subscribers)
                    dbDataArr.subscribers.activeInActive = subscribersFinalList;
                else{
                    dbDataArr.subscribers = {activeInActive: ''};
                    dbDataArr.subscribers.activeInActive = subscribersFinalList;
                }
            }else{

                console.log('iterationNo === else ', itration);

                if (dbDataArr.subscriptions){
                    console.log('IF Case === ');

                    subscriptionFinalList = updateDataArr(dbDataArr.subscriptions, subscriptionFinalList, 'subscriptions');
                    dbDataArr.subscriptions = subscriptionFinalList;
                }
                else{
                    console.log('Else Case === ');
                    dbDataArr.subscriptions = subscriptionFinalList;
                }


                if (dbDataArr.subscribers){
                    subscribersFinalList = updateDataArr(dbDataArr.subscribers.activeInActive, subscribersFinalList, 'subscribers');
                    dbDataArr.subscribers.activeInActive = subscribersFinalList;
                }
                else{
                    dbDataArr.subscribers = {activeInActive: ''};
                    dbDataArr.subscribers.activeInActive = subscribersFinalList;
                }
            }

            await reportsRepo.updateReport(dbDataArr, dbDataArr._id);
        }
        else{
            let subscribers = {activeInActive: ''};
            subscribers.activeInActive = subscribersFinalList;
            await reportsRepo.createReport({subscriptions: subscriptionFinalList, subscribers: subscribers, date: dateString});
        }
    });
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

function updateDataArr(dbDataArr, computedDataArr, mode) {
    console.log('************  updateDataArr *********** : ');

    var thisHour, arrIndex, innerObj, updatedObj;
    for (let i = 0; i < computedDataArr.length; i++){
        innerObj = computedDataArr[i];
        thisHour = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
        arrIndex = helper.checkDataExist(dbDataArr, thisHour, 'billing_dtm_hours');

        console.log('arrIndex: ', arrIndex);
        if ( arrIndex !== -1 ){

            console.log('Before - innerObj: ', innerObj);
            console.log('Before - dbDataArr[arrIndex]: ', dbDataArr[arrIndex]);

            updatedObj = updateSingleObj(dbDataArr[arrIndex], innerObj, mode);
            dbDataArr[arrIndex] = _.cloneDeep(updatedObj);

            console.log('After - dbDataArr[arrIndex]: ', dbDataArr[arrIndex]);
        }
        else
            dbDataArr.push(innerObj);
    }

    return dbDataArr;
}
function updateSingleObj(dbDataArrObj, innerObj, mode){

    console.log('%%%%%%%%%%%%%%%  dbDataArrObj %%%%%%%%%%%%%%%% : ', mode);

    if (mode === 'subscribers') {
        dbDataArrObj.active = Number(dbDataArrObj.active) + Number(innerObj.active);
        dbDataArrObj.nonActive = Number(dbDataArrObj.nonActive) + Number(innerObj.nonActive);
    }
    else if (mode === 'subscriptions'){
        dbDataArrObj.active = Number(dbDataArrObj.active) + Number(innerObj.active);
        dbDataArrObj.nonActive = Number(dbDataArrObj.nonActive) + Number(innerObj.nonActive);

        //successful wise
        dbDataArrObj.successful.package = updateLastObj(dbDataArrObj.successful.package, innerObj.successful.package);
        dbDataArrObj.successful.paywall = updateLastObj(dbDataArrObj.successful.paywall, innerObj.successful.paywall);
        dbDataArrObj.successful.operator = updateLastObj(dbDataArrObj.successful.operator, innerObj.successful.operator);
        dbDataArrObj.successful.source = updateLastObj(dbDataArrObj.successful.source, innerObj.successful.source);

        //trial wise
        dbDataArrObj.trial.package = updateLastObj(dbDataArrObj.trial.package, innerObj.trial.package);
        dbDataArrObj.trial.paywall = updateLastObj(dbDataArrObj.trial.paywall, innerObj.trial.paywall);
        dbDataArrObj.trial.operator = updateLastObj(dbDataArrObj.trial.operator, innerObj.trial.operator);
        dbDataArrObj.trial.source = updateLastObj(dbDataArrObj.trial.source, innerObj.trial.source);

        //graced wise
        dbDataArrObj.graced.package = updateLastObj(dbDataArrObj.graced.package, innerObj.graced.package);
        dbDataArrObj.graced.paywall = updateLastObj(dbDataArrObj.graced.paywall, innerObj.graced.paywall);
        dbDataArrObj.graced.operator = updateLastObj(dbDataArrObj.graced.operator, innerObj.graced.operator);
        dbDataArrObj.graced.source = updateLastObj(dbDataArrObj.graced.source, innerObj.graced.source);

        // affiliate mids wise
        dbDataArrObj.affiliate_mid = updateLastObj(dbDataArrObj.affiliate_mid, innerObj.affiliate_mid);
    }

    return dbDataArrObj;
}
function updateLastObj(...objs){
    return objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (Number(a[k]) || 0) + Number(b[k]);
        }
        return a;
    }, {});
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
function cloneSubscriptionsObj() {
    let dataObj = {
        package: _.cloneDeep({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 }),
        paywall: _.cloneDeep({ comedy: 0, live: 0 }),
        operator: _.cloneDeep({ telenor: 0, easypaisa: 0 }),
        source: _.cloneDeep({ app: 0, web: 0, gdn2: 0, HE: 0, affiliate_web: 0, other_mids: 0 })
    };
    let affiliate = { aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, '1565': 0, '1569': 0, '1': 0, 'null': 0 };
    return {
        active : 0,
        nonActive: 0,
        successful: _.cloneDeep(dataObj),
        graced: _.cloneDeep(dataObj),
        trial: _.cloneDeep(dataObj),
        affiliate_mid: _.cloneDeep(affiliate),
        billing_dtm: '',
        billing_dtm_hours: ''
    };
}

function countQuery(from, to){
    return [
        {
            $match:{
                $or:[
                    {billing_status: "trial"},
                    {billing_status: "Success"},
                    {billing_status: "expired"},
                    {billing_status: "Affiliate callback sent"},
                    {billing_status: "unsubscribe-request-received-and-expired"}
                ],
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
                billing_dtm: "$billing_dtm",
            }},
        {$group: {
                _id: { "user_id": "$user_id", "package_id": "$package_id"},
                history: { $push:  {
                        source: "$source",
                        micro_charge: "$micro_charge",
                        paywall_id: "$paywall_id",
                        package_id: "$package_id",
                        operator: "$operator",
                        transaction_id: "$transaction_id",
                        billing_status: "$billing_status",
                        billing_dtm: "$billing_dtm"
                    }}
            }},
        {$project:{
            _id: 0,
            user_id: "$_id.user_id",
            history: {$arrayElemAt:["$history", 0]}
        }},
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeSubscriptionReports: computeSubscriptionReports,
    promiseBasedComputeSubscriptionReports: promiseBasedComputeSubscriptionReports,
};
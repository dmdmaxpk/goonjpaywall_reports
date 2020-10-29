const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, computedData;
let sourceWiseUnSub = [], sourceWiseTrail = [], transactingSubsList = [];
let computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;

computeBillingHistoryReports = async(req, res) => {
    console.log('computeBillingHistoryReports: ');

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

    await helper.getTotalCount(req, fromDate, toDate, 'billinghistories').then(async function (totalCount) {
        console.log('totalCount: ', totalCount);

        if (totalCount > 0){
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0 ; i < totalChunks; i++){
                await billingHistoryRepo.getBillingHistoryByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                    console.log('result 1: ', result.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeBillingHistoryData(result);
                        sourceWiseUnSub = computedData.sourceWiseUnSub;
                        sourceWiseTrail = computedData.sourceWiseTrail;
                        transactingSubsList = computedData.transactingSubsList;

                        await insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await billingHistoryRepo.getBillingHistoryByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                    console.log('result 2: ', result.length);

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeBillingHistoryData(result);
                        sourceWiseUnSub = computedData.sourceWiseUnSub;
                        sourceWiseTrail = computedData.sourceWiseTrail;
                        transactingSubsList = computedData.transactingSubsList;

                        await insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, fromDate, 1);
                    }
                });
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeBillingHistoryReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeBillingHistoryReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeBillingHistoryReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeBillingHistoryReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeBillingHistoryReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeBillingHistoryReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};
promiseBasedComputeBillingHistoryReports = async(req, res) => {
    console.log('promiseBasedComputeBillingHistoryReports: ');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        await helper.getTotalCount(req, fromDate, toDate, 'billinghistories').then(async function (totalCount) {
            console.log('totalCount: ', totalCount);

            if (totalCount > 0){
                computeChunks = helper.getChunks(totalCount);
                totalChunks = computeChunks.chunks;
                lastLimit = computeChunks.lastChunkCount;
                let skip = 0;

                //Loop over no.of chunks
                for (i = 0 ; i < totalChunks; i++){
                    await billingHistoryRepo.getBillingHistoryByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                        console.log('result 1: ', result.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeBillingHistoryData(result);
                            sourceWiseUnSub = computedData.sourceWiseUnSub;
                            sourceWiseTrail = computedData.sourceWiseTrail;
                            transactingSubsList = computedData.transactingSubsList;

                            await insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await billingHistoryRepo.getBillingHistoryByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                        console.log('result 2: ', result.length);

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeBillingHistoryData(result);
                            sourceWiseUnSub = computedData.sourceWiseUnSub;
                            sourceWiseTrail = computedData.sourceWiseTrail;
                            transactingSubsList = computedData.transactingSubsList;

                            await insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, fromDate, 1);
                        }
                    });
                }
            }

            if (helper.isToday(fromDate)){
                console.log('promiseBasedComputeBillingHistoryReports - data compute - done');
                delete req.day;
                delete req.month;
            }
            resolve(0);
        });
    });
};

function computeBillingHistoryData(data) {

    let dateInMili, outer_added_dtm, inner_added_dtm;
    let outerObj, innerObj, transactionObj, unSubSourceWise, trialSourceWise;
    let sourceWiseTrailArr = [], sourceWiseUnSubArr = [], transactingSubsList = [];

    for (let j=0; j < data.length; j++) {

        unSubSourceWise = _.clone(cloneUnSubSourceWiseChargeObj());
        trialSourceWise = _.clone(cloneTrialSourceWiseObj());
        transactionObj = _.clone(cloneTransactionObj());

        outerObj = data[j];
        outer_added_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();
        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < data.length; k++) {

                innerObj = data[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();
                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;

                    console.log('transactionObj: ', transactionObj);
                    console.log('transactionObj.billingStatus: ', transactionObj.billingStatus);
                    //Billing status wise billingHistory
                    if(innerObj.billing_status === 'trial')
                        transactionObj.billingStatus.trial = transactionObj.billingStatus.trial + 1;
                    else if(innerObj.billing_status === 'graced')
                        transactionObj.billingStatus.graced = transactionObj.billingStatus.graced + 1;
                    else if(innerObj.billing_status === 'expired')
                        transactionObj.billingStatus.expired = transactionObj.billingStatus.expired + 1;
                    else if(innerObj.billing_status === 'Success' || innerObj.billing_status === 'billed')
                        transactionObj.billingStatus.success = transactionObj.billingStatus.success + 1;
                    else if(innerObj.billing_status === 'Affiliate callback sent')
                        transactionObj.billingStatus.affiliate_callback_sent = transactionObj.billingStatus.affiliate_callback_sent + 1;
                    else if(innerObj.billing_status === 'graced_and_stream_stopped')
                        transactionObj.billingStatus.graced_and_stream_stopped = transactionObj.billingStatus.graced_and_stream_stopped + 1;
                    else if(innerObj.billing_status === 'micro-charging-exceeded')
                        transactionObj.billingStatus.micro_charging_exceeded = transactionObj.billingStatus.micro_charging_exceeded + 1;
                    else if(innerObj.billing_status === 'direct-billing-tried-but-failed')
                        transactionObj.billingStatus.direct_billing_tried_but_failed = transactionObj.billingStatus.direct_billing_tried_but_failed + 1;
                    else if(innerObj.billing_status === 'package_change_upon_user_request')
                        transactionObj.billingStatus.package_change_upon_user_request = transactionObj.billingStatus.package_change_upon_user_request + 1;
                    else if(innerObj.billing_status === 'switch-package-request-tried-but-failed')
                        transactionObj.billingStatus.switch_package_request_tried_but_failed = transactionObj.billingStatus.switch_package_request_tried_but_failed + 1;
                    else if(innerObj.billing_status === 'unsubscribe-request-received-and-expired')
                        transactionObj.billingStatus.unsubscribe_request_received_and_expired = transactionObj.billingStatus.unsubscribe_request_received_and_expired + 1;
                    else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package')
                        transactionObj.billingStatus.subscription_request_received_for_the_same_package = transactionObj.billingStatus.subscription_request_received_for_the_same_package + 1;
                    else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package-after-unsub')
                        transactionObj.billingStatus.subscription_request_received_for_the_same_package_after_unsub = transactionObj.billingStatus.subscription_request_received_for_the_same_package_after_unsub + 1;
                    else
                        transactionObj.billingStatus.other_subscriptions_status_wise = transactionObj.billingStatus.other_subscriptions_status_wise + 1;

                    //Package wise revenue and Billed Users

                    if(innerObj.package_id === 'QDfC'){
                        transactionObj.transactions.package.dailyLive = transactionObj.transactions.package.dailyLive + 1;
                        transactionObj.subscribers.package.dailyLive = transactionObj.subscribers.package.dailyLive + 1;
                    }
                    else if(innerObj.package_id === 'QDfG'){
                        transactionObj.transactions.package.weeklyLive = transactionObj.transactions.package.weeklyLive + 1;
                        transactionObj.subscribers.package.weeklyLive = transactionObj.subscribers.package.weeklyLive + 1;
                    }
                    else if(innerObj.package_id === 'QDfH'){
                        transactionObj.transactions.package.dailyComedy = transactionObj.transactions.package.dailyComedy + 1;
                        transactionObj.subscribers.package.dailyComedy = transactionObj.subscribers.package.dailyComedy + 1;
                    }
                    else if(innerObj.package_id === 'QDfI'){
                        transactionObj.transactions.package.weeklyComedy = transactionObj.transactions.package.weeklyComedy + 1;
                        transactionObj.subscribers.package.weeklyComedy = transactionObj.subscribers.package.weeklyComedy + 1;
                    }

                    //Paywall wise revenue and Billed Users
                    if(innerObj.paywall_id === 'Dt6Gp70c'){
                        transactionObj.transactions.paywall.comedy = transactionObj.transactions.paywall.comedy + 1;
                        transactionObj.subscribers.paywall.comedy = transactionObj.subscribers.paywall.comedy + 1;
                    }
                    else if(innerObj.paywall_id === 'ghRtjhT7'){
                        transactionObj.transactions.paywall.live = transactionObj.transactions.paywall.live + 1;
                        transactionObj.subscribers.paywall.live = transactionObj.subscribers.paywall.live + 1;
                    }

                    //Operator wise revenue and Billed Users
                    if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                        transactionObj.transactions.operator.telenor = transactionObj.transactions.operator.telenor + 1;
                        transactionObj.subscribers.operator.telenor = transactionObj.subscribers.operator.telenor + 1;
                    } else if(innerObj.operator === 'easypaisa'){
                        transactionObj.transactions.operator.easypaisa = transactionObj.transactions.operator.easypaisa + 1;
                        transactionObj.subscribers.operator.easypaisa = transactionObj.subscribers.operator.easypaisa + 1;
                    }

                    //Price wise charge & transaction details
                    if (innerObj.price === 15){
                        transactionObj.transactions.price['15'] = transactionObj.transactions.price['15'] + 1;
                        transactionObj.subscribers.price['15'] = transactionObj.subscribers.price['15'] + 1;
                    }
                    else if (innerObj.price === 11){
                        transactionObj.transactions.price['11'] = transactionObj.transactions.price['11'] + 1;
                        transactionObj.subscribers.price['11'] = transactionObj.subscribers.price['11'] + 1;
                    }
                    else if (innerObj.price === 10){
                        transactionObj.transactions.price['10'] = transactionObj.transactions.price['10'] + 1;
                        transactionObj.subscribers.price['10'] = transactionObj.subscribers.price['10'] + 1;
                    }
                    else if (innerObj.price === 7){
                        transactionObj.transactions.price['7'] = transactionObj.transactions.price['7'] + 1;
                        transactionObj.subscribers.price['7'] = transactionObj.subscribers.price['7'] + 1;
                    }
                    else if (innerObj.price === 5){
                        transactionObj.transactions.price['5'] = transactionObj.transactions.price['5'] + 1;
                        transactionObj.subscribers.price['5'] = transactionObj.subscribers.price['5'] + 1;
                    }
                    else if(innerObj.price === 4){
                        transactionObj.transactions.price['4'] = transactionObj.transactions.price['4'] + 1;
                        transactionObj.subscribers.price['4'] = transactionObj.subscribers.price['4'] + 1;
                    }
                    else if (innerObj.price === 2){
                        transactionObj.transactions.price['2'] = transactionObj.transactions.price['2'] + 1;
                        transactionObj.subscribers.price['2'] = transactionObj.subscribers.price['2'] + 1;
                    }


                    //Transactions success/failure rate and net total
                    if (innerObj.billing_status === 'Success' || innerObj.billing_status === 'billed'){
                        //Success rate
                        transactionObj.transactions.successRate = transactionObj.transactions.successRate + 1;
                        transactionObj.transactions.netTotal = transactionObj.transactions.netTotal + 1;
                    }
                    else{
                        //Failure Rate
                        transactionObj.transactions.netTotal = transactionObj.transactions.netTotal + 1;
                        transactionObj.transactions.failureRate = transactionObj.transactions.failureRate + 1;
                    }

                    // Source wise un-subscribe
                    if((( innerObj.billing_status === 'unsubscribe-request-recieved' && innerObj.billing_status === 'unsubscribe-request-received-and-expired' )
                        && innerObj.operator === 'telenor') ||
                        (innerObj.billing_status === 'expired' || innerObj.billing_status === 'unsubscribe-request-received-and-expired') && innerObj.operator_response !== undefined
                    ) {
                        if (innerObj.source){
                            if(innerObj.source === ""){
                                unSubSourceWise.emptyString = unSubSourceWise.emptyString + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "HE"){
                                unSubSourceWise.he = unSubSourceWise.he + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "na"){
                                unSubSourceWise.na = unSubSourceWise.na + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP"){
                                unSubSourceWise.cp = unSubSourceWise.cp + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CC"){
                                unSubSourceWise.cc = unSubSourceWise.cc + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "pwa"){
                                unSubSourceWise.pwa = unSubSourceWise.pwa + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "app"){
                                unSubSourceWise.app = unSubSourceWise.app + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "web"){
                                unSubSourceWise.web = unSubSourceWise.web + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "sms"){
                                unSubSourceWise.sms = unSubSourceWise.sms + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "null"){
                                unSubSourceWise.null = unSubSourceWise.null + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "'null'"){
                                unSubSourceWise.null2 = unSubSourceWise.null2 + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "gdn2"){
                                unSubSourceWise.gdn2 = unSubSourceWise.gdn2 + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "system"){
                                unSubSourceWise.system = unSubSourceWise.system + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "systemExpire"){
                                unSubSourceWise.systemExpire = unSubSourceWise.systemExpire + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "ccp_api"){
                                unSubSourceWise.ccp_api = unSubSourceWise.ccp_api + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_null"){
                                unSubSourceWise.CP_null = unSubSourceWise.CP_null + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_telenorccd"){
                                unSubSourceWise.CP_telenorccd = unSubSourceWise.CP_telenorccd + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "affiliate_web"){
                                unSubSourceWise.affiliate_web = unSubSourceWise.affiliate_web + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_productccd"){
                                unSubSourceWise.CP_productccd = unSubSourceWise.CP_productccd + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_whatsappccd"){
                                unSubSourceWise.CP_whatsappccd = unSubSourceWise.CP_whatsappccd + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_ideationccd1"){
                                unSubSourceWise.CP_ideationccd1 = unSubSourceWise.CP_ideationccd1 + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "CP_ideationccd2"){
                                unSubSourceWise.CP_ideationccd2 = unSubSourceWise.CP_ideationccd2 + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }else if(innerObj.source === "system-after-grace-end"){
                                unSubSourceWise.system_after_grace_end = unSubSourceWise.system_after_grace_end + 1;
                                unSubSourceWise.total = unSubSourceWise.total + 1;
                            }
                        }
                    }

                    // Trail Activated Source wise
                    if(innerObj.billing_status === 'trial'){
                        //app, web, sms, HE
                        if (innerObj.source){
                            if(innerObj.source === "app" || innerObj.source === "na"){
                                trialSourceWise.app = trialSourceWise.app + 1;
                                trialSourceWise.total = trialSourceWise.total + 1;
                            }else if(innerObj.source === "web"){
                                trialSourceWise.web = trialSourceWise.web + 1;
                                trialSourceWise.total = trialSourceWise.total + 1;
                            }else if(innerObj.source === "HE") {
                                trialSourceWise.he = trialSourceWise.he + 1;
                                trialSourceWise.total = trialSourceWise.total + 1;
                            }
                        }
                    }


                    /*
                    * Timestepms
                    * */
                    transactionObj.billing_dtm = outerObj.billing_dtm;
                    transactionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Un-subscribe Source wise - timestemps
                    unSubSourceWise.added_dtm = outerObj.billing_dtm;
                    unSubSourceWise.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Trail Activated Source wise - timestemps
                    trialSourceWise.added_dtm = outerObj.billing_dtm;
                    trialSourceWise.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }

            //Calculate success and failure rate
            if (transactionObj.transactions.netTotal > 0){
                transactionObj.transactions.successRate = (transactionObj.transactions.successRate / transactionObj.transactions.netTotal) * 100;
                transactionObj.transactions.failureRate = (transactionObj.transactions.failureRate / transactionObj.transactions.netTotal) * 100;
            }
            else{
                transactionObj.transactions.failureRate = 0;
                transactionObj.transactions.successRate = 0;
            }

            sourceWiseUnSubArr.push(unSubSourceWise);
            sourceWiseTrailArr.push(trialSourceWise);
            transactingSubsList.push(transactionObj);
        }
    }

    return {
        sourceWiseUnSub: sourceWiseUnSubArr,
        sourceWiseTrail: sourceWiseTrailArr,
        transactingSubsList: transactingSubsList
    };
}

async function insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, dateString, mode) {

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];

            if (mode === 0){
                result.sourceWiseUnSub = sourceWiseUnSub;
                result.sourceWiseTrail = sourceWiseTrail;
                result.transactions = transactingSubsList;
            } else{

                if (result.sourceWiseUnSub)
                    result.sourceWiseUnSub = result.sourceWiseUnSub.concat(sourceWiseUnSub);
                else
                    result.sourceWiseUnSub = sourceWiseUnSub;

                if (result.sourceWiseTrail)
                    result.sourceWiseTrail = result.sourceWiseTrail.concat(sourceWiseTrail);
                else
                    result.sourceWiseTrail = sourceWiseTrail;

                if (result.transactions)
                    result.transactions = result.transactions.concat(transactingSubsList);
                else
                    result.transactions = transactingSubsList;
            }
            await reportsRepo.updateReport(result, result._id);
        }
        else{
            await reportsRepo.createReport({
                sourceWiseUnSub: sourceWiseUnSub,
                sourceWiseTrail: sourceWiseTrail,
                transactions: transactingSubsList,
                date: dateString
            });
        }
    });
}

function cloneTransactionObj() {
    return {
        transactions: {
            source: {
                app: 0,
                web: 0,
                HE: 0,
                sms: 0,
                gdn2: 0,
                CP: 0,
                null: 0,
                affiliate_web: 0,
                system_after_grace_end: 0
            },
            package: {
                dailyLive: 0,
                weeklyLive: 0,
                dailyComedy: 0,
                weeklyComedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            },
            paywall: {
                comedy: 0,
                live: 0
            },
            price: {
                '15': 0,
                '11': 0,
                '10': 0,
                '7': 0,
                '5': 0,
                '4': 0,
                '3': 0,
            },
            billingStatus:{
                trial: 0,
                graced: 0,
                expired: 0,
                success: 0,
                affiliate_callback_sent: 0,
                micro_charging_exceeded: 0,
                graced_and_stream_stopped: 0,
                direct_billing_tried_but_failed: 0,
                package_change_upon_user_request: 0,
                switch_package_request_tried_but_failed: 0,
                unsubscribe_request_received_and_expired: 0,
                subscription_request_received_for_the_same_package: 0,
                subscription_request_received_for_the_same_package_after_unsub: 0,
                other_subscriptions_status_wise: 0
            },
            netTotal: 0,
            failureRate: 0,
            successRate: 0
        },
        subscribers: {
            source: {
                app: 0,
                web: 0,
                HE: 0,
                sms: 0,
                gdn2: 0,
                CP: 0,
                null: 0,
                affiliate_web: 0,
                system_after_grace_end: 0
            },
            package: {
                dailyLive: 0,
                weeklyLive: 0,
                dailyComedy: 0,
                weeklyComedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            },
            paywall: {
                comedy: 0,
                live: 0
            },
            price: {
                '15': 0,
                '11': 0,
                '10': 0,
                '7': 0,
                '5': 0,
                '4': 0,
                '3': 0,
            }
        },
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneTrialSourceWiseObj() {
    return {
        app: 0,
        web: 0,
        he: 0,
        total: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneUnSubSourceWiseChargeObj() {
    return {
        he: 0, na: 0, cc: 0, cp: 0, pwa: 0,
        mta: 0, app: 0, web: 0, sms: 0, null: 0,
        null2: 0, gdn2: 0, system: 0, ccp_api: 0,
        CP_null: 0, emptyString: 0, systemExpire: 0,
        CP_telenorccd: 0, affiliate_web: 0, CP_productccd: 0,
        CP_whatsappccd: 0, CP_ideationccd1: 0, CP_ideationccd2: 0,
        system_after_grace_end: 0, added_dtm: 0, added_dtm_hours: 0
    }
}

module.exports = {
    computeBillingHistoryReports: computeBillingHistoryReports,
    promiseBasedComputeBillingHistoryReports: promiseBasedComputeBillingHistoryReports
};
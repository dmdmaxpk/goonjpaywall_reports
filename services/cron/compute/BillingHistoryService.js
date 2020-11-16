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
    dateData = helper.computeNextDate(req, 16, 10);
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

    let transactionObj, unSubSourceWise, trialSourceWise;
    let sourceWiseTrailArr = [], sourceWiseUnSubArr = [], transactingSubsList = [];

    let thisHour, sourceWiseUnSubArrIndex, sourceWiseTrailArrIndex, transactingSubsListIndex,
        innerObj, billing_status;
    for (let k=0; k < data.length; k++) {

        innerObj = data[k];
        thisHour = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
        sourceWiseUnSubArrIndex = helper.checkDataExist(sourceWiseUnSubArr, thisHour, 'billing_dtm_hours');
        sourceWiseTrailArrIndex = helper.checkDataExist(sourceWiseTrailArr, thisHour, 'billing_dtm_hours');
        transactingSubsListIndex = helper.checkDataExist(transactingSubsList, thisHour, 'billing_dtm_hours');
        billing_status = innerObj.billing_status;

        if (sourceWiseUnSubArrIndex !== -1)
            unSubSourceWise = sourceWiseUnSubArr[sourceWiseUnSubArrIndex];
        else
            unSubSourceWise = _.cloneDeep(cloneUnSubSourceWiseChargeObj());

        if (sourceWiseTrailArrIndex !== -1)
            trialSourceWise = sourceWiseTrailArr[sourceWiseTrailArrIndex];
        else
            trialSourceWise = _.cloneDeep(cloneTrialSourceWiseObj());

        if (transactingSubsListIndex !== -1)
            transactionObj = transactingSubsList[transactingSubsListIndex];
        else
            transactionObj = _.cloneDeep(cloneTransactionObj());

        //Billing status wise billingHistory
        if(innerObj.billing_status === 'trial')
            transactionObj.transactions.billingStatus.trial = transactionObj.transactions.billingStatus.trial + 1;
        else if(innerObj.billing_status === 'graced')
            transactionObj.transactions.billingStatus.graced = transactionObj.transactions.billingStatus.graced + 1;
        else if(innerObj.billing_status === 'expired')
            transactionObj.transactions.billingStatus.expired = transactionObj.transactions.billingStatus.expired + 1;
        else if(innerObj.billing_status === 'Success' || innerObj.billing_status === 'billed')
            transactionObj.transactions.billingStatus.success = transactionObj.transactions.billingStatus.success + 1;
        else if(innerObj.billing_status === 'Affiliate callback sent')
            transactionObj.transactions.billingStatus.affiliate_callback_sent = transactionObj.transactions.billingStatus.affiliate_callback_sent + 1;
        else if(innerObj.billing_status === 'graced_and_stream_stopped')
            transactionObj.transactions.billingStatus.graced_and_stream_stopped = transactionObj.transactions.billingStatus.graced_and_stream_stopped + 1;
        else if(innerObj.billing_status === 'micro-charging-exceeded')
            transactionObj.transactions.billingStatus.micro_charging_exceeded = transactionObj.transactions.billingStatus.micro_charging_exceeded + 1;
        else if(innerObj.billing_status === 'direct-billing-tried-but-failed')
            transactionObj.transactions.billingStatus.direct_billing_tried_but_failed = transactionObj.transactions.billingStatus.direct_billing_tried_but_failed + 1;
        else if(innerObj.billing_status === 'package_change_upon_user_request')
            transactionObj.transactions.billingStatus.package_change_upon_user_request = transactionObj.transactions.billingStatus.package_change_upon_user_request + 1;
        else if(innerObj.billing_status === 'switch-package-request-tried-but-failed')
            transactionObj.transactions.billingStatus.switch_package_request_tried_but_failed = transactionObj.transactions.billingStatus.switch_package_request_tried_but_failed + 1;
        else if(innerObj.billing_status === 'unsubscribe-request-received-and-expired')
            transactionObj.transactions.billingStatus.unsubscribe_request_received_and_expired = transactionObj.transactions.billingStatus.unsubscribe_request_received_and_expired + 1;
        else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package')
            transactionObj.transactions.billingStatus.subscription_request_received_for_the_same_package = transactionObj.transactions.billingStatus.subscription_request_received_for_the_same_package + 1;
        else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package-after-unsub')
            transactionObj.transactions.billingStatus.subscription_request_received_for_the_same_package_after_unsub = transactionObj.transactions.billingStatus.subscription_request_received_for_the_same_package_after_unsub + 1;
        else
            transactionObj.transactions.billingStatus.other_subscriptions_status_wise = transactionObj.transactions.billingStatus.other_subscriptions_status_wise + 1;

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
        transactionObj.billing_dtm = innerObj.billing_dtm;
        transactionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

        // Un-subscribe Source wise - timestemps
        unSubSourceWise.billing_dtm = innerObj.billing_dtm;
        unSubSourceWise.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

        // Trail Activated Source wise - timestemps
        trialSourceWise.billing_dtm = innerObj.billing_dtm;
        trialSourceWise.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

        if (sourceWiseUnSubArrIndex !== -1)
            sourceWiseUnSubArr[sourceWiseUnSubArrIndex] = unSubSourceWise;
        else
            sourceWiseUnSubArr.push(unSubSourceWise);

        if (sourceWiseTrailArrIndex !== -1)
            sourceWiseTrailArr[sourceWiseTrailArrIndex] = trialSourceWise;
        else
            sourceWiseTrailArr.push(trialSourceWise);

        if (transactingSubsListIndex !== -1)
            transactingSubsList[transactingSubsListIndex] = transactionObj;
        else
            transactingSubsList.push(transactionObj);
    }

    return {
        sourceWiseUnSub: sourceWiseUnSubArr,
        sourceWiseTrail: sourceWiseTrailArr,
        transactingSubsList: transactingSubsList
    };
}

async function insertNewRecord(sourceWiseUnSub, sourceWiseTrail, transactingSubsList, dateString, iterationNo) {

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (dbDataArr) {
        if (dbDataArr.length > 0){
            dbDataArr = dbDataArr[0];

            if (iterationNo === 0){
                dbDataArr.sourceWiseUnSub = sourceWiseUnSub;
                dbDataArr.sourceWiseTrail = sourceWiseTrail;
                dbDataArr.transactions = transactingSubsList;
            } else{
                console.log('iterationNo === else ', iterationNo);

                if (dbDataArr.sourceWiseUnSub){
                    sourceWiseUnSub = updateDataArr(dbDataArr.sourceWiseUnSub, sourceWiseUnSub, 'sourceWiseUnSub');
                    dbDataArr.sourceWiseUnSub = sourceWiseUnSub;
                }
                else{
                    dbDataArr.sourceWiseUnSub = sourceWiseUnSub;
                }

                if (dbDataArr.sourceWiseTrail){
                    sourceWiseTrail = updateDataArr(dbDataArr.sourceWiseTrail, sourceWiseTrail, 'sourceWiseTrail');
                    dbDataArr.sourceWiseTrail = sourceWiseTrail;
                }
                else{
                    dbDataArr.sourceWiseTrail = sourceWiseTrail;
                }

                if (dbDataArr.transactions){
                    transactingSubsList = updateDataArr(dbDataArr.transactions, transactingSubsList, 'transactions');
                    dbDataArr.transactions = transactingSubsList;
                }
                else{
                    dbDataArr.transactions = transactingSubsList;
                }
            }
            await reportsRepo.updateReport(dbDataArr, dbDataArr._id);
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

            updatedObj = updateSingleObj(_.cloneDeep(dbDataArr[arrIndex]), _.cloneDeep(innerObj), mode);
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

    if (mode === 'sourceWiseTrail') {
        dbDataArrObj.app = _.cloneDeep(Number(dbDataArrObj.app) + Number(innerObj.app));
        dbDataArrObj.web = _.cloneDeep(Number(dbDataArrObj.web) + Number(innerObj.web));
        dbDataArrObj.he = _.cloneDeep(Number(dbDataArrObj.he) + Number(innerObj.he));
        dbDataArrObj.total = _.cloneDeep(Number(dbDataArrObj.total) + Number(innerObj.total));
    }
    else if (mode === 'sourceWiseUnSub') {
        dbDataArrObj.he = _.cloneDeep(Number(dbDataArrObj.he) + Number(innerObj.he));
        dbDataArrObj.na = _.cloneDeep(Number(dbDataArrObj.na) + Number(innerObj.na));
        dbDataArrObj.cc = _.cloneDeep(Number(dbDataArrObj.cc) + Number(innerObj.cc));
        dbDataArrObj.cp = _.cloneDeep(Number(dbDataArrObj.cp) + Number(innerObj.cp));
        dbDataArrObj.pwa = _.cloneDeep(Number(dbDataArrObj.pwa) + Number(innerObj.pwa));
        dbDataArrObj.mta = _.cloneDeep(Number(dbDataArrObj.mta) + Number(innerObj.mta));
        dbDataArrObj.app = _.cloneDeep(Number(dbDataArrObj.app) + Number(innerObj.app));
        dbDataArrObj.web = _.cloneDeep(Number(dbDataArrObj.web) + Number(innerObj.web));
        dbDataArrObj.sms = _.cloneDeep(Number(dbDataArrObj.sms) + Number(innerObj.sms));
        dbDataArrObj.null = _.cloneDeep(Number(dbDataArrObj.null) + Number(innerObj.null));
        dbDataArrObj.null2 = _.cloneDeep(Number(dbDataArrObj.null2) + Number(innerObj.null2));
        dbDataArrObj.gdn2 = _.cloneDeep(Number(dbDataArrObj.gdn2) + Number(innerObj.gdn2));
        dbDataArrObj.system = _.cloneDeep(Number(dbDataArrObj.system) + Number(innerObj.system));
        dbDataArrObj.ccp_api = _.cloneDeep(Number(dbDataArrObj.ccp_api) + Number(innerObj.ccp_api));
        dbDataArrObj.CP_null = _.cloneDeep(Number(dbDataArrObj.CP_null) + Number(innerObj.CP_null));
        dbDataArrObj.emptyString = _.cloneDeep(Number(dbDataArrObj.emptyString) + Number(innerObj.emptyString));
        dbDataArrObj.systemExpire = _.cloneDeep(Number(dbDataArrObj.systemExpire) + Number(innerObj.systemExpire));
        dbDataArrObj.CP_telenorccd = _.cloneDeep(Number(dbDataArrObj.CP_telenorccd) + Number(innerObj.CP_telenorccd));
        dbDataArrObj.affiliate_web = _.cloneDeep(Number(dbDataArrObj.affiliate_web) + Number(innerObj.affiliate_web));
        dbDataArrObj.CP_productccd = _.cloneDeep(Number(dbDataArrObj.CP_productccd) + Number(innerObj.CP_productccd));
        dbDataArrObj.CP_whatsappccd = _.cloneDeep(Number(dbDataArrObj.CP_whatsappccd) + Number(innerObj.CP_whatsappccd));
        dbDataArrObj.CP_ideationccd1 = _.cloneDeep(Number(dbDataArrObj.CP_ideationccd1) + Number(innerObj.CP_ideationccd1));
        dbDataArrObj.CP_ideationccd2 = _.cloneDeep(Number(dbDataArrObj.CP_ideationccd2) + Number(innerObj.CP_ideationccd2));
        dbDataArrObj.system_after_grace_end = _.cloneDeep(Number(dbDataArrObj.system_after_grace_end) + Number(innerObj.system_after_grace_end));
    }
    else if (mode === 'transactions'){
        dbDataArrObj.netTotal = _.cloneDeep(Number(dbDataArrObj.netTotal) + Number(innerObj.netTotal));
        dbDataArrObj.failureRate = _.cloneDeep(Number(dbDataArrObj.failureRate) + Number(innerObj.failureRate));
        dbDataArrObj.successRate = _.cloneDeep(Number(dbDataArrObj.successRate) + Number(innerObj.successRate));

        // //Calculate success and failure rate
        // if (transactionObj.transactions.netTotal > 0){
        //     transactionObj.transactions.successRate = (transactionObj.transactions.successRate / transactionObj.transactions.netTotal) * 100;
        //     transactionObj.transactions.failureRate = (transactionObj.transactions.failureRate / transactionObj.transactions.netTotal) * 100;
        // }
        // else{
        //     transactionObj.transactions.failureRate = 0;
        //     transactionObj.transactions.successRate = 0;
        // }

        //transactions data
        dbDataArrObj.transactions.source = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.source, innerObj.transactions.source));
        dbDataArrObj.transactions.package = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.package, innerObj.transactions.package));
        dbDataArrObj.transactions.paywall = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.paywall, innerObj.transactions.paywall));
        dbDataArrObj.transactions.operator = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.operator, innerObj.transactions.operator));
        dbDataArrObj.transactions.price = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.price, innerObj.transactions.price));
        dbDataArrObj.transactions.billingStatus = _.cloneDeep(updateLastObj(dbDataArrObj.transactions.billingStatus, innerObj.transactions.billingStatus));

        //subscribers data
        dbDataArrObj.subscribers.source = _.cloneDeep(updateLastObj(dbDataArrObj.subscribers.source, innerObj.subscribers.source));
        dbDataArrObj.subscribers.package = _.cloneDeep(updateLastObj(dbDataArrObj.subscribers.package, innerObj.subscribers.package));
        dbDataArrObj.subscribers.operator = _.cloneDeep(updateLastObj(dbDataArrObj.subscribers.operator, innerObj.subscribers.operator));
        dbDataArrObj.subscribers.paywall = _.cloneDeep(updateLastObj(dbDataArrObj.subscribers.paywall, innerObj.subscribers.paywall));
        dbDataArrObj.subscribers.price = _.cloneDeep(updateLastObj(dbDataArrObj.subscribers.price, innerObj.subscribers.price));

        dbDataArrObj.billing_dtm = _.cloneDeep(dbDataArrObj.billing_dtm);
        dbDataArrObj.billing_dtm_hours = _.cloneDeep(dbDataArrObj.billing_dtm_hours);
    }

    return dbDataArrObj;
}
function updateLastObj(...objs){
    return objs.reduce((a, b) => {
        for (let k in b) {
            if (b.hasOwnProperty(k))
                a[k] = (a[k] || 0) + b[k];
        }
        return a;
    }, {});
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
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneTrialSourceWiseObj() {
    return {
        app: 0,
        web: 0,
        he: 0,
        total: 0,
        billing_dtm: '',
        billing_dtm_hours: ''
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
        system_after_grace_end: 0, billing_dtm: 0, billing_dtm_hours: 0
    }
}

module.exports = {
    computeBillingHistoryReports: computeBillingHistoryReports,
    promiseBasedComputeBillingHistoryReports: promiseBasedComputeBillingHistoryReports
};
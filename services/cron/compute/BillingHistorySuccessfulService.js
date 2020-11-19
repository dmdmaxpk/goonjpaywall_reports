const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, computedData;
let transactionsList = [], subscribersList = [];
let computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;

computeBillingHistorySuccessfulReports = async(req, res) => {
    console.log('computeBillingHistorySuccessfulReports: ');

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
                await billingHistoryRepo.getBillingHistorySuccessfulByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                    console.log('result 1: ', result.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeBillingHistorySuccessfulData(result);
                        transactionsList = computedData.transactionsList;
                        subscribersList = computedData.subscribersList;

                        await insertNewRecord(transactionsList, subscribersList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await billingHistoryRepo.getBillingHistorySuccessfulByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                    console.log('result 2: ', result.length);

                    // Now compute and store data in DB
                    if (result.length > 0){
                        computedData = computeBillingHistorySuccessfulData(result);
                        transactionsList = computedData.transactionsList;
                        subscribersList = computedData.subscribersList;

                        await insertNewRecord(transactionsList, subscribersList, fromDate, 1);
                    }
                });
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeBillingHistorySuccessfulReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeBillingHistorySuccessfulReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeBillingHistorySuccessfulReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeBillingHistorySuccessfulReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeBillingHistorySuccessfulReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeBillingHistorySuccessfulReports - data compute - done');
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
                    await billingHistoryRepo.getBillingHistorySuccessfulByDateRange(req, fromDate, toDate, skip, limit).then(async function (result) {
                        console.log('result 1: ', result.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeBillingHistorySuccessfulData(result);
                            transactionsList = computedData.transactionsList;
                            subscribersList = computedData.subscribersList;

                            await insertNewRecord(transactionsList, subscribersList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await billingHistoryRepo.getBillingHistorySuccessfulByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (result) {
                        console.log('result 2: ', result.length);

                        // Now compute and store data in DB
                        if (result.length > 0){
                            computedData = computeBillingHistorySuccessfulData(result);
                            transactionsList = computedData.transactionsList;
                            subscribersList = computedData.subscribersList;

                            await insertNewRecord(transactionsList, subscribersList, fromDate, 1);
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

function computeBillingHistorySuccessfulData(data) {

    let outerObj, innerObj, transactionObj, subscriberObj, outer_billing_dtm, inner_billing_dtm;
    let check, transactionsList = [], subscribersList = [], hoursArr = [];

    for (let j=0; j < data.length; j++) {

        transactionObj = _.cloneDeep(cloneTransactionObj());
        subscriberObj = _.cloneDeep(cloneSubscriberObj());

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

                    //Package wise revenue and Billed Users
                    if(innerObj.package_id === 'QDfC'){
                        transactionObj.package.dailyLive = transactionObj.package.dailyLive + 1;
                        subscriberObj.package.dailyLive = subscriberObj.package.dailyLive + 1;
                    }
                    else if(innerObj.package_id === 'QDfG'){
                        transactionObj.package.weeklyLive = transactionObj.package.weeklyLive + 1;
                        subscriberObj.package.weeklyLive = subscriberObj.package.weeklyLive + 1;
                    }
                    else if(innerObj.package_id === 'QDfH'){
                        transactionObj.package.dailyComedy = transactionObj.package.dailyComedy + 1;
                        subscriberObj.package.dailyComedy = subscriberObj.package.dailyComedy + 1;
                    }
                    else if(innerObj.package_id === 'QDfI'){
                        transactionObj.package.weeklyComedy = transactionObj.package.weeklyComedy + 1;
                        subscriberObj.package.weeklyComedy = subscriberObj.package.weeklyComedy + 1;
                    }

                    //Paywall wise revenue and Billed Users
                    if(innerObj.paywall_id === 'Dt6Gp70c'){
                        transactionObj.paywall.comedy = transactionObj.paywall.comedy + 1;
                        subscriberObj.paywall.comedy = subscriberObj.paywall.comedy + 1;
                    }
                    else if(innerObj.paywall_id === 'ghRtjhT7'){
                        transactionObj.paywall.live = transactionObj.paywall.live + 1;
                        subscriberObj.paywall.live = subscriberObj.paywall.live + 1;
                    }

                    //Operator wise revenue and Billed Users
                    if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                        transactionObj.operator.telenor = transactionObj.operator.telenor + 1;
                        subscriberObj.operator.telenor = subscriberObj.operator.telenor + 1;
                    } else if(innerObj.operator === 'easypaisa'){
                        transactionObj.operator.easypaisa = transactionObj.operator.easypaisa + 1;
                        subscriberObj.operator.easypaisa = subscriberObj.operator.easypaisa + 1;
                    }

                    //Price wise charge & transaction details
                    if (innerObj.price === 15){
                        transactionObj.price['15'] = transactionObj.price['15'] + 1;
                        subscriberObj.price['15'] = subscriberObj.price['15'] + 1;
                    }
                    else if (innerObj.price === 11){
                        transactionObj.price['11'] = transactionObj.price['11'] + 1;
                        subscriberObj.price['11'] = subscriberObj.price['11'] + 1;
                    }
                    else if (innerObj.price === 10){
                        transactionObj.price['10'] = transactionObj.price['10'] + 1;
                        subscriberObj.price['10'] = subscriberObj.price['10'] + 1;
                    }
                    else if (innerObj.price === 7){
                        transactionObj.price['7'] = transactionObj.price['7'] + 1;
                        subscriberObj.price['7'] = subscriberObj.price['7'] + 1;
                    }
                    else if (innerObj.price === 5){
                        transactionObj.price['5'] = transactionObj.price['5'] + 1;
                        subscriberObj.price['5'] = subscriberObj.price['5'] + 1;
                    }
                    else if(innerObj.price === 4){
                        transactionObj.price['4'] = transactionObj.price['4'] + 1;
                        subscriberObj.price['4'] = subscriberObj.price['4'] + 1;
                    }
                    else if (innerObj.price === 2){
                        transactionObj.price['2'] = transactionObj.price['2'] + 1;
                        subscriberObj.price['2'] = subscriberObj.price['2'] + 1;
                    }

                    //Transactions success/failure rate and net total
                    if (innerObj.billing_status === 'Success' || innerObj.billing_status === 'billed'){
                        //Success rate
                        transactionObj.successRate = transactionObj.successRate + 1;
                        transactionObj.netTotal = transactionObj.netTotal + 1;
                    }
                    else{
                        //Failure Rate
                        transactionObj.netTotal = transactionObj.netTotal + 1;
                        transactionObj.failureRate = transactionObj.failureRate + 1;
                    }

                    /*
                    * Timestepms
                    * */
                    transactionObj.billing_dtm = outerObj.billing_dtm;
                    transactionObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    subscribersList.billing_dtm = outerObj.billing_dtm;
                    subscribersList.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }

            //Calculate success and failure rate
            if (transactionObj.netTotal > 0){
                transactionObj.successRate = (transactionObj.successRate / transactionObj.netTotal) * 100;
                transactionObj.failureRate = (transactionObj.failureRate / transactionObj.netTotal) * 100;
            }
            else{
                transactionObj.failureRate = 0;
                transactionObj.successRate = 0;
            }

            transactionsList.push(transactionObj);
            subscribersList.push(subscriberObj);
        }
    }

    return { transactionsList: transactionsList, subscribersList: subscribersList };
}

async function insertNewRecord(transactionsList, subscribersList, dateString, mode) {

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];

            if (mode === 0){
                if (result.transactions)
                    result.transactions.successful = transactionsList;
                else{
                    result.transactions = {successful: ''};
                    result.transactions.successful = transactionsList;
                }

                if (result.subscribers)
                    result.subscribers.successful = subscribersList;
                else{
                    result.subscribers = {successful: ''};
                    result.subscribers.successful = subscribersList;
                }
            }
            else{
                if (result.transactions)
                    result.transactions.successful.concat(transactionsList);
                else{
                    result.transactions = {successful: ''};
                    result.transactions.successful = transactionsList;
                }

                if (result.subscribers)
                    result.subscribers.successful.concat(subscribersList);
                else{
                    result.subscribers = {successful: ''};
                    result.subscribers.successful = subscribersList;
                }
            }
            await reportsRepo.updateReport(result, result._id);
        }
        else{
            await reportsRepo.createReport({
                transactions: transactionsList,
                subscribers: subscribersList,
                date: dateString
            });
        }
    });
}

function cloneTransactionObj() {
    return {
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
        netTotal: 0,
        failureRate: 0,
        successRate: 0,
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSubscriberObj() {
    return {
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
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}

module.exports = {
    computeBillingHistorySuccessfulReports: computeBillingHistorySuccessfulReports,
    promiseBasedComputeBillingHistorySuccessfulReports: promiseBasedComputeBillingHistorySuccessfulReports
};
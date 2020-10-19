const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../helper/helper');
const  _ = require('lodash');

let billingHistory = [], returningUserList = [], fullAndPartialChargeList = [],
    sourceWiseUnSubList = [], sourceWiseTrail = [], uniquePayingUsers = [], successRate = [];
let limitData = 400000, lastRecode, fetchedRecordsLength = 0;
let fromDate, toDate, day, month, computedData, hoursFromISODate;

computeBillingHistoryReports = async(req, res) => {
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    if (fetchedRecordsLength === 0 || fetchedRecordsLength < limitData){
        console.log('computeNextDate function');
        dateData = helper.computeNextDate(req, 1, 6);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
    }

    console.log('computeBillingHistoryReports: ', fromDate, toDate);
    billingHistoryRepo.getBillingHistoryByDateRange(req, fromDate, toDate, limitData).then(function (result) {
        console.log('result: ', result.length);
        fetchedRecordsLength = result.length;

        // Get compute data for next time slot
        if (fetchedRecordsLength < limitData)
            req.day = Number(req.day) + 1;

        console.log('getChargeDetailsByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            console.log('fetchedRecordsLength: ', fetchedRecordsLength);
            console.log('limitData: ', limitData);
            if (fetchedRecordsLength < limitData) {
                console.log('yes less: ', fetchedRecordsLength < limitData);

                // Compute net result and store in database
                if (fetchedRecordsLength > 0){
                    computedData = computeBillingHistoryData(result);
                    pushDataInArray(computedData);
                    insertNewRecord(fromDate);
                }

                if (month < helper.getTodayMonthNo())
                    computeBillingHistoryReports(req, res);
                else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                    computeBillingHistoryReports(req, res);
            }
            else{
                console.log('fetchedRecordsLength < limitData ELSE CASE->->->->->-> : ', fromDate);

                lastRecode = result[fetchedRecordsLength - 1];
                fromDate = lastRecode.billing_dtm;
                console.log('fetchedRecordsLength < limitData ELSE CASE->->->->->-> : ', fromDate);

                // Compute net result and store in database
                if (fetchedRecordsLength > 0){
                    computedData = computeBillingHistoryData(result);
                    pushDataInArray(computedData);
                    insertNewRecord(fromDate);
                }
                computeBillingHistoryReports(req, res);
            }
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());
            if (req.month <= helper.getTodayMonthNo())
                computeBillingHistoryReports(req, res);
        }
    });
};

function computeBillingHistoryData(data) {

    let dateInMili, outer_added_dtm, inner_added_dtm, successfulSubs = 0, totalSubs = 0;

    let billingStatusNewObj, outerObj, innerObj, fullAndPartialCharging, unSubSourceWise,
        trialSourceWise, newObjReturningUsers, uniquePayingUserObj, successRateObj;

    let billingHistoryArr = [], returningUserListArr = [], fullAndPartialChargeListArr = [], sourceWiseUnSubArr = [],
        sourceWiseTrailArr = [], uniquePayingUsers = [], successRateArr = [];

    for (let j=0; j < data.length; j++) {

        billingStatusNewObj = _.clone(cloneBillingStatusObj());
        newObjReturningUsers = _.clone(cloneReturningUsersObj());
        fullAndPartialCharging = _.clone(cloneFullAndPartialChargeObj());
        unSubSourceWise = _.clone(cloneUnSubSourceWiseChargeObj());
        trialSourceWise = _.clone(cloneTrialSourceWiseObj());
        uniquePayingUserObj = _.clone(cloneUniquePayingUsersObj());
        successRateObj = _.clone(cloneSuccessRateObj());

        outerObj = data[j];
        outer_added_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();
        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < data.length; k++) {

                innerObj = data[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();
                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;

                    //Billing status wise billingHistory
                    if(innerObj.billing_status === 'trial')
                        billingStatusNewObj.billingStatus.trial = billingStatusNewObj.billingStatus.trial + 1;
                    else if(innerObj.billing_status === 'graced')
                        billingStatusNewObj.billingStatus.graced = billingStatusNewObj.billingStatus.graced + 1;
                    else if(innerObj.billing_status === 'expired')
                        billingStatusNewObj.billingStatus.expired = billingStatusNewObj.billingStatus.expired + 1;
                    else if(innerObj.billing_status === 'Success')
                        billingStatusNewObj.billingStatus.success = billingStatusNewObj.billingStatus.success + 1;
                    else if(innerObj.billing_status === 'Affiliate callback sent')
                        billingStatusNewObj.billingStatus.affiliate_callback_sent = billingStatusNewObj.billingStatus.affiliate_callback_sent + 1;
                    else if(innerObj.billing_status === 'graced_and_stream_stopped')
                        billingStatusNewObj.billingStatus.graced_and_stream_stopped = billingStatusNewObj.billingStatus.graced_and_stream_stopped + 1;
                    else if(innerObj.billing_status === 'micro-charging-exceeded')
                        billingStatusNewObj.billingStatus.micro_charging_exceeded = billingStatusNewObj.billingStatus.micro_charging_exceeded + 1;
                    else if(innerObj.billing_status === 'direct-billing-tried-but-failed')
                        billingStatusNewObj.billingStatus.direct_billing_tried_but_failed = billingStatusNewObj.billingStatus.direct_billing_tried_but_failed + 1;
                    else if(innerObj.billing_status === 'package_change_upon_user_request')
                        billingStatusNewObj.billingStatus.package_change_upon_user_request = billingStatusNewObj.billingStatus.package_change_upon_user_request + 1;
                    else if(innerObj.billing_status === 'switch-package-request-tried-but-failed')
                        billingStatusNewObj.billingStatus.switch_package_request_tried_but_failed = billingStatusNewObj.billingStatus.switch_package_request_tried_but_failed + 1;
                    else if(innerObj.billing_status === 'unsubscribe-request-received-and-expired')
                        billingStatusNewObj.billingStatus.unsubscribe_request_received_and_expired = billingStatusNewObj.billingStatus.unsubscribe_request_received_and_expired + 1;
                    else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package')
                        billingStatusNewObj.billingStatus.subscription_request_received_for_the_same_package = billingStatusNewObj.billingStatus.subscription_request_received_for_the_same_package + 1;
                    else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package-after-unsub')
                        billingStatusNewObj.billingStatus.subscription_request_received_for_the_same_package_after_unsub = billingStatusNewObj.billingStatus.subscription_request_received_for_the_same_package_after_unsub + 1;

                    //Package wise revenue and Billed Users
                    if (innerObj.billing_status === "Success") {
                        if(innerObj.package_id === 'QDfC'){
                            billingStatusNewObj.revenue.package.liveDaily = billingStatusNewObj.revenue.package.liveDaily + innerObj.price;
                            billingStatusNewObj.userBilled.package.liveDaily = billingStatusNewObj.userBilled.package.liveDaily + 1;
                        }
                        else if(innerObj.package_id === 'QDfG'){
                            billingStatusNewObj.revenue.package.liveWeekly = billingStatusNewObj.revenue.package.liveWeekly + innerObj.price;
                            billingStatusNewObj.userBilled.package.liveWeekly = billingStatusNewObj.userBilled.package.liveWeekly + 1;
                        }
                        else if(innerObj.package_id === 'QDfH'){
                            billingStatusNewObj.revenue.package.comedyDaily = billingStatusNewObj.revenue.package.comedyDaily + innerObj.price;
                            billingStatusNewObj.userBilled.package.comedyDaily = billingStatusNewObj.userBilled.package.comedyDaily + 1;
                        }
                        else if(innerObj.package_id === 'QDfI'){
                            billingStatusNewObj.revenue.package.comedyWeekly = billingStatusNewObj.revenue.package.comedyWeekly + innerObj.price;
                            billingStatusNewObj.userBilled.package.comedyWeekly = billingStatusNewObj.userBilled.package.comedyWeekly + 1;
                        }
                    }

                    //Paywall wise revenue and Billed Users
                    if (innerObj.billing_status === "Success"){
                        if(innerObj.paywall_id === 'Dt6Gp70c'){
                            billingStatusNewObj.revenue.paywall.comedy = billingStatusNewObj.revenue.paywall.comedy + innerObj.price;
                            billingStatusNewObj.userBilled.paywall.comedy = billingStatusNewObj.userBilled.paywall.comedy + 1;
                        }
                        else if(innerObj.paywall_id === 'ghRtjhT7'){
                            billingStatusNewObj.revenue.paywall.live = billingStatusNewObj.revenue.paywall.live + innerObj.price;
                            billingStatusNewObj.userBilled.paywall.live = billingStatusNewObj.userBilled.paywall.live + 1;
                        }
                    }

                    //Operator wise revenue and Billed Users
                    if (innerObj.billing_status === "Success"){
                        if(innerObj.operator === 'easypaisa'){
                            billingStatusNewObj.revenue.operator.easypaisa = billingStatusNewObj.revenue.operator.easypaisa + innerObj.price;
                            billingStatusNewObj.userBilled.operator.easypaisa = billingStatusNewObj.userBilled.operator.easypaisa + 1;
                        }
                        else if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                            billingStatusNewObj.revenue.operator.telenor = billingStatusNewObj.revenue.operator.telenor + innerObj.price;
                            billingStatusNewObj.userBilled.operator.telenor = billingStatusNewObj.userBilled.operator.telenor + 1;
                        }
                    }

                    //Returning User
                    if(!innerObj.micro_charge && innerObj.billing_status === "Success")
                        newObjReturningUsers.total =  newObjReturningUsers.total + 1;

                    // Full & Partial charged users
                    if(innerObj.billing_status === "Success") {
                        if (innerObj.micro_charge){
                            fullAndPartialCharging.partialCharge = fullAndPartialCharging.partialCharge + 1;
                            fullAndPartialCharging.total = fullAndPartialCharging.total + 1;
                        }
                        else{
                            fullAndPartialCharging.fullCharge = fullAndPartialCharging.fullCharge + 1;
                            fullAndPartialCharging.total = fullAndPartialCharging.total + 1;
                        }
                    }

                    // Unique paying users
                    if(innerObj.billing_status === "Success") {
                        if (!_.includes(uniquePayingUserObj.users, innerObj.user_id)){
                            uniquePayingUserObj.users.push(innerObj.user_id);
                            uniquePayingUserObj.total = uniquePayingUserObj.total + 1;
                            // Unique paying users - timestemps
                            uniquePayingUserObj.added_dtm = outerObj.billing_dtm;
                            uniquePayingUserObj.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                        }
                    }

                    // Success Rate data variables
                    if(innerObj.billing_status === "Success")
                        successfulSubs = successfulSubs + 1;
                    else
                        totalSubs = totalSubs + 1;

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
                    //Returning User - timestemps
                    newObjReturningUsers.added_dtm = outerObj.billing_dtm;
                    newObjReturningUsers.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    //Full & Partial charged users - timestemps
                    fullAndPartialCharging.added_dtm = outerObj.billing_dtm;
                    fullAndPartialCharging.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Un-subscribe Source wise - timestemps
                    unSubSourceWise.added_dtm = outerObj.billing_dtm;
                    unSubSourceWise.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Trail Activated Source wise - timestemps
                    trialSourceWise.added_dtm = outerObj.billing_dtm;
                    trialSourceWise.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Billing Status wise - timestemps
                    billingStatusNewObj.added_dtm = outerObj.billing_dtm;
                    billingStatusNewObj.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }

            //Calculate success rate
            successRateObj.total = totalSubs;
            successRateObj.successful = successfulSubs;
            successRateObj.rate = (totalSubs / successfulSubs) * 100;
            successRateObj.added_dtm = outerObj.billing_dtm;
            successRateObj.added_dtm_hours = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0);

            billingHistoryArr.push(billingStatusNewObj);
            returningUserListArr.push(newObjReturningUsers);
            fullAndPartialChargeListArr.push(fullAndPartialCharging);
            sourceWiseUnSubArr.push(unSubSourceWise);
            sourceWiseTrailArr.push(trialSourceWise);
            uniquePayingUsers.push(uniquePayingUserObj);
            successRateArr.push(successRateObj);
        }
    }

    return {
        billingHistory: billingHistoryArr,
        returningUserList: returningUserListArr,
        fullAndPartialChargeList: fullAndPartialChargeListArr,
        sourceWiseUnSub: sourceWiseUnSubArr,
        sourceWiseTrail: sourceWiseTrailArr,
        uniquePayingUsers: uniquePayingUsers,
        successRate: successRateArr,
    };
}

function insertNewRecord(dateString) {
    hoursFromISODate = dateString;
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0){
            result = result[0];

            if (helper.splitHoursFromISODate(hoursFromISODate)){
                result.billingHistory = billingHistory;
                result.returningUsers = returningUserList;
                result.fullAndPartialChargeUser = fullAndPartialChargeList;
                result.sourceWiseUnSub = sourceWiseUnSubList;
                result.sourceWiseTrail = sourceWiseTrail;
                result.uniquePayingUsers = uniquePayingUsers;
                result.successRate = successRate;
            } else{
                result.billingHistory.concat(billingHistory);
                result.returningUsers.concat(returningUserList);
                result.fullAndPartialChargeUser.concat(fullAndPartialChargeList);
                result.sourceWiseUnSub.concat(sourceWiseUnSubList);
                result.sourceWiseTrail.concat(sourceWiseTrail);
                result.uniquePayingUsers.concat(uniquePayingUsers);
                result.successRate.concat(successRate);
            }
            reportsRepo.updateReport(result, result._id);
        }
        else{
            reportsRepo.createReport({
                billingHistory: billingHistory,
                returningUsers: returningUserList,
                fullAndPartialChargeUser: fullAndPartialChargeList,
                sourceWiseUnSub: sourceWiseUnSubList,
                sourceWiseTrail: sourceWiseTrail,
                uniquePayingUsers: uniquePayingUsers,
                successRate: successRate,
                date: dateString
            });
        }

        resetDataArray();
    });
}

function resetDataArray() {
    billingHistory = []; returningUserList = []; fullAndPartialChargeList = [];
    sourceWiseUnSubList = []; sourceWiseTrail = [];
    uniquePayingUsers = []; successRate = [];
}

function pushDataInArray(computedData) {
    push(computedData.billingHistory, 'billingHistory');
    push(computedData.returningUserList, 'returningUserList');
    push(computedData.fullAndPartialChargeList, 'fullAndPartialChargeList');
    push(computedData.sourceWiseUnSub, 'sourceWiseUnSubList');
    push(computedData.sourceWiseTrail, 'sourceWiseTrail');
    push(computedData.uniquePayingUsers, 'uniquePayingUsers');
    push(computedData.successRate, 'successRate');
}

function push(data, type) {
    _.reduce(data , function(obj,d) {
        if (type === 'billingHistory')
            billingHistory.push(d);
        else if (type === 'returningUserList')
            returningUserList.push(d);
        else if (type === 'fullAndPartialChargeList')
            fullAndPartialChargeList.push(d);
        else if (type === 'sourceWiseUnSubList')
            sourceWiseUnSubList.push(d);
        else if (type === 'sourceWiseTrail')
            sourceWiseTrail.push(d);
        else if (type === 'uniquePayingUsers')
            uniquePayingUsers.push(d);
        else if (type === 'successRate')
            successRate.push(d);
    }, {});
}

function cloneSuccessRateObj() {
    return {
        rate: 0,
        total: 0,
        successful: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneUniquePayingUsersObj() {
    return {
        users: [],
        total: 0,
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
function cloneFullAndPartialChargeObj() {
    return {
        fullCharge: 0,
        partialCharge: 0,
        total: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneReturningUsersObj() {
    return {
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
function cloneBillingStatusObj() {
    return {
        revenue: {
            package: {
                liveDaily: 0,
                liveWeekly: 0,
                comedyDaily: 0,
                comedyWeekly: 0,
                total: 0
            },
            paywall: {
                live: 0,
                comedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            }
        },
        userBilled: {
            package: {
                liveDaily: 0,
                liveWeekly: 0,
                comedyDaily: 0,
                comedyWeekly: 0,
                total: 0
            },
            paywall: {
                live: 0,
                comedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            }
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
            subscription_request_received_for_the_same_package_after_unsub: 0
        },
        added_dtm: '',
        added_dtm_hours: ''
    };
}

module.exports = {
    computeBillingHistoryReports: computeBillingHistoryReports,
};
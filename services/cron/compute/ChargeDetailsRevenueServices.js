const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalData;
let chargeDetailList = [], billingHistoryArr = [], returningUserListArr = [], fullAndPartialChargeListArr = [], uniquePayingUsers = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeChargeDetailsReports = async(req, res) => {
    console.log('computeChargeDetailsReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 8, 11);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    /*
    * Get total count from db
    * */
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
                await billingHistoryRepo.getChargeDetailsByDateRange(req, fromDate, toDate, skip, limit).then(async function (chargeDetails) {
                    console.log('chargeDetails: ', chargeDetails.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (chargeDetails.length > 0){
                        finalData = computeChargeDetailData(chargeDetails);
                        chargeDetailList = finalData.chargeDetailList;
                        uniquePayingUsers = finalData.uniquePayingUsers;
                        billingHistoryArr = finalData.billingHistory;
                        returningUserListArr = finalData.returningUserList;
                        fullAndPartialChargeListArr = finalData.fullAndPartialChargeList;

                        await insertNewRecord(chargeDetailList, uniquePayingUsers, billingHistoryArr, returningUserListArr, fullAndPartialChargeListArr, fromDate, i);
                    }
                });
            }


            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await billingHistoryRepo.getChargeDetailsByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (chargeDetails) {
                    console.log('chargeDetails: ', chargeDetails.length);

                    if (chargeDetails.length > 0){
                        finalData = computeChargeDetailData(chargeDetails);
                        chargeDetailList = finalData.chargeDetailList;
                        uniquePayingUsers = finalData.uniquePayingUsers;
                        billingHistoryArr = finalData.billingHistory;
                        returningUserListArr = finalData.returningUserList;
                        fullAndPartialChargeListArr = finalData.fullAndPartialChargeList;

                        await insertNewRecord(chargeDetailList, uniquePayingUsers, billingHistoryArr, returningUserListArr, fullAndPartialChargeListArr, fromDate, 1);
                    }
                });
            }
        }


        // Recurring - get and compute data for next day - time slot
        req.day = Number(req.day) + 1;
        console.log('getChargeDetailsByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeChargeDetailsReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeChargeDetailsReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeChargeDetailsReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('getChargeDetailsByDateRange - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeChargeDetailsReports = async(req, res) => {
    console.log('promiseBasedComputeChargeDetailsReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        /*
        * Get total count from db
        * */
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
                    await billingHistoryRepo.getChargeDetailsByDateRange(req, fromDate, toDate, skip, limit).then(async function (chargeDetails) {
                        console.log('chargeDetails: ', chargeDetails.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (chargeDetails.length > 0){
                            finalData = computeChargeDetailData(chargeDetails);
                            chargeDetailList = finalData.chargeDetailList;
                            uniquePayingUsers = finalData.uniquePayingUsers;
                            billingHistoryArr = finalData.billingHistory;
                            returningUserListArr = finalData.returningUserList;
                            fullAndPartialChargeListArr = finalData.fullAndPartialChargeList;

                            await insertNewRecord(chargeDetailList, uniquePayingUsers, billingHistoryArr, returningUserListArr, fullAndPartialChargeListArr, fromDate, i);
                        }
                    });
                }


                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await billingHistoryRepo.getChargeDetailsByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (chargeDetails) {
                        console.log('chargeDetails: ', chargeDetails.length);

                        if (chargeDetails.length > 0){
                            finalData = computeChargeDetailData(chargeDetails);
                            chargeDetailList = finalData.chargeDetailList;
                            uniquePayingUsers = finalData.uniquePayingUsers;
                            billingHistoryArr = finalData.billingHistory;
                            returningUserListArr = finalData.returningUserList;
                            fullAndPartialChargeListArr = finalData.fullAndPartialChargeList;

                            await insertNewRecord(chargeDetailList, uniquePayingUsers, billingHistoryArr, returningUserListArr, fullAndPartialChargeListArr, fromDate, 1);
                        }
                    });
                }
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeChargeDetailsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeChargeDetailData(chargeDetails) {

    let dateInMili, outer_billing_dtm, inner_billing_dtm, outerObj, innerObj, price;
    let chargeDetailObj, newObjReturningUsers, uniquePayingUserObj, billingStatusNewObj, fullAndPartialCharging, micro_charge;
    let chargeDetailList = [], billingHistoryArr = [], returningUserListArr = [], fullAndPartialChargeListArr = [],
        uniquePayingUsers = [];

    for (let j=0; j < chargeDetails.length; j++) {

        outerObj = chargeDetails[j];

        chargeDetailObj = _.clone(cloneChargeDetailObj());
        newObjReturningUsers = _.clone(cloneReturningUsersObj());
        billingStatusNewObj = _.clone(cloneBillingStatusObj());
        fullAndPartialCharging = _.clone(cloneFullAndPartialChargeObj());
        uniquePayingUserObj = _.clone(cloneUniquePayingUsersObj());

        outer_billing_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_billing_dtm){
            for (let k=0; k < chargeDetails.length; k++) {

                innerObj = chargeDetails[k];
                inner_billing_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();

                if (outer_billing_dtm === inner_billing_dtm){
                    price = innerObj.price - (innerObj.discount ? innerObj.discount : 0);
                    micro_charge = innerObj.micro_charge === false ? false : true;
                    dateInMili = inner_billing_dtm;

                    //Package wise Charge Details
                    if(innerObj.package === 'QDfC'){
                        billingStatusNewObj.revenue.package.liveDaily = billingStatusNewObj.revenue.package.liveDaily + innerObj.price;
                        billingStatusNewObj.userBilled.package.liveDaily = billingStatusNewObj.userBilled.package.liveDaily + 1;

                        if(!micro_charge)
                            chargeDetailObj.package.dailyLive.full = chargeDetailObj.package.dailyLive.full + price;
                        else
                            chargeDetailObj.package.dailyLive.micro = chargeDetailObj.package.dailyLive.micro + price;

                        chargeDetailObj.package.dailyLive.total = chargeDetailObj.package.dailyLive.total + price;
                    }
                    else if(innerObj.package === 'QDfG'){
                        billingStatusNewObj.revenue.package.liveWeekly = billingStatusNewObj.revenue.package.liveWeekly + innerObj.price;
                        billingStatusNewObj.userBilled.package.liveWeekly = billingStatusNewObj.userBilled.package.liveWeekly + 1;

                        if(!micro_charge)
                            chargeDetailObj.package.weeklyLive.full = chargeDetailObj.package.weeklyLive.full + price;
                        else
                            chargeDetailObj.package.weeklyLive.micro = chargeDetailObj.package.weeklyLive.micro + price;

                        chargeDetailObj.package.weeklyLive.total = chargeDetailObj.package.weeklyLive.total + price;
                    }
                    else if(innerObj.package === 'QDfH'){
                        billingStatusNewObj.revenue.package.comedyDaily = billingStatusNewObj.revenue.package.comedyDaily + innerObj.price;
                        billingStatusNewObj.userBilled.package.comedyDaily = billingStatusNewObj.userBilled.package.comedyDaily + 1;

                        if(!micro_charge)
                            chargeDetailObj.package.dailyComedy.full = chargeDetailObj.package.dailyComedy.full + price;
                        else
                            chargeDetailObj.package.dailyComedy.micro = chargeDetailObj.package.dailyComedy.micro + price;

                        chargeDetailObj.package.dailyComedy.total = chargeDetailObj.package.dailyComedy.total + price;
                    }
                    else if(innerObj.package === 'QDfI'){
                        billingStatusNewObj.revenue.package.comedyWeekly = billingStatusNewObj.revenue.package.comedyWeekly + innerObj.price;
                        billingStatusNewObj.userBilled.package.comedyWeekly = billingStatusNewObj.userBilled.package.comedyWeekly + 1;

                        if(!micro_charge)
                            chargeDetailObj.package.weeklyComedy.full = chargeDetailObj.package.weeklyComedy.full + price;
                        else
                            chargeDetailObj.package.weeklyComedy.micro = chargeDetailObj.package.weeklyComedy.micro + price;

                        chargeDetailObj.package.weeklyComedy.total = chargeDetailObj.package.weeklyComedy.total + price;
                    }

                    //Paywall wise Charge Details
                    if(innerObj.paywall === 'Dt6Gp70c'){
                        billingStatusNewObj.revenue.paywall.comedy = billingStatusNewObj.revenue.paywall.comedy + innerObj.price;
                        billingStatusNewObj.userBilled.paywall.comedy = billingStatusNewObj.userBilled.paywall.comedy + 1;

                        if(!micro_charge)
                            chargeDetailObj.paywall.comedy.full = chargeDetailObj.paywall.comedy.full + price;
                        else
                            chargeDetailObj.paywall.comedy.micro = chargeDetailObj.paywall.comedy.micro + price;

                        chargeDetailObj.paywall.comedy.total = chargeDetailObj.paywall.comedy.total + price;
                    }
                    else if(innerObj.paywall === 'ghRtjhT7'){
                        billingStatusNewObj.revenue.paywall.live = billingStatusNewObj.revenue.paywall.live + innerObj.price;
                        billingStatusNewObj.userBilled.paywall.live = billingStatusNewObj.userBilled.paywall.live + 1;

                        if(!micro_charge)
                            chargeDetailObj.paywall.live.full = chargeDetailObj.paywall.live.full + price;
                        else
                            chargeDetailObj.paywall.live.micro = chargeDetailObj.paywall.live.micro + price;

                        chargeDetailObj.paywall.live.total = chargeDetailObj.paywall.live.total + price;
                    }

                    //Operator wise Charge Details
                    if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                        billingStatusNewObj.revenue.operator.telenor = billingStatusNewObj.revenue.operator.telenor + innerObj.price;
                        billingStatusNewObj.userBilled.operator.telenor = billingStatusNewObj.userBilled.operator.telenor + 1;

                        if(!micro_charge)
                            chargeDetailObj.operator.telenor.full = chargeDetailObj.operator.telenor.full + price;
                        else
                            chargeDetailObj.operator.telenor.micro = chargeDetailObj.operator.telenor.micro + price;

                        chargeDetailObj.operator.telenor.total = chargeDetailObj.operator.telenor.total + price;
                    }
                    else if(innerObj.operator === 'easypaisa'){
                        billingStatusNewObj.revenue.operator.easypaisa = billingStatusNewObj.revenue.operator.easypaisa + innerObj.price;
                        billingStatusNewObj.userBilled.operator.easypaisa = billingStatusNewObj.userBilled.operator.easypaisa + 1;

                        if(!micro_charge)
                            chargeDetailObj.operator.easypaisa.full = chargeDetailObj.operator.easypaisa.full + price;
                        else
                            chargeDetailObj.operator.easypaisa.micro = chargeDetailObj.operator.easypaisa.micro + price;

                        chargeDetailObj.operator.easypaisa.total = chargeDetailObj.operator.easypaisa.total + price;
                    }

                    // Full & Micro charge details
                    if(!micro_charge)
                        chargeDetailObj.chargeType.full = chargeDetailObj.chargeType.full + price;
                    else
                        chargeDetailObj.chargeType.micro = chargeDetailObj.chargeType.micro + price;

                    //Returning User
                    if(!innerObj.micro_charge)
                        newObjReturningUsers.total =  newObjReturningUsers.total + 1;


                    // Full & Partial charged users
                    if (innerObj.micro_charge){
                        fullAndPartialCharging.partialCharge = fullAndPartialCharging.partialCharge + 1;
                        fullAndPartialCharging.total = fullAndPartialCharging.total + 1;
                    }
                    else{
                        fullAndPartialCharging.fullCharge = fullAndPartialCharging.fullCharge + 1;
                        fullAndPartialCharging.total = fullAndPartialCharging.total + 1;
                    }

                    // Unique paying users
                    if (!_.includes(uniquePayingUserObj.users, innerObj.user_id)){
                        uniquePayingUserObj.users.push(innerObj.user_id);
                        uniquePayingUserObj.total = uniquePayingUserObj.total + 1;
                    }


                    // Add Timestemps
                    //Returning User - timestemps
                    newObjReturningUsers.added_dtm = outerObj.billing_dtm;
                    newObjReturningUsers.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    //Full & Partial charged users - timestemps
                    fullAndPartialCharging.added_dtm = outerObj.billing_dtm;
                    fullAndPartialCharging.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Charge details - timestemp
                    chargeDetailObj.billing_dtm = outerObj.billing_dtm;
                    chargeDetailObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Billing Status wise - timestemps
                    billingStatusNewObj.added_dtm = outerObj.billing_dtm;
                    billingStatusNewObj.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);

                    // Unique paying users - timestemps
                    uniquePayingUserObj.added_dtm = outerObj.billing_dtm;
                    uniquePayingUserObj.added_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }

            chargeDetailList.push(chargeDetailObj);
            billingHistoryArr.push(billingStatusNewObj);
            returningUserListArr.push(newObjReturningUsers);
            fullAndPartialChargeListArr.push(fullAndPartialCharging);
            uniquePayingUsers.push(uniquePayingUserObj);
        }
    }

    return {
        chargeDetailList: chargeDetailList,
        billingHistory: billingHistoryArr,
        returningUserList: returningUserListArr,
        fullAndPartialChargeList: fullAndPartialChargeListArr,
        uniquePayingUsers: uniquePayingUsers
    };
}

async function insertNewRecord(chargeDetailList, uniquePayingUsers, billingHistory, returningUserList, fullAndPartialChargeList, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            if (mode === 0) {
                result.chargeDetails = chargeDetailList;
                result.billingHistory = billingHistory;
                result.returningUsers = returningUserList;
                result.fullAndPartialChargeUser = fullAndPartialChargeList;
                result.uniquePayingUsers = uniquePayingUsers;
            }else{
                if (result.chargeDetails)
                    result.chargeDetails = result.chargeDetails.concat(chargeDetailList);
                else
                    result.chargeDetails = chargeDetailList;

                if (result.billingHistory)
                    result.billingHistory = result.billingHistory.concat(billingHistory);
                else
                    result.billingHistory = billingHistory;

                if (result.returningUsers)
                    result.returningUsers = result.returningUsers.concat(returningUserList);
                else
                    result.returningUsers = returningUserList;

                if (result.fullAndPartialChargeUser)
                    result.fullAndPartialChargeUser = result.fullAndPartialChargeUser.concat(fullAndPartialChargeList);
                else
                    result.fullAndPartialChargeUser = fullAndPartialChargeList;

                if (result.uniquePayingUsers)
                    result.uniquePayingUsers = result.uniquePayingUsers.concat(uniquePayingUsers);
                else
                    result.uniquePayingUsers = uniquePayingUsers;
            }

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({
                chargeDetails: chargeDetailList,
                billingHistory: billingHistory,
                returningUsers: returningUserList,
                fullAndPartialChargeUser: fullAndPartialChargeList,
                uniquePayingUsers: uniquePayingUsers,
                date: dateString
            });
    });
}

function cloneChargeDetailObj() {
    return {
        package: {
            dailyLive: { full: 0, micro: 0, total: 0 },
            weeklyLive: { full: 0, micro: 0, total: 0 },
            dailyComedy: { full: 0, micro: 0, total: 0 },
            weeklyComedy: { full: 0, micro: 0, total: 0 }
        },
        operator: {
          telenor: { full: 0, micro: 0, total: 0 },
          easypaisa: { full: 0, micro: 0, total: 0 }
        },
        paywall: {
            comedy: { full: 0, micro: 0, total: 0 },
            live: { full: 0, micro: 0, total: 0 }
        },
        chargeType: {
            full: 0,
            micro: 0
        },
        billing_dtm: '',
        billing_dtm_hours: ''
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
        added_dtm: '',
        added_dtm_hours: ''
    };
}

function countQuery(from, to){
    return [
        {$match : {
            $or:[{"billing_status": "Success"}, {"billing_status": "billed"}],
            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
        }},
        {$project: {
            _id: 0,
            price: "$price",
            discount: "$discount",
            package: "$package_id",
            paywall: "$paywall_id",
            operator: "$operator",
            micro_charge: "$micro_charge",
            billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } }
        }},
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeChargeDetailsReports: computeChargeDetailsReports,
    promiseBasedComputeChargeDetailsReports: promiseBasedComputeChargeDetailsReports
};
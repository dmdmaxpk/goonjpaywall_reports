const container = require("../../../configurations/container");
const payingUsersRepo = require('../../../repos/apis/PayingUsersRepo');
const subscriptionRepository = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
computeNewPayingUserRevenueReports = async(req, res) => {
    console.log('computeNewPayingUserRevenueReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req,  7);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    let finalDataList = [];

    console.log('computeNewPayingUserRevenueReports: ', fromDate, toDate);
    await subscriptionRepository.getNewPayingUserRevenueByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
        console.log('newPayingUsers.length: ', newPayingUsers.length);

        if (newPayingUsers.length > 0){
            finalDataList = computePayingUsersData(newPayingUsers, finalDataList, fromDate);

            console.log('finalDataList.length : ', finalDataList.length);
            if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'newPayingRevenue');
        }
    });

    // Get compute data for next time slot
    console.log('computeNewPayingUserRevenueReports -> day : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computeNewPayingUserRevenueReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computeNewPayingUserRevenueReports(req, res);
    else{
        console.log('computeNewPayingUserRevenueReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputeNewPayingUserRevenueReports = async(req, res) => {
    console.log('promiseBasedComputeNewPayingUserRevenueReports: ');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        let finalDataList = [];

        console.log('promiseBasedComputeNewPayingUserRevenueReports: ', fromDate, toDate);
        await subscriptionRepository.getNewPayingUserRevenueByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
            console.log('newPayingUsers.length: ', newPayingUsers.length);

            if (newPayingUsers.length > 0){
                finalDataList = computePayingUsersData(newPayingUsers, finalDataList, fromDate);

                console.log('finalDataList.length : ', finalDataList.length);
                if (finalDataList.length > 0)
                    await insertNewRecord(finalDataList, fromDate, 'newPayingRevenue');
            }
        });

        console.log('promiseBasedComputeNewPayingUserRevenueReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

computeNewPayingUsersReports = async(req, res) => {
    console.log('computeNewPayingUsersReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req,  7);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    let finalDataList = [];

    console.log('computeNewPayingUsersReports: ', fromDate, toDate);
    await subscriptionRepository.getNewPayingUsersByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
        console.log('newPayingUsers.length: ', newPayingUsers);

        // Now compute and store data in DB
        if (newPayingUsers.length > 0) finalDataList = _.clone(computePayingUsersMonthlyData(newPayingUsers, finalDataList, fromDate));

        if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'newPaying');
    });


    // Get compute data for next time slot
    console.log('computeNewPayingUsersReports -> day : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computeNewPayingUsersReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computeNewPayingUsersReports(req, res);
    else{
        console.log('computeNewPayingUsersReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputeNewPayingUsersReports = async(req, res) => {
    console.log('promiseBasedComputeNewPayingUsersReports: ');
    return new Promise(async (resolve, reject) => {
        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        let finalDataList = [];

        console.log('promiseBasedComputeNewPayingUsersReports: ', fromDate, toDate);
        await subscriptionRepository.getNewPayingUsersByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
            console.log('newPayingUsers.length: ', newPayingUsers.length);

            // Now compute and store data in DB
            if (newPayingUsers.length > 0) finalDataList = _.clone(computePayingUsersMonthlyData(newPayingUsers, finalDataList, fromDate));

            if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'newPaying');
        });

        console.log('promiseBasedComputeNewPayingUsersReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

computeTotalPayingUsersReports = async(req, res) => {
    console.log('computeTotalPayingUsersReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req, 10);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    let finalDataList = [];

    console.log('computeTotalPayingUsersReports: ', fromDate, toDate);
    await subscriptionRepository.getTotalPayingUsersByDateRange(req, fromDate, toDate).then(async function (totalPayingUsers) {
        console.log('totalPayingUsers.length: ', totalPayingUsers);

        // Now compute and store data in DB
        if (totalPayingUsers.length > 0) finalDataList = _.clone(computePayingUsersMonthlyData(totalPayingUsers, finalDataList, fromDate));
        console.log('finalDataList: ', finalDataList);

        if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'totalPaying');
    });


    // Get compute data for next time slot
    console.log('computeTotalPayingUsersReports -> day : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computeTotalPayingUsersReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computeTotalPayingUsersReports(req, res);
    else{
        console.log('computeTotalPayingUsersReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputeTotalPayingUsersReports = async(req, res) => {
    console.log('promiseBasedComputeTotalPayingUsersReports: ');
    return new Promise(async (resolve, reject) => {
        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        let finalDataList = [];

        console.log('promiseBasedComputeTotalPayingUsersReports: ', fromDate, toDate);
        await subscriptionRepository.getTotalPayingUsersByDateRange(req, fromDate, toDate).then(async function (totalPayingUsers) {
            console.log('totalPayingUsers.length: ', totalPayingUsers.length);

            // Now compute and store data in DB
            if (totalPayingUsers.length > 0) finalDataList = _.clone(computePayingUsersMonthlyData(totalPayingUsers, finalDataList, fromDate));

            if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'totalPaying');
        });

        console.log('promiseBasedComputeTotalPayingUsersReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

computePayingUserSessionsReports = async(req, res) => {
    console.log('computePayingUserSessionsReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req,  7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    let finalDataList = [];

    console.log('computePayingUserSessionsReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserSessionsByDateRange(req, fromDate, toDate).then(async function (userSessions) {
        console.log('userSessions.length: ', userSessions.length);

        if (userSessions.length > 0) finalDataList = computePayingUserSessionsData(userSessions, fromDate);

        console.log('finalDataList.length : ', finalDataList.length);
        if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'userSessions');
    });

    // Get compute data for next time slot
    console.log('computePayingUserSessionsReports -> month : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computePayingUserSessionsReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computePayingUserSessionsReports(req, res);
    else{
        console.log('computePayingUserSessionsReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputePayingUserSessionsReports = async(req, res) => {
    console.log('promiseBasedComputePayingUserSessionsReports: ');
    return new Promise(async (resolve, reject) => {
        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        let finalDataList = [];

        console.log('computePayingUserSessionsReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserSessionsByDateRange(req, fromDate, toDate).then(async function (userSessions) {
            console.log('userSessions.length: ', userSessions.length);

            if (userSessions.length > 0) finalDataList = computePayingUserSessionsData(userSessions, fromDate);

            console.log('finalDataList.length : ', finalDataList.length);
            if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'userSessions');
        });

        console.log('promiseBasedComputePayingUserSessionsReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

computePayingUserWatchTimeReports = async(req, res) => {
    console.log('computePayingUserWatchTimeReports: ');
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req,  6);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    finalList = [];

    console.log('computePayingUserWatchTimeReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserWatchTimeByDateRange(req, fromDate, toDate).then(async function (userWatchTime) {
        console.log('userWatchTime.length: ', userWatchTime.length);

        if (userWatchTime.length > 0){
            finalList = computePayingUserWatchTimeData(userWatchTime, fromDate);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0) await insertNewRecord(finalList, fromDate, 'watchTime');
        }
    });

    // Get compute data for next time slot
    console.log('computePayingUserWatchTimeReports -> month : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computePayingUserWatchTimeReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computePayingUserWatchTimeReports(req, res);
    else{
        console.log('computePayingUserWatchTimeReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputePayingUserWatchTimeReports = async(req, res) => {
    console.log('promiseBasedComputePayingUserWatchTimeReports: ');
    return new Promise(async (resolve, reject) => {
        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        finalList = [];

        console.log('promiseBasedComputePayingUserWatchTimeReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserWatchTimeByDateRange(req, fromDate, toDate).then(async function (userWatchTime) {
            console.log('userWatchTime.length: ', userWatchTime.length);

            if (userWatchTime.length > 0){
                finalList = computePayingUserWatchTimeData(userWatchTime, fromDate);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecord(finalList, fromDate, 'watchTime');
            }
        });

        console.log('promiseBasedComputePayingUserWatchTimeReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

computePayingUserEngagementReports = async(req, res) => {
    console.log('computePayingUserEngagementReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextMonthWithLocalTime(req,  7);
    req = dateData.req;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    let finalDataList = [];

    console.log('computePayingUserEngagementReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserEngagementByDateRange(req, fromDate, toDate).then(async function (userEngagement) {
        console.log('userEngagement.length: ', userEngagement.length);

        // Now compute and store data in DB
        if (userEngagement.length > 0) finalDataList = _.clone(computePayingUsersEngagementData(userEngagement, finalDataList, fromDate));

        if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'userEngagement');
    });

    // Get compute data for next time slot
    console.log('computePayingUserEngagementReports -> day : ', Number(month), Number(helper.getDaysInMonth(month)));

    req.month = Number(req.month) + 1;
    console.log('computePayingUserEngagementReports -> month : ', Number(month), Number(req.month), new Date().getMonth());

    if (Number(req.month) < Number(helper.getTodayMonthNo()))
        computePayingUserEngagementReports(req, res);
    else{
        console.log('computePayingUserEngagementReports - data compute - done');
        delete req.month;
    }
};
promiseBasedComputePayingUserEngagementReports = async(req, res) => {
    console.log('promiseBasedComputePayingUserEngagementReports: ');
    return new Promise(async (resolve, reject) => {
        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeLastMonthDateWithLocalTime(req);
        req = dateData.req;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;
        let finalDataList = [];

        console.log('promiseBasedComputePayingUserEngagementReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserEngagementByDateRange(req, fromDate, toDate).then(async function (userEngagement) {
            console.log('userEngagement.length: ', userEngagement.length);

            // Now compute and store data in DB
            if (userEngagement.length > 0) finalDataList = _.clone(computePayingUsersEngagementData(userEngagement, finalDataList, fromDate));

            if (finalDataList.length > 0) await insertNewRecord(finalDataList, fromDate, 'userEngagement');
        });

        console.log('promiseBasedComputePayingUserEngagementReports - data compute - done');
        delete req.month;
        resolve(0);
    });
};

function computePayingUsersData(payingUsers, finalList, dateString) {
    let newObj = finalList.length > 0 ? _.cloneDeep(finalList[0]) : _.cloneDeep(cloneInfoObj());
    console.log('computePayingUsersData - newObj:', newObj, finalList.length)

    for (const record of payingUsers) {
        if (record.source === 'app') {
            newObj.source.app.count = newObj.source.app.count + record.price;
        } else if (record.source === 'web') {
            newObj.source.web.count = newObj.source.web.count + record.price;
        } else if (record.source === 'HE') {
            newObj.source.he.count = newObj.source.he.count + record.price;
        } else if (record.source === 'gdn2') {
            newObj.source.gdn2.count = newObj.source.gdn2.count + record.price;
        } else if (record.source === 'tp-gdn') {
            newObj.source.tp_gdn.count = newObj.source.tp_gdn.count + record.price;
        } else if (record.source === 'affiliate_web') {
            newObj.source.affiliate_web.count = newObj.source.affiliate_web.count + record.price;
        } else {
            newObj.source.others.count = newObj.source.others.count + record.price;
        }
    }

    newObj.added_dtm = dateString;
    newObj.added_dtm_hours = helper.setDate(new Date(dateString), null, 0, 0, 0);

    console.log('finalList - newObj:', newObj);
    return [newObj];
}

function computePayingUserSessionsData(userSessions, dateString) {
    let finalObj = {}, newObj1, newObj2, newObj3, newObj4;
    let innerObj = {session: 0, sum: 0, turn: 0, avg: 0};

    newObj1 = _.cloneDeep(innerObj); newObj2 = _.cloneDeep(innerObj); newObj3 = _.cloneDeep(innerObj); newObj4 = _.cloneDeep(innerObj);

    for (const record of userSessions) {
        if (record.session >= 1 && record.session <= 3){
            newObj1.session = '1_3';
            newObj1.sum = Number(newObj1.sum) + Number(record.sessionSum);
            newObj1.turn = Number(newObj1.turn) + Number(record.sessionTurns);
        }
        else if(record.session >= 4 && record.session <= 10){
            newObj2.session = '4_10';
            newObj2.sum = Number(newObj2.sum) + Number(record.sessionSum);
            newObj2.turn = Number(newObj2.turn) + Number(record.sessionTurns);
        }
        else if(record.session > 10){
            newObj3.session = '>_10';
            newObj3.sum = Number(newObj3.sum) + Number(record.sessionSum);
            newObj3.turn = Number(newObj3.turn) + Number(record.sessionTurns);
        }
    }

    newObj4.session = 'all';
    newObj4.sum = Number(newObj1.sum) + Number(newObj2.sum) + Number(newObj3.sum);
    newObj4.turn = Number(newObj1.turn) + Number(newObj2.turn) + Number(newObj3.turn);

    newObj1.avg = Number(newObj1.turn) > 0 ? Number(newObj1.sum) / Number(newObj1.turn) : 0;
    newObj2.avg = Number(newObj2.turn) > 0 ? Number(newObj2.sum) / Number(newObj2.turn) : 0;
    newObj3.avg = Number(newObj3.turn) > 0 ? Number(newObj3.sum) / Number(newObj3.turn) : 0;
    newObj4.avg = Number(newObj4.turn) > 0 ? Number(newObj4.sum) / Number(newObj4.turn) : 0;

    finalObj.one_three = _.cloneDeep(newObj1);
    finalObj.four_ten = _.cloneDeep(newObj2);
    finalObj.more_then_ten = _.cloneDeep(newObj3);
    finalObj.and_all = _.cloneDeep(newObj4);

    finalObj.added_dtm = dateString;
    finalObj.added_dtm_hours = dateString;

    console.log('finalObj: ', finalObj);
    return [finalObj];
}

function computePayingUserWatchTimeData(userWatchTime, dateString) {
    let obj = {session: 0, sum: 0, turn: 0, avg: 0};
    let newObj1 = _.cloneDeep(obj), newObj2 = _.cloneDeep(obj), newObj3 = _.cloneDeep(obj),
        newObj4 = _.cloneDeep(obj), newObj5 = _.cloneDeep(obj);
    let finalObj = {};

    for (const record of userWatchTime) {
        if (record.session >= 0 && record.session <= 15){
            newObj1.session = '0_15';
            newObj1.sum = Number(newObj1.sum) + Number(record.sessionSum);
            newObj1.turn = Number(newObj1.turn) + Number(record.sessionTurns);
        }
        else if(record.session > 15 && record.session <= 30){
            newObj2.session = '15_30';
            newObj2.sum = Number(newObj2.sum) + Number(record.sessionSum);
            newObj2.turn = Number(newObj2.turn) + Number(record.sessionTurns);
        }
        else if(record.session > 30 && record.session <= 60){
            newObj3.session = '30_60';
            newObj3.sum = Number(newObj3.sum) + Number(record.sessionSum);
            newObj3.turn = Number(newObj3.turn) + Number(record.sessionTurns);
        }
        else if(record.session > 60 ){
            newObj4.session = '>_60';
            newObj4.sum = Number(newObj4.sum) + Number(record.sessionSum);
            newObj4.turn = Number(newObj4.turn) + Number(record.sessionTurns);
        }
    }

    newObj5.session = 'all';
    newObj5.sum = Number(newObj1.sum) + Number(newObj2.sum) + Number(newObj3.sum) + Number(newObj4.sum);
    newObj5.turn = Number(newObj1.turn) + Number(newObj2.turn) + Number(newObj3.turn) + Number(newObj4.turn);

    newObj1.avg = Number(newObj1.turn) > 0 ? Number(newObj1.sum) / Number(newObj1.turn) : 0;
    newObj2.avg = Number(newObj2.turn) > 0 ? Number(newObj2.sum) / Number(newObj2.turn) : 0;
    newObj3.avg = Number(newObj3.turn) > 0 ? Number(newObj3.sum) / Number(newObj3.turn) : 0;
    newObj4.avg = Number(newObj4.turn) > 0 ? Number(newObj4.sum) / Number(newObj4.turn) : 0;
    newObj5.avg = Number(newObj5.turn) > 0 ? Number(newObj5.sum) / Number(newObj5.turn) : 0;

    finalObj.zero_fifteen = _.cloneDeep(newObj1);
    finalObj.sixteen_thirty = _.cloneDeep(newObj2);
    finalObj.thirtyOne_sixty = _.cloneDeep(newObj3);
    finalObj.more_then_60 = _.cloneDeep(newObj4);
    finalObj.and_all = _.cloneDeep(newObj5);

    finalObj.added_dtm = dateString;
    finalObj.added_dtm_hours = dateString;

    console.log('finalObj: ', finalObj);
    return [finalObj];
}

function computePayingUsersMonthlyData(payingUsers, finalList, dateString) {
    let newObj = finalList.length > 0 ? _.cloneDeep(finalList[0]) : _.cloneDeep(cloneInfoObj());
    console.log('computePayingUsersMonthlyData - newObj:', newObj, finalList.length)

    for (const record of payingUsers) {
        if (record.source === 'app') {
            newObj.source.app.count = newObj.source.app.count + record.count;
        } else if (record.source === 'web') {
            newObj.source.web.count = newObj.source.web.count + record.count;
        } else if (record.source === 'HE') {
            newObj.source.he.count = newObj.source.he.count + record.count;
        } else if (record.source === 'gdn2') {
            newObj.source.gdn2.count = newObj.source.gdn2.count + record.count;
        } else if (record.source === 'tp-gdn') {
            newObj.source.tp_gdn.count = newObj.source.tp_gdn.count + record.count;
        } else if (record.source === 'affiliate_web') {
            newObj.source.affiliate_web.count = newObj.source.affiliate_web.count + record.count;
        } else {
            newObj.source.others.count = newObj.source.others.count + record.count;
        }
    }

    newObj.added_dtm = dateString;
    newObj.added_dtm_hours = helper.setDate(new Date(dateString), null, 0, 0, 0);

    console.log('finalList - newObj:', newObj);
    return [newObj];
}

function computePayingUsersEngagementData(payingUsers, finalList, dateString) {
    let newObj = finalList.length > 0 ? _.cloneDeep(finalList[0]) : _.cloneDeep(cloneInfoObj());
    console.log('computePayingUsersEngagementData - newObj:', newObj, finalList.length)

    for (const record of payingUsers) {
        if (record._id === 'app') {
            newObj.source.app.count = newObj.source.app.count + record.count;
        } else if (record._id === 'web') {
            newObj.source.web.count = newObj.source.web.count + record.count;
        } else if (record._id === 'HE') {
            newObj.source.he.count = newObj.source.he.count + record.count;
        } else if (record._id === 'gdn2') {
            newObj.source.gdn2.count = newObj.source.gdn2.count + record.count;
        } else if (record._id === 'tp-gdn') {
            newObj.source.tp_gdn.count = newObj.source.tp_gdn.count + record.count;
        } else if (record._id === 'affiliate_web') {
            newObj.source.affiliate_web.count = newObj.source.affiliate_web.count + record.count;
        } else {
            newObj.source.others.count = newObj.source.others.count + record.count;
        }
    }

    newObj.added_dtm = dateString;
    newObj.added_dtm_hours = helper.setDate(new Date(dateString), null, 0, 0, 0);

    console.log('finalList - newObj:', newObj);
    return [newObj];
}


async function insertNewRecord(data, dateString, fieldName) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, fieldName);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result[fieldName] = data;

            console.log('result[fieldName]:', [fieldName]);

            await payingUsersRepo.updateReport(result, result._id);
        }
        else{
            let obj = {};
            obj.date = dateString;
            obj[fieldName] = data;
            await payingUsersRepo.createReport(obj);
        }
    });
}

function cloneInfoObj() {
    let obj = {count: 0};
    return {
        source: {
            app: _.cloneDeep(obj),
            web: _.cloneDeep(obj),
            he: _.cloneDeep(obj),
            gdn2: _.cloneDeep(obj),
            tp_gdn: _.cloneDeep(obj),
            affiliate_web: _.cloneDeep(obj),
            others: _.cloneDeep(obj),
        },
        added_dtm: '',
        added_dtm_hours: ''
    };
}

module.exports = {
    computeNewPayingUserRevenueReports: computeNewPayingUserRevenueReports,
    promiseBasedComputeNewPayingUserRevenueReports: promiseBasedComputeNewPayingUserRevenueReports,

    computeNewPayingUsersReports: computeNewPayingUsersReports,
    promiseBasedComputeNewPayingUsersReports: promiseBasedComputeNewPayingUsersReports,

    computeTotalPayingUsersReports: computeTotalPayingUsersReports,
    promiseBasedComputeTotalPayingUsersReports: promiseBasedComputeTotalPayingUsersReports,

    computePayingUserSessionsReports: computePayingUserSessionsReports,
    promiseBasedComputePayingUserSessionsReports: promiseBasedComputePayingUserSessionsReports,

    computePayingUserWatchTimeReports: computePayingUserWatchTimeReports,
    promiseBasedComputePayingUserWatchTimeReports: promiseBasedComputePayingUserWatchTimeReports,

    computePayingUserEngagementReports: computePayingUserEngagementReports,
    promiseBasedComputePayingUserEngagementReports: promiseBasedComputePayingUserEngagementReports,
};
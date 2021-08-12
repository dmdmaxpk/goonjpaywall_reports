const container = require("../../../configurations/container");
const payingUsersRepo = require('../../../repos/apis/PayingUsersRepo');
const subscriptionRepository = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
computeNewPayingUsersReports = async(req, res) => {
    console.log('computeNewPayingUsersReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeNewPayingUsersReports: ', fromDate, toDate);
    await subscriptionRepository.getNewPayingUsersByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
        console.log('newPayingUsers.length: ', newPayingUsers.length);

        if (newPayingUsers.length > 0){
            finalList = computePayingUsersData(newPayingUsers);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecordForNewPayingUsers(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeNewPayingUsersReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeNewPayingUsersReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeNewPayingUsersReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeNewPayingUsersReports - data compute - done');
        delete req.day;
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
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeNewPayingUsersReports: ', fromDate, toDate);
        await subscriptionRepository.getNewPayingUsersByDateRange(req, fromDate, toDate).then(async function (newPayingUsers) {
            console.log('newPayingUsers.length: ', newPayingUsers.length);

            if (newPayingUsers.length > 0){
                finalList = computePayingUsersData(newPayingUsers);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecordForNewPayingUsers(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeNewPayingUsersReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computeTotalPayingUsersReports = async(req, res) => {
    console.log('computeTotalPayingUsersReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeTotalPayingUsersReports: ', fromDate, toDate);
    await subscriptionRepository.getTotalPayingUsersByDateRange(req, fromDate, toDate).then(async function (totalPayingUsers) {
        console.log('totalPayingUsers.length: ', totalPayingUsers);

        if (totalPayingUsers.length > 0){
            finalList = computePayingUsersData(totalPayingUsers);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecordForTotalPayingUsers(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeTotalPayingUsersReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeTotalPayingUsersReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeTotalPayingUsersReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeTotalPayingUsersReports - data compute - done');
        delete req.day;
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
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputeTotalPayingUsersReports: ', fromDate, toDate);
        await subscriptionRepository.getTotalPayingUsersByDateRange(req, fromDate, toDate).then(async function (totalPayingUsers) {
            console.log('totalPayingUsers.length: ', totalPayingUsers.length);

            if (totalPayingUsers.length > 0){
                finalList = computePayingUsersData(totalPayingUsers);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecordForTotalPayingUsers(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeTotalPayingUsersReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computePayingUserEngagementReports = async(req, res) => {
    console.log('computePayingUserEngagementReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computePayingUserEngagementReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserEngagementByDateRange(req, fromDate, toDate).then(async function (userEngagement) {
        console.log('userEngagement.length: ', userEngagement);

        if (userEngagement.length > 0){
            finalList = computePayingUserEngagementData(userEngagement, fromDate);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecordForPayingUserEngagement(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computePayingUserEngagementReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computePayingUserEngagementReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computePayingUserEngagementReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computePayingUserEngagementReports - data compute - done');
        delete req.day;
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
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputePayingUserEngagementReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserEngagementByDateRange(req, fromDate, toDate).then(async function (userEngagement) {
            console.log('userEngagement.length: ', userEngagement.length);

            if (userEngagement.length > 0){
                finalList = computePayingUserEngagementData(userEngagement, fromDate);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecordForPayingUserEngagement(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputePayingUserEngagementReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computePayingUserSessionsReports = async(req, res) => {
    console.log('computePayingUserSessionsReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;


    console.log('computePayingUserSessionsReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserSessionsByDateRange(req, fromDate, toDate).then(async function (userSessions) {
        console.log('userSessions.length: ', userSessions);

        if (userSessions.length > 0){
            finalList = computePayingUserSessionsData(userSessions, fromDate);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecordForPayingUserSessions(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computePayingUserSessionsReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computePayingUserSessionsReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computePayingUserSessionsReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computePayingUserSessionsReports - data compute - done');
        delete req.day;
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
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputePayingUserSessionsReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserSessionsByDateRange(req, fromDate, toDate).then(async function (userSessions) {
            console.log('userSessions.length: ', userSessions.length);

            if (userSessions.length > 0){
                finalList = computePayingUserSessionsData(userSessions, fromDate);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecordForPayingUserSessions(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputePayingUserSessionsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

computePayingUserWatchTimeReports = async(req, res) => {
    console.log('computePayingUserWatchTimeReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 7);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computePayingUserWatchTimeReports: ', fromDate, toDate);
    await subscriptionRepository.getPayingUserWatchTimeByDateRange(req, fromDate, toDate).then(async function (userWatchTime) {
        console.log('userWatchTime.length: ', userWatchTime);

        if (userWatchTime.length > 0){
            finalList = computePayingUserWatchTimeData(userWatchTime, fromDate);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecordForPayingUserWatchTime(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computePayingUserWatchTimeReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computePayingUserWatchTimeReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computePayingUserWatchTimeReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computePayingUserWatchTimeReports - data compute - done');
        delete req.day;
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
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('promiseBasedComputePayingUserWatchTimeReports: ', fromDate, toDate);
        await subscriptionRepository.getPayingUserWatchTimeByDateRange(req, fromDate, toDate).then(async function (userWatchTime) {
            console.log('userWatchTime.length: ', userWatchTime.length);

            if (userWatchTime.length > 0){
                finalList = computePayingUserWatchTimeData(userWatchTime, fromDate);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecordForPayingUserWatchTime(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputePayingUserWatchTimeReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computePayingUsersData(payingUsers) {
    let newObj, finalList = [];
    newObj = _.cloneDeep(cloneInfoObj());
    for (const record of payingUsers) {
        console.log('record:', record)
        if (record.source === 'app') {
            newObj.source.app.count = newObj.source.app.count + 1;
            newObj.source.app.revenue = newObj.source.app.revenue + record.price;
        } else if (record.source === 'web') {
            newObj.source.web.count = newObj.source.web.count + 1;
            newObj.source.web.revenue = newObj.source.web.revenue + record.price;
        }  else if (record.source === 'HE') {
            newObj.source.he.count = newObj.source.he.count + 1;
            newObj.source.he.revenue = newObj.source.he.revenue + record.price;
        } else if (record.source === 'gdn2') {
            newObj.source.gdn2.count = newObj.source.gdn2.count + 1;
            newObj.source.gdn2.revenue = newObj.source.gdn2.revenue + record.price;
        } else if (record.source === 'tp-gdn') {
            newObj.source.tp_gdn.count = newObj.source.tp_gdn.count + 1;
            newObj.source.tp_gdn.revenue = newObj.source.tp_gdn.revenue + record.price;
        }  else if (record.source === 'affiliate_web') {
            newObj.source.affiliate_web.count = newObj.source.affiliate_web.count + 1;
            newObj.source.affiliate_web.revenue = newObj.source.affiliate_web.revenue + record.price;
        }

        // Package wise computations
        if (record.package === 'QDfC') {
            newObj.package.dailyLive.count = newObj.package.dailyLive.count + 1;
            newObj.package.dailyLive.revenue = newObj.package.dailyLive.revenue + record.price;
        } else if (record.package === 'QDfG') {
            newObj.package.weeklyLive.count = newObj.package.weeklyLive.count + 1;
            newObj.package.weeklyLive.revenue = newObj.package.weeklyLive.revenue + record.price;
        } else if (record.package === 'QDfH') {
            newObj.package.dailyComedy.count = newObj.package.dailyComedy.count + 1;
            newObj.package.dailyComedy.revenue = newObj.package.dailyComedy.revenue + record.price;
        } else if (record.package === 'QDfI') {
            newObj.package.weeklyComedy.count = newObj.package.weeklyComedy.count + 1;
            newObj.package.weeklyComedy.revenue = newObj.package.weeklyComedy.revenue + record.price;
        }


        // Paywall wise computations
        if (record.paywall === 'Dt6Gp70c') {
            newObj.paywall.comedy.count = newObj.paywall.comedy.count + 1;
            newObj.paywall.comedy.revenue = newObj.paywall.comedy.revenue + record.price;
        } else if (record.paywall === 'ghRtjhT7') {
            newObj.paywall.live.count = newObj.paywall.live.count + 1;
            newObj.paywall.live.revenue = newObj.paywall.live.revenue + record.price;
        }


        // Operator wise computations
        if (record.operator === 'easypaisa') {
            newObj.operator.easypaisa.count = newObj.operator.easypaisa.count + 1;
            newObj.operator.easypaisa.revenue = newObj.operator.easypaisa.revenue + record.price;
        } else if (record.operator === 'telenor' || !record.hasOwnProperty('operator')) {
            newObj.operator.telenor.count = newObj.operator.telenor.count + 1;
            newObj.operator.telenor.revenue = newObj.operator.telenor.revenue + record.price;
        }

        newObj.added_dtm = record.added_dtm;
        newObj.added_dtm_hours = helper.setDate(new Date(record.added_dtm), null, 0, 0, 0);

        console.log('newObj: ', newObj);
        finalList.push(newObj);

    }
    return finalList;
}

function computePayingUserEngagementData(userEngagement, dateString) {
    let newObj, finalList = [];
    newObj = _.cloneDeep(cloneInfoObj());
    for (const record of userEngagement) {
        console.log('record:', record);

        if (record.source === 'app')
            newObj.source.app.count = newObj.source.app.count + 1;
        else if (record.source === 'web')
            newObj.source.web.count = newObj.source.web.count + 1;
        else if (record.source === 'HE')
            newObj.source.he.count = newObj.source.he.count + 1;
        else if (record.source === 'gdn2')
            newObj.source.gdn2.count = newObj.source.gdn2.count + 1;
        else if (record.source === 'tp-gdn')
            newObj.source.tp_gdn.count = newObj.source.tp_gdn.count + 1;
        else if (record.source === 'affiliate_web')
            newObj.source.affiliate_web.count = newObj.source.affiliate_web.count + 1;


        // Package wise computations
        if (record.package === 'QDfC')
            newObj.package.dailyLive.count = newObj.package.dailyLive.count + 1;
        else if (record.package === 'QDfG')
            newObj.package.weeklyLive.count = newObj.package.weeklyLive.count + 1;
        else if (record.package === 'QDfH')
            newObj.package.dailyComedy.count = newObj.package.dailyComedy.count + 1;
        else if (record.package === 'QDfI')
            newObj.package.weeklyComedy.count = newObj.package.weeklyComedy.count + 1;



        // Paywall wise computations
        if (record.paywall === 'Dt6Gp70c')
            newObj.paywall.comedy.count = newObj.paywall.comedy.count + 1;
        else if (record.paywall === 'ghRtjhT7')
            newObj.paywall.live.count = newObj.paywall.live.count + 1;


        delete newObj.operator;
        newObj.added_dtm = dateString;
        newObj.added_dtm_hours = dateString;

        console.log('newObj: ', newObj);
        finalList.push(newObj);
    }
    return finalList;
}

function computePayingUserSessionsData(userSessions, dateString) {
    let obj = {session: 0, sum: 0, turn: 0, avg: 0};
    let newObj1 = _.cloneDeep(obj), newObj2 = _.cloneDeep(obj), newObj3 = _.cloneDeep(obj), newObj4 = _.cloneDeep(obj);
    let finalObj = {}, finalList = [];

    for (const record of userSessions) {
        console.log('record:', record);

        if (record.session >= 1 && record.session <= 3){
            newObj1.session = '1_3';
            newObj1.sum = newObj1.sum + record.sessionSum;
            newObj1.turn = newObj1.turn + record.sessionTurns;
        }
        else if(record.session >= 4 && record.session <= 10){
            newObj2.session = '4_10';
            newObj2.sum = newObj2.sum + record.sessionSum;
            newObj2.turn = newObj2.turn + record.sessionTurns;
        }
        else if(record.session > 10){
            newObj3.session = '>_10';
            newObj3.sum = newObj3.sum + record.sessionSum;
            newObj3.turn = newObj3.turn + record.sessionTurns;
        }
    }

    newObj4.session = 'all';
    newObj4.sum = (newObj1.sum + newObj2.sum + newObj3.sum);
    newObj4.turn = (newObj1.turn + newObj2.turn + newObj3.turn);

    newObj1.avg = newObj1.turn > 0 ? newObj1.sum / newObj1.turn : 0;
    newObj2.avg = newObj2.turn > 0 ? newObj2.sum / newObj2.turn : 0;
    newObj3.avg = newObj3.turn > 0 ? newObj3.sum / newObj3.turn : 0;
    newObj4.avg = newObj4.turn > 0 ? newObj4.sum / newObj4.turn : 0;

    finalObj.one_three = newObj1;
    finalObj.four_ten = newObj2;
    finalObj.more_then_ten = newObj3;
    finalObj.and_all = newObj4;

    finalObj.added_dtm = dateString;
    finalObj.added_dtm_hours = dateString;

    console.log('finalObj: ', finalObj);
    finalList.push(finalObj);
    return finalList;
}

function computePayingUserWatchTimeData(userWatchTime, dateString) {
    let obj = {session: 0, sum: 0, turn: 0, avg: 0};
    let newObj1 = _.cloneDeep(obj), newObj2 = _.cloneDeep(obj), newObj3 = _.cloneDeep(obj),
        newObj4 = _.cloneDeep(obj), newObj5 = _.cloneDeep(obj);
    let finalObj = {}, finalList = [];

    for (const record of userWatchTime) {
        console.log('record:', record);

        if (record.session >= 0 && record.session <= 15){
            newObj1.session = '0_15';
            newObj1.sum = newObj1.sum + record.sessionSum;
            newObj1.turn = newObj1.turn + record.sessionTurns;
        }
        else if(record.session > 15 && record.session <= 30){
            newObj2.session = '15_30';
            newObj2.sum = newObj2.sum + record.sessionSum;
            newObj2.turn = newObj2.turn + record.sessionTurns;
        }
        else if(record.session > 30 && record.session <= 60){
            newObj3.session = '30_60';
            newObj3.sum = newObj3.sum + record.sessionSum;
            newObj3.turn = newObj3.turn + record.sessionTurns;
        }
        else if(record.session > 60 ){
            newObj4.session = '>_60';
            newObj4.sum = newObj4.sum + record.sessionSum;
            newObj4.turn = newObj4.turn + record.sessionTurns;
        }
    }

    newObj5.session = 'all';
    newObj5.sum = (newObj1.sum + newObj2.sum + newObj3.sum + newObj4.sum);
    newObj5.turn = (newObj1.turn + newObj2.turn + newObj3.turn + newObj4.turn);

    newObj1.avg = newObj1.turn > 0 ? newObj1.sum / newObj1.turn : 0;
    newObj2.avg = newObj2.turn > 0 ? newObj2.sum / newObj2.turn : 0;
    newObj3.avg = newObj3.turn > 0 ? newObj3.sum / newObj3.turn : 0;
    newObj4.avg = newObj4.turn > 0 ? newObj4.sum / newObj4.turn : 0;
    newObj5.avg = newObj5.turn > 0 ? newObj5.sum / newObj5.turn : 0;

    finalObj.zero_fifteen = newObj1;
    finalObj.sixteen_thirty = newObj2;
    finalObj.thiryOne_sixsty = newObj3;
    finalObj.more_then_60 = newObj4;
    finalObj.and_all = newObj5;

    finalObj.added_dtm = dateString;
    finalObj.added_dtm_hours = dateString;

    console.log('finalObj: ', finalObj);
    finalList.push(finalObj);
    return finalList;
}

async function insertNewRecordForNewPayingUsers(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecordForNewPayingUsers', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.newPaying = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({newPaying: data, date: dateString});
    });
}

async function insertNewRecordForTotalPayingUsers(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecordForTotalPayingUsers', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.totalPaying = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({totalPaying: data, date: dateString});
    });
}

async function insertNewRecordForPayingUserEngagement(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecordForPayingUserEngagement', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.userEngagement = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({userEngagement: data, date: dateString});
    });
}

async function insertNewRecordForPayingUserWatchTime(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecordForPayingUserSessions', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.userSessions = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({userSessions: data, date: dateString});
    });
}

async function insertNewRecordForPayingUserSessions(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecordForPayingUserWatchTime', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.watchTime = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({watchTime: data, date: dateString});
    });
}

function cloneInfoObj() {
    let obj = {count: 0, revenue: 0};
    return {
        source: {
            app: _.cloneDeep(obj),
            web: _.cloneDeep(obj),
            he: _.cloneDeep(obj),
            gdn2: _.cloneDeep(obj),
            tp_gdn: _.cloneDeep(obj),
            affiliate_web: _.cloneDeep(obj)
        },
        package: {
            dailyLive: _.cloneDeep(obj),
            weeklyLive: _.cloneDeep(obj),
            dailyComedy: _.cloneDeep(obj),
            weeklyComedy: _.cloneDeep(obj)
        },
        operator: {
            telenor: _.cloneDeep(obj),
            easypaisa: _.cloneDeep(obj)
        },
        paywall: {
            comedy: _.cloneDeep(obj),
            live: _.cloneDeep(obj)
        },
        added_dtm: '',
        added_dtm_hours: ''
    };
}

module.exports = {
    computeNewPayingUsersReports: computeNewPayingUsersReports,
    promiseBasedComputeNewPayingUsersReports: promiseBasedComputeNewPayingUsersReports,

    computeTotalPayingUsersReports: computeTotalPayingUsersReports,
    promiseBasedComputeTotalPayingUsersReports: promiseBasedComputeTotalPayingUsersReports,

    computePayingUserEngagementReports: computePayingUserEngagementReports,
    promiseBasedComputePayingUserEngagementReports: promiseBasedComputePayingUserEngagementReports,

    computePayingUserSessionsReports: computePayingUserSessionsReports,
    promiseBasedComputePayingUserSessionsReports: promiseBasedComputePayingUserSessionsReports,

    computePayingUserWatchTimeReports: computePayingUserWatchTimeReports,
    promiseBasedComputePayingUserWatchTimeReports: promiseBasedComputePayingUserWatchTimeReports,
};
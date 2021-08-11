const container = require("../../../configurations/container");
const payingUsersRepo = require('../../../repos/apis/PayingUsersRepo');
const subscriptionRepository = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
computeRevenueFromNewUserReports = async(req, res) => {
    console.log('computeRevenueFromNewUserReports: ');

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

    console.log('computeRevenueFromNewUserReports: ', fromDate, toDate);
    await subscriptionRepository.getNewPayingUsersByDateRange(req, fromDate, toDate).then(async function (PayingUsers) {
        console.log('PayingUsers.length: ', PayingUsers);

        if (PayingUsers.length > 0){
            finalList = computePayingUsersData(PayingUsers);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecord(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getChurnByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeRevenueFromNewUserReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeRevenueFromNewUserReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getChurnByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeRevenueFromNewUserReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeRevenueFromNewUserReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};
promiseBasedComputeChurnReports = async(req, res) => {
    console.log('promiseBasedComputeChurnReports: ');
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

        console.log('promiseBasedComputeChurnReports: ', fromDate, toDate);
        await subscriptionRepository.getChurnByDateRange(req, fromDate, toDate).then(async function (PayingUsers) {
            console.log('PayingUsers.length: ', PayingUsers.length);

            if (PayingUsers.length > 0){
                finalList = computePayingUsersData(PayingUsers);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecord(finalList, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeChurnReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computePayingUsersData(PayingUsers) {
    let newObj = {}, finalList = [];
    for (const record of PayingUsers) {

        newObj = _.cloneDeep(cloneInfoObj());
        if (record.source === 'app') {
            newObj.source.app.count = newObj.source.app.count + 1;
            newObj.source.app.revenue = newObj.source.app.revenue + record.price;
        } else if (record.source === 'web') {
            newObj.source.web.count = newObj.source.web.count + 1;
            newObj.source.web.revenue = newObj.source.web.revenue + record.price;
        } else if (record.source === 'system') {
            newObj.source.system.count = newObj.source.system.count + 1;
            newObj.source.system.revenue = newObj.source.system.revenue + record.price;
        } else if (record.source === 'dmdmax') {
            newObj.source.dmdmax.count = newObj.source.dmdmax.count + 1;
            newObj.source.dmdmax.revenue = newObj.source.dmdmax.revenue + record.price;
        } else if (record.source === 'system_after_grace_end') {
            newObj.source.system_after_grace_end.count = newObj.source.system_after_grace_end.count + 1;
            newObj.source.system_after_grace_end.revenue = newObj.source.system_after_grace_end.revenue + record.price;
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

        return finalList;
    }
}

async function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await payingUsersRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.paying = data;

            await payingUsersRepo.updateReport(result, result._id);
        }
        else
            await payingUsersRepo.createReport({paying: data, date: dateString});
    });
}

function cloneInfoObj() {
    return {
        source: {
            app: {count: 0, revenue: 0},
            web: {count: 0, revenue: 0},
            dmdmax: {count: 0, revenue: 0},
            system: {count: 0, revenue: 0},
            system_after_grace_end: {count: 0, revenue: 0}
        },
        package: {
            dailyLive: {count: 0, revenue: 0},
            weeklyLive: {count: 0, revenue: 0},
            dailyComedy: {count: 0, revenue: 0},
            weeklyComedy: {count: 0, revenue: 0}
        },
        operator: {
            telenor: {count: 0, revenue: 0},
            easypaisa: {count: 0, revenue: 0}
        },
        paywall: {
            comedy: {count: 0, revenue: 0},
            live: {count: 0, revenue: 0}
        },
        added_dtm: '',
        added_dtm_hours: ''
    };
}


module.exports = {
    computeRevenueFromNewUserReports: computeRevenueFromNewUserReports,
    promiseBasedComputeChurnReports: promiseBasedComputeChurnReports,
};
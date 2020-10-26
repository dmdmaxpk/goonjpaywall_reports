const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const userRepo = container.resolve('userRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalList = [];
computeUserReports = async(req, res) => {
    console.log('computeUserReports: ');

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

    console.log('computeUserReports: ', fromDate, toDate);
    await userRepo.getUsersByDateRange(req, fromDate, toDate).then(async function (users) {
        console.log('users.length: ', users.length);

        if (users.length > 0){
            finalList = computeUserData(users);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                await insertNewRecord(finalList, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getUsersByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        if (month < helper.getTodayMonthNo())
            computeUserReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            computeUserReports(req, res);
    }
    else{
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getUsersByDateRange -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeUserReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeUserReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};
promiseBasedComputeUserReports = async(req, res) => {
    console.log('promiseBasedComputeUserReports: ');
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

        console.log('computeUserReports: ', fromDate, toDate);
        await userRepo.getUsersByDateRange(req, fromDate, toDate).then(async function (users) {
            console.log('users.length: ', users.length);

            if (users.length > 0){
                finalList = computeUserData(users);

                console.log('finalList.length : ', finalList.length);
                if (finalList.length > 0)
                    await insertNewRecord(finalList, fromDate);
            }
        });
        if (helper.isToday(fromDate)){
            console.log('computeUserReports - data compute - done');
            delete req.day;
            delete req.month;
        }

        resolve(0);
    });
};

function computeUserData(users) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < users.length; j++) {

        outerObj = users[j];
        newObj = {active : 0, nonActive: 0, verified: 0, nonVerified: 0, added_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < users.length; k++) {

                innerObj = users[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.active)
                        newObj.active = newObj.active + 1;
                    else
                        newObj.nonActive = newObj.nonActive + 1;

                    if (innerObj.operator || innerObj.operator !== null)
                        newObj.verified = newObj.verified + 1;
                    else
                        newObj.nonVerified = newObj.nonVerified + 1;

                    newObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return finalList;
}

async function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            result.users = data;

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({users: data, date: dateString});
    });
}


module.exports = {
    computeUserReports: computeUserReports,
    promiseBasedComputeUserReports: promiseBasedComputeUserReports,
};
const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');
const userRepo = container.resolve('userRepository');
const helper = require('../../helper/helper');
const  _ = require('lodash');

computeUserReports = async(req, res) => {
    console.log('computeUserReports: ');
    let fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeUserReports: ', fromDate, toDate);
    userRepo.getUsersByDateRange(req, fromDate, toDate).then(function (users) {
        console.log('users-1: ', users);

        if (users.length > 0){
            finalList = computeUserData(users);

            console.log('finalList.length : ', finalList.length, finalList);
            if (finalList.length > 0)
                insertNewRecord(finalList, new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getUsersByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeUserReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getDayOfMonth(req.day, month))
                computeUserReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getUsersByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeUserReports(req, res);
        }
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

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscriptions: ', result);
        if (result.length > 0) {
            result = result[0];
            result.users = data;

            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({users: data, date: dateString});
    });
}


module.exports = {
    computeUserReports: computeUserReports,
};
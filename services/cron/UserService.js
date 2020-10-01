const container = require("../../configurations/container");
const reportsRepo = require('../../repos/ReportsRepo');

const userRepo = container.resolve('userRepository');
const  _ = require('lodash');

computeUserReports = async(req, res) => {
    console.log('computeUserReports: ');

    let fromDate, toDate, day, month, finalList = [];
    reportsRepo.checkLastDocument().then(function (result) {
        console.log('result: ', result);

        day = req.day ? req.day : 1;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : 2;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        console.log('day : ', day, req.day);
        console.log('month : ', month, req.month);

        fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
        toDate  = _.clone(fromDate);
        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);

        console.log('computeUserReports: ', fromDate, toDate);
        userRepo.getUsersByDateRange(req, fromDate, toDate).then(function (users) {
            console.log('users-1: ', users);

            if (users.length > 0){
                finalList = computeUserData(users);

                console.log('finalList.length : ', finalList.length, finalList);
                if (finalList.length > 0)
                    insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
            }

            // Get compute data for next time slot
            req.day = Number(req.day) + 1;
            console.log('getUsersByDateRange -> day : ', day, req.day, getDaysInMonth(month));

            if (req.day <= getDaysInMonth(month))
                computeUserReports(req, res);
            else{
                req.day = 1;
                req.month = Number(req.month) + 1;
                console.log('getUsersByDateRange -> month : ', month, req.month, new Date().getMonth());

                if (req.month <= new Date().getMonth())
                    computeUserReports(req, res);
            }
        });
    });
};

function computeUserData(users) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < users.length; j++) {

        outerObj = users[j];
        newObj = {active : 0, nonActive: 0, verified: 0, nonVerified: 0, added_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < users.length; k++) {

                innerObj = users[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

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
                    newObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
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

function setDate(date, h=null,m, s, mi){
    if (h !== null)
        date.setHours(h);

    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}

function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    computeUserReports: computeUserReports,
};
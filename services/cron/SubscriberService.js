const container = require("../../configurations/container");
const reportsRepo = require('../../repos/ReportsRepo');

const subscriberRepo = container.resolve('subscriberRepository');
const  _ = require('lodash');

computeSubscriberReports = async(req, res) => {
    console.log('computeSubscriberReports');

    let fromDate, toDate, day, month, finalList = [];
    reportsRepo.checkLastDocument().then(function (result) {
        console.log('result: ', result.length);

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

        console.log('computeSubscriberReports: ', fromDate, toDate);
        subscriberRepo.getSubscribersByDateRange(req, fromDate, toDate).then(function (subscribers) {
            console.log('subscribers: ', subscribers.length);

            if (subscribers.length > 0){
                finalList = computeSubscriberData(subscribers);

                console.log('finalList.length : ', finalList.total.length, finalList);
                if (finalList.total.length > 0)
                    insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
            }

            // Get compute data for next time slot
            req.day = Number(req.day) + 1;
            console.log('computeSubscriberReports -> day : ', day, req.day, getDaysInMonth(month));

            if (req.day <= getDaysInMonth(month))
                computeSubscriberReports(req, res);
            else{
                req.day = 1;
                req.month = Number(req.month) + 1;
                console.log('computeSubscriberReports -> month : ', month, req.month, new Date().getMonth());

                if (req.month <= new Date().getMonth())
                    computeSubscriberReports(req, res);
            }
        });
    });
};

function computeSubscriberData(subscribers) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = {total: []};
    for (let j=0; j < subscribers.length; j++) {

        outerObj = subscribers[j];
        newObj = {total : 0, added_dtm: ''};
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscribers.length; k++) {

                innerObj = subscribers[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    newObj.total = newObj.total + 1;

                    newObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            finalList.total.push(newObj);
        }
    }

    return finalList;
}

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscribers: ', result);
        console.log('data subscribers: ', data);
        if (result.length > 0){
            result = result[0];
            result.subscribers = data;
            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({subscribers: data, date: dateString});
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
    computeSubscriberReports: computeSubscriberReports,
};
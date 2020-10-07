const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');

const pageViewRepo = container.resolve('pageViewRepo');
const  _ = require('lodash');

computePageViewReports = async(req, res) => {
    console.log('computePageViewReports');

    let fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
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

    console.log('computePageViewReports: ', fromDate, toDate);
    pageViewRepo.getPageViewsByDateRange(req, fromDate, toDate).then( async function(pageviews) {
        console.log('pageviews: ', pageviews);

        if (pageviews !== undefined && pageviews.length > 0){
            finalList = computePageviewData(pageviews);

            console.log('finalList.length : ', finalList.total.length, finalList);
            if (finalList.total.length > 0)
                insertNewRecord(finalList, computeDate(fromDate));

            req.day = Number(req.day) + 1;
            console.log('computePageViewReports -> day : ', day, req.day, getDaysInMonth(month));

            if (req.day <= getDaysInMonth(month))
                computePageViewReports(req, res);
            else{
                req.day = 1;
                req.month = Number(req.month) + 1;
                console.log('computePageViewReports -> month : ', month, req.month, new Date().getMonth());

                if (req.month <= new Date().getMonth())
                    computePageViewReports(req, res);
            }
        }
    });
};

function computePageviewData(pageviews) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = {total: []};
    for (let j=0; j < pageviews.length; j++) {

        outerObj = pageviews[j];
        newObj = {source : '', mid: '', count: 0, added_dtm: ''};
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < pageviews.length; k++) {

                innerObj = pageviews[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    newObj.total = newObj.total + innerObj.count;
                }
            }

            newObj.source = outerObj.source;
            newObj.mid = outerObj.mid;

            newObj.added_dtm = outerObj.added_dtm;
            newObj.added_dtm_hours = setDate(new Date(outerObj.added_dtm), 0, 0, 0);
            finalList.total.push(newObj);
        }
    }

    return finalList;
}

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result pageviews: ', result);
        console.log('data pageviews: ', data);
        if (result.length > 0){
            result = result[0];
            result.pageViews = data;
            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({pageViews: data, date: dateString});
    });
}

function setDate(date, m, s, mi){
    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}

function computeDate(date) {
    return date.getFullYear() +'-'+ (date.getMonth()+1) +'-'+ date.getDate();
}

function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    computePageViewReports: computePageViewReports,
};
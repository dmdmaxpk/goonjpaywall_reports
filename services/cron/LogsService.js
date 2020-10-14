const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');
const logsRepo = container.resolve('logsRepo');
const helper = require('../../helper/helper');
const  _ = require('lodash');

computeLogsPageViewReports = async(req, res) => {
    console.log('computeLogsPageViewReports');
    let dateData, fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 22, 5);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsPageViewReports: ', fromDate, toDate);
    logsRepo.getLogsPageViewByDateRange(req, fromDate, toDate).then( async function(logsPageViewData) {
        console.log('logsPageViewData: ', logsPageViewData);

        if (logsPageViewData.length > 0){
            finalList = computeLogsPageViewData(logsPageViewData);

            console.log('finalList.length : ', finalList);
                insertNewRecord(finalList, 'pageView', new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeLogsPageViewReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeLogsPageViewReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeLogsPageViewReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeLogsPageViewReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeLogsPageViewReports(req, res);
        }
    });
};

computeLogsSubscribeClicksReports = async(req, res) => {
    console.log('computeLogsSubscribeClicksReports');
    let dateData, fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 22, 5);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsSubscribeClicksReports: ', fromDate, toDate);
    logsRepo.getLogsSubscribeClicksByDateRange(req, fromDate, toDate).then( async function(logsSubscribeClicks) {
        console.log('logsSubscribeClicks: ', logsSubscribeClicks);

        if (logsSubscribeClicks.length > 0){
            finalList = computeLogsSubscribeClicks(logsSubscribeClicks);

            console.log('finalList.length : ', finalList);
                insertNewRecord(finalList, 'subsClicks', new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeLogsSubscribeClicksReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeLogsSubscribeClicksReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeLogsSubscribeClicksReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeLogsSubscribeClicksReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeLogsSubscribeClicksReports(req, res);
        }
    });
};

function computeLogsPageViewData(logsPageViewData) {

    let rawData, pageView, logsPageViewObj, sourceObj, logsWise = [], sourceWise = [];
    for (let i=0; i < logsPageViewData.length; i++) {

        rawData = logsPageViewData[i];
        sourceObj = _.clone(cloneSourceWiseObj());
        logsPageViewObj = _.clone(cloneLogsPageViewObj());

        for (let j = 0; j < rawData.pageView.length; j++) {
            pageView = rawData.pageView[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (pageView.mid === '1')
                logsPageViewObj['1'] = logsPageViewObj['1'] + pageView.count;
            else if (pageView.mid === '1569')
                logsPageViewObj['1569'] = logsPageViewObj['1569'] + pageView.count;
            else if (pageView.mid === 'aff3a')
                logsPageViewObj['aff3a'] = logsPageViewObj['aff3a'] + pageView.count;
            else if (pageView.mid === 'aff3')
                logsPageViewObj['aff3'] = logsPageViewObj['aff3'] + pageView.count;
            else if (pageView.mid === 'goonj')
                logsPageViewObj['goonj'] = logsPageViewObj['goonj'] + pageView.count;
            else if (pageView.mid === 'gdn')
                logsPageViewObj['gdn'] = logsPageViewObj['gdn'] + pageView.count;
            else if (pageView.mid === 'gdn2')
                logsPageViewObj['gdn2'] = logsPageViewObj['gdn2'] + pageView.count;
        }

        sourceWise.push(sourceObj);
        logsWise.push(logsPageViewObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {logsWise: logsWise, sourceWise: sourceWise};
}

function computeLogsSubscribeClicks(logsSubscribeClicks) {

    let rawData, subsClicks, logsSubscibeObj, logsWise = [];
    for (let i=0; i < logsSubscribeClicks.length; i++) {

        rawData = logsSubscribeClicks[i];
        logsSubscibeObj = _.clone(clonelogsObj());

        for (let j = 0; j < rawData.subsClicks.length; j++) {
            subsClicks = rawData.subsClicks[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (subsClicks.mid === '1')
                logsSubscibeObj['1'] = logsSubscibeObj['1'] + 1;
            else if (subsClicks.mid === '1569')
                logsSubscibeObj['1569'] = logsSubscibeObj['1569'] + 1;
            else if (subsClicks.mid === 'aff3a')
                logsSubscibeObj['aff3a'] = logsSubscibeObj['aff3a'] + 1;
            else if (subsClicks.mid === 'aff3')
                logsSubscibeObj['aff3'] = logsSubscibeObj['aff3'] + 1;
            else if (subsClicks.mid === 'goonj')
                logsSubscibeObj['goonj'] = logsSubscibeObj['goonj'] + 1;
            else if (subsClicks.mid === 'gdn')
                logsSubscibeObj['gdn'] = logsSubscibeObj['gdn'] + 1;
            else if (subsClicks.mid === 'gdn2')
                logsSubscibeObj['gdn2'] = logsSubscibeObj['gdn2'] + 1;

        }

        logsWise.push(logsSubscibeObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {logsWise: logsWise};
}

function insertNewRecord(data, type, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('data pageView: ', data);
        if (result.length > 0){
            result = result[0];
            if (type === 'pageView')
                result.logsPageView = data;
            else if (type === 'subsClicks')
                result.logsSubscribeClick = data;

            affiliateRepo.updateReport(result, result._id);
        }
        else{
            let obj = {};
            if (type === 'pageView')
                obj.logsPageView = data;
            else if (type === 'subsClicks')
                obj.logsSubscribeClick = data;

            obj.date = dateString;
            affiliateRepo.createReport({pageView: data, date: dateString});
        }
    });
}

function sourceWiseMidsCount(pageView, source, dataObj) {
    console.log('source: ', source);

    if (pageView.mid === '1')
        dataObj[source]['1'] = dataObj[source]['1'] + pageView.count;
    else if (pageView.mid === '1569')
        dataObj[source]['1569'] = dataObj[source]['1569'] + pageView.count;
    else if (pageView.mid === 'aff3')
        dataObj[source]['aff3'] = dataObj[source]['aff3'] + pageView.count;
    else if (pageView.mid === 'aff3a')
        dataObj[source]['aff3a'] = dataObj[source]['aff3a'] + pageView.count;
    else if (pageView.mid === 'gdn')
        dataObj[source]['gdn'] = dataObj[source]['gdn'] + pageView.count;
    else if (pageView.mid === 'gdn2')
        dataObj[source]['gdn2'] = dataObj[source]['gdn2'] + pageView.count;
    else if (pageView.mid === 'goonj')
        dataObj[source]['goonj'] = dataObj[source]['goonj'] + pageView.count;

    console.log('dataObj: ', dataObj);

    return dataObj;
}

function clonelogsObj() {
    return {
        '1': 0,
        '1569': 0,
        aff3: 0,
        aff3a: 0,
        gdn: 0,
        gdn2: 0,
        goonj: 0
    }
}
function cloneLogsPageViewObj() {
    return {
        '1': 0,
        '1569': 0,
        aff3: 0,
        aff3a: 0,
        gdn: 0,
        gdn2: 0,
        goonj: 0
    }
}
function cloneLogsSourceWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    //app, web, gdn2, HE, he, affiliate
    return {
        app: _.clone(mids),
        web: _.clone(mids),
        gdn2: _.clone(mids),
        HE: _.clone(mids),
        he: _.clone(mids),
        affiliate: _.clone(mids),
        'null': _.clone(mids)
    }
}

module.exports = {
    computeLogsPageViewReports: computeLogsPageViewReports,
    computeLogsSubscribeClicksReports: computeLogsSubscribeClicksReports,
};
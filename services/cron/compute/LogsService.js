const container = require("../../../configurations/container");
const affiliateRepo = require('../../../repos/apis/AffiliateRepo');
const logsRepo = container.resolve('logsRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeLogsPageViewReports = async(req, res) => {
    console.log('computeLogsPageViewReports');
    let dateData, fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 30, 8);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsPageViewReports: ', fromDate, toDate);
    await logsRepo.getLogsPageViewByDateRange(req, fromDate, toDate).then( async function(logsPageViewData) {
        console.log('logsPageViewData: ', logsPageViewData.length);

        if (logsPageViewData.length > 0){
            finalList = computeLogsPageViewData(logsPageViewData);

            console.log('finalList.length : ', finalList.length);
            await insertNewRecord(finalList, 'pageView', fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getLogsPageViewByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

        if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
            if (Number(month) < Number(helper.getTodayMonthNo()))
                computeLogsPageViewReports(req, res);
            else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
                computeLogsPageViewReports(req, res);
        }
        else{
            console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getLogsPageViewByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

            if (Number(req.month) <= Number(helper.getTodayMonthNo()))
                computeLogsPageViewReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeLogsPageViewReports - data compute - done');
            delete req.day;
            delete req.month;
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
    dateData = helper.computeNextDate(req, 30, 8);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsSubscribeClicksReports: ', fromDate, toDate);
    await logsRepo.getLogsSubscribeClicksByDateRange(req, fromDate, toDate).then( async function(logsSubscribeClicks) {
        console.log('logsSubscribeClicks: ', logsSubscribeClicks.length);

        if (logsSubscribeClicks.length > 0){
            finalList = computeLogsSubscribeClicks(logsSubscribeClicks);

            console.log('finalList.length : ', finalList.length);
            await insertNewRecord(finalList, 'subsClicks', fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getLogsSubscribeClicksByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

        if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
            if (Number(month) < Number(helper.getTodayMonthNo()))
                computeLogsSubscribeClicksReports(req, res);
            else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
                computeLogsSubscribeClicksReports(req, res);
        }
        else{
            console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getLogsSubscribeClicksByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

            if (Number(req.month) <= Number(helper.getTodayMonthNo()))
                computeLogsSubscribeClicksReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeLogsSubscribeClicksReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeLogsPageViewReports = async(req, res) => {
    console.log('promiseBasedComputeLogsPageViewReports');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, finalList = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('computeLogsPageViewReports: ', fromDate, toDate);
        await logsRepo.getLogsPageViewByDateRange(req, fromDate, toDate).then( async function(logsPageViewData) {
            console.log('logsPageViewData: ', logsPageViewData.length);

            if (logsPageViewData.length > 0){
                finalList = computeLogsPageViewData(logsPageViewData);

                console.log('finalList.length : ', finalList.length);
                await insertNewRecord(finalList, 'pageView', fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeLogsPageViewReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};
promiseBasedComputeLogsSubscribeClicksReports = async(req, res) => {
    console.log('promiseBasedComputeLogsSubscribeClicksReports');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, finalList = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('computeLogsSubscribeClicksReports: ', fromDate, toDate);
        await logsRepo.getLogsSubscribeClicksByDateRange(req, fromDate, toDate).then( async function(logsSubscribeClicks) {
            console.log('logsSubscribeClicks: ', logsSubscribeClicks.length);

            if (logsSubscribeClicks.length > 0){
                finalList = computeLogsSubscribeClicks(logsSubscribeClicks);

                console.log('finalList.length : ', finalList.length);
                await insertNewRecord(finalList, 'subsClicks', fromDate);
            }

        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeLogsSubscribeClicksReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeLogsPageViewData(logsPageViewData) {

    let rawData, pageView, logsPageViewObj, logsWise = [];
    logsPageViewObj = _.clone(clonelogsObj());

    for (let i=0; i < logsPageViewData.length; i++) {

        rawData = logsPageViewData[i];
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
    }

    logsWise.push(logsPageViewObj);
    return logsWise;
}

function computeLogsSubscribeClicks(logsSubscribeClicks) {

    let rawData, subsClicks, logsSubscibeObj, subscribeClick = [];
    logsSubscibeObj = _.clone(clonelogsObj());

    for (let i=0; i < logsSubscribeClicks.length; i++) {
        rawData = logsSubscribeClicks[i];
        for (let j = 0; j < rawData.subsClicks.length; j++) {
            subsClicks = rawData.subsClicks[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (subsClicks.mid === '1')
                logsSubscibeObj['1'] = logsSubscibeObj['1'] + subsClicks.count;
            else if (subsClicks.mid === '1569')
                logsSubscibeObj['1569'] = logsSubscibeObj['1569'] + subsClicks.count;
            else if (subsClicks.mid === 'aff3a')
                logsSubscibeObj['aff3a'] = logsSubscibeObj['aff3a'] + subsClicks.count;
            else if (subsClicks.mid === 'aff3')
                logsSubscibeObj['aff3'] = logsSubscibeObj['aff3'] + subsClicks.count;
            else if (subsClicks.mid === 'goonj')
                logsSubscibeObj['goonj'] = logsSubscibeObj['goonj'] + subsClicks.count;
            else if (subsClicks.mid === 'gdn')
                logsSubscibeObj['gdn'] = logsSubscibeObj['gdn'] + subsClicks.count;
            else if (subsClicks.mid === 'gdn2')
                logsSubscibeObj['gdn2'] = logsSubscibeObj['gdn2'] + subsClicks.count;
        }
    }

    subscribeClick.push(logsSubscibeObj);
    return subscribeClick;
}

function insertNewRecord(data, type, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
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
            affiliateRepo.createReport(obj);
        }
    });
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

module.exports = {
    computeLogsPageViewReports: computeLogsPageViewReports,
    computeLogsSubscribeClicksReports: computeLogsSubscribeClicksReports,

    promiseBasedComputeLogsPageViewReports: promiseBasedComputeLogsPageViewReports,
    promiseBasedComputeLogsSubscribeClicksReports: promiseBasedComputeLogsSubscribeClicksReports
};
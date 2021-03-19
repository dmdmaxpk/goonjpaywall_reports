const container = require("../../../configurations/container");
const affiliateRepo = require('../../../repos/apis/AffiliateRepo');
const logsRepo = container.resolve('logsRepo');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeHelogsReports = async(req, res) => {
    console.log('computeHelogsReports');
    let dateData, fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 17, 12);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeHelogsReports: ', fromDate, toDate);
    await logsRepo.getHelogsByDateRange(req, fromDate, toDate).then( async function(helogsData) {
        console.log('helogsData: ', helogsData.length);

        if (helogsData.length > 0){
            finalList = computeHelogsData(helogsData);

            console.log('finalList.length : ', finalList.length);
            await insertNewRecord(finalList, 'helogs', fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getHelogsByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

        if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
            if (Number(month) < Number(helper.getTodayMonthNo()))
                computeHelogsReports(req, res);
            else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
                computeHelogsReports(req, res);
        }
        else{
            console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getHelogsByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

            if (Number(req.month) <= Number(helper.getTodayMonthNo()))
                computeHelogsReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeHelogsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};
computeHelogsUniqueSuccessReports = async(req, res) => {
    console.log('computeHelogsUniqueSuccessReports');
    let dateData, fromDate, toDate, day, month, finalList = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 17, 12);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeHelogsUniqueSuccessReports: ', fromDate, toDate);
    await logsRepo.getHelogsUniqueSuccessByDateRange(req, fromDate, toDate).then( async function(helogsData) {
        console.log('helogsData: ', helogsData.length);

        if (helogsData.length > 0){
            finalList = computeHelogsUniqueSuccess(helogsData);

            console.log('finalList.length : ', finalList.length);
            await insertNewRecord(finalList, 'unique', fromDate);
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getHelogsUniqueSuccessByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

        if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
            if (Number(month) < Number(helper.getTodayMonthNo()))
                computeHelogsUniqueSuccessReports(req, res);
            else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
                computeHelogsUniqueSuccessReports(req, res);
        }
        else{
            console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getHelogsUniqueSuccessByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

            if (Number(req.month) <= Number(helper.getTodayMonthNo()))
                computeHelogsUniqueSuccessReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeHelogsUniqueSuccessReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeHelogsUniqueSuccessReports = async(req, res) => {
    console.log('promiseBasedComputeHelogsUniqueSuccessReports');
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

        console.log('computeHelogsUniqueSuccessReports: ', fromDate, toDate);
        await logsRepo.getHelogsUniqueSuccessByDateRange(req, fromDate, toDate).then( async function(helogsData) {
            console.log('helogsData: ', helogsData.length);

            if (helogsData.length > 0){
                finalList = computeHelogsUniqueSuccess(helogsData);

                console.log('finalList.length : ', finalList.length);
                await insertNewRecord(finalList, 'unique', fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeHelogsUniqueSuccessReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};
promiseBasedComputeHelogsReports = async(req, res) => {
    console.log('promiseBasedComputeHelogsReports');
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

        console.log('computeHelogsReports: ', fromDate, toDate);
        await logsRepo.getHelogsByDateRange(req, fromDate, toDate).then( async function(helogsData) {
            console.log('helogsData: ', helogsData.length);

            if (helogsData.length > 0){
                finalList = computeHelogsData(helogsData);

                console.log('finalList.length : ', finalList.length);
                await insertNewRecord(finalList, 'helogs', fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeHelogsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeHelogsData(helogsRawData) {

    let rawData, helog, helogsObj, helogsWise = [];
    helogsObj = _.clone(cloneHelogsObj());
    for (let i=0; i < helogsRawData.length; i++) {
        rawData = helogsRawData[i];
        for (let j = 0; j < rawData.helogs.length; j++) {
            helog = rawData.helogs[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (helog.mid === '1')
                helogsObj['1'] = helogsObj['1'] + helog.count;
            else if (helog.mid === '1569')
                helogsObj['1569'] = helogsObj['1569'] + helog.count;
            else if (helog.mid === 'aff3a')
                helogsObj['aff3a'] = helogsObj['aff3a'] + helog.count;
            else if (helog.mid === 'aff3')
                helogsObj['aff3'] = helogsObj['aff3'] + helog.count;
            else if (helog.mid === 'goonj')
                helogsObj['goonj'] = helogsObj['goonj'] + helog.count;
            else if (helog.mid === 'gdn')
                helogsObj['gdn'] = helogsObj['gdn'] + helog.count;
            else if (helog.mid === 'gdn2')
                helogsObj['gdn2'] = helogsObj['gdn2'] + helog.count;
        }
    }

    helogsWise.push(helogsObj);
    return helogsWise;
}

function computeHelogsUniqueSuccess(helogsRawData) {

    let rawData, helog, helogsObj, helogsWise = [];
    helogsObj = _.clone(cloneHelogsObj());
    for (let i=0; i < helogsRawData.length; i++) {

        rawData = helogsRawData[i];
        for (let j = 0; j < rawData.helogs.length; j++) {
            helog = rawData.helogs[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (helog.mid === '1')
                helogsObj['1'] = helogsObj['1'] + helog.count;
            else if (helog.mid === '1569')
                helogsObj['1569'] = helogsObj['1569'] + helog.count;
            else if (helog.mid === 'aff3a')
                helogsObj['aff3a'] = helogsObj['aff3a'] + helog.count;
            else if (helog.mid === 'aff3')
                helogsObj['aff3'] = helogsObj['aff3'] + helog.count;
            else if (helog.mid === 'goonj')
                helogsObj['goonj'] = helogsObj['goonj'] + helog.count;
            else if (helog.mid === 'gdn')
                helogsObj['gdn'] = helogsObj['gdn'] + helog.count;
            else if (helog.mid === 'gdn2')
                helogsObj['gdn2'] = helogsObj['gdn2'] + helog.count;
        }
    }

    helogsWise.push(helogsObj);
    return helogsWise;
}

function insertNewRecord(data, type, dateString) {
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0){
            result = result[0];
            if (type === 'helogs')
                result.helogs = data;
            else if (type === 'unique')
                result.uniqueSuccessHe = data;

            affiliateRepo.updateReport(result, result._id);
        }
        else{
            let obj = {};
            if (type === 'helogs')
                obj.helogs = data;
            else if (type === 'unique')
                obj.uniqueSuccessHe = data;

            obj.date = dateString;
            affiliateRepo.createReport(obj);
        }
    });
}

function cloneHelogsObj() {
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
    computeHelogsReports: computeHelogsReports,
    computeHelogsUniqueSuccessReports: computeHelogsUniqueSuccessReports,

    promiseBasedComputeHelogsReports: promiseBasedComputeHelogsReports,
    promiseBasedComputeHelogsUniqueSuccessReports: promiseBasedComputeHelogsUniqueSuccessReports
};
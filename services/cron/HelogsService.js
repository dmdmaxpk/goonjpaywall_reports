const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');
const logsRepo = container.resolve('logsRepo');
const helper = require('../../helper/helper');
const  _ = require('lodash');

computeHelogsReports = async(req, res) => {
    console.log('computeHelogsReports');

    let dateData, fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */

    dateData = helper.computeNextDate(req, 30, 6);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeHelogsReports: ', fromDate, toDate);
    logsRepo.getHelogsByDateRange(req, fromDate, toDate).then( async function(helogsData) {
        console.log('helogsData: ', helogsData);

        if (helogsData.length > 0){
            finalList = computeHelogsData(helogsData);

            console.log('finalList.length : ', finalList);
            insertNewRecord(finalList, 'helogs', new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeHelogsReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeHelogsReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeHelogsReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeHelogsReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeHelogsReports(req, res);
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

    dateData = helper.computeNextDate(req, 30, 6);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeHelogsUniqueSuccessReports: ', fromDate, toDate);
    logsRepo.getHelogsDistictDataByDateRange(req, fromDate, toDate).then( async function(helogsData) {
        console.log('helogsData: ', helogsData);

        if (helogsData.length > 0){
            finalList = computeHelogsUniqueSuccess(helogsData);

            console.log('finalList.length : ', finalList);
            insertNewRecord(finalList, 'unique', new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeHelogsUniqueSuccessReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeHelogsUniqueSuccessReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeHelogsUniqueSuccessReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeHelogsUniqueSuccessReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeHelogsUniqueSuccessReports(req, res);
        }
    });
};

function computeHelogsData(helogsRawData) {

    let rawData, helog, helogsObj, helogsWise = [];
    for (let i=0; i < helogsRawData.length; i++) {

        rawData = helogsRawData[i];
        helogsObj = _.clone(cloneHelogsObj());

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

        helogsWise.push(helogsObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return helogsWise;
}

function computeHelogsUniqueSuccess(helogsRawData) {

    let rawData, helog, helogsObj, helogsWise = [];
    for (let i=0; i < helogsRawData.length; i++) {

        rawData = helogsRawData[i];
        helogsObj = _.clone(cloneHelogsObj());

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

        helogsWise.push(helogsObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {helogsWise: helogsWise};
}

function insertNewRecord(data, type, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('data helogs: ', data);
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
};
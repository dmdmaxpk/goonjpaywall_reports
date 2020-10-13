const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');

const logsRepo = container.resolve('logsRepo');
const  _ = require('lodash');

function computeNextDate(req){

    let fromDate, toDate, day, month;

    day = req.day ? req.day : 30;
    day = day > 9 ? day : '0'+Number(day);
    req.day = day;

    month = req.month ? req.month : 6;
    month = month > 9 ? month : '0'+Number(month);
    req.month = month;

    console.log('day : ', day, req.day);
    console.log('month : ', month, req.month);

    fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
    toDate  = _.clone(fromDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    console.log('computeNextDate: ', fromDate, toDate);
    return {req: req, day: day, month: month, fromDate: fromDate, toDate: toDate};
}

computeLogsReports = async(req, res) => {
    console.log('computeLogsReports');

    let dateData, fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */

    dateData = computeNextDate(req);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsReports: ', fromDate, toDate);
    logsRepo.getLogsByDateRange(req, fromDate, toDate).then( async function(logsData) {
        console.log('logsData: ', logsData);

        if (logsData.length > 0){
            finalList = computeLogsData(logsData);

            console.log('finalList.length : ', finalList);
                insertNewRecord(finalList, 'logs', new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeLogsReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeLogsReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeLogsReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeLogsReports(req, res);
        }
    });
};

computeLogsUniqueSuccessReports = async(req, res) => {
    console.log('computeLogsUniqueSuccessReports');

    let dateData, fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */

    dateData = computeNextDate(req);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeLogsUniqueSuccessReports: ', fromDate, toDate);
    logsRepo.getLogsDistictDataByDateRange(req, fromDate, toDate).then( async function(logsData) {
        console.log('logsData: ', logsData);

        if (logsData.length > 0){
            finalList = computeLogsUniqueSuccess(logsData);

            console.log('finalList.length : ', finalList);
                insertNewRecord(finalList, 'unique', new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeLogsUniqueSuccessReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeLogsUniqueSuccessReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeLogsUniqueSuccessReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeLogsUniqueSuccessReports(req, res);
        }
    });
};

function computeLogsData(logsRawData) {

    let rawData, helog, logsObj, sourceObj, logsWise = [], sourceWise = [];
    for (let i=0; i < logsRawData.length; i++) {

        rawData = logsRawData[i];
        sourceObj = _.clone(cloneSourceWiseObj());
        logsObj = _.clone(clonelogsObj());

        for (let j = 0; j < rawData.logs.length; j++) {
            helog = rawData.logs[j];

            //collect data => source wise, get Mids count
            //app, web, gdn2, HE, he, affiliate
            if (helog.source === 'app')
                sourceObj = sourceWiseMidsCount(helog, 'app', sourceObj);
            else if (helog.source === 'web')
                sourceObj = sourceWiseMidsCount(helog, 'web', sourceObj);
            else if (helog.source === 'gdn2')
                sourceObj = sourceWiseMidsCount(helog, 'gdn2', sourceObj);
            else if (helog.source === 'HE')
                sourceObj = sourceWiseMidsCount(helog, 'HE', sourceObj);
            else if (helog.source === 'he')
                sourceObj = sourceWiseMidsCount(helog, 'he', sourceObj);
            else if (helog.source === 'affiliate')
                sourceObj = sourceWiseMidsCount(helog, 'affiliate', sourceObj);
            else if (helog.source === 'null')
                sourceObj = sourceWiseMidsCount(helog, 'null', sourceObj);

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (helog.mid === '1')
                logsObj['1'] = logsObj['1'] + helog.count;
            else if (helog.mid === '1569')
                logsObj['1569'] = logsObj['1569'] + helog.count;
            else if (helog.mid === 'aff3a')
                logsObj['aff3a'] = logsObj['aff3a'] + helog.count;
            else if (helog.mid === 'aff3')
                logsObj['aff3'] = logsObj['aff3'] + helog.count;
            else if (helog.mid === 'goonj')
                logsObj['goonj'] = logsObj['goonj'] + helog.count;
            else if (helog.mid === 'gdn')
                logsObj['gdn'] = logsObj['gdn'] + helog.count;
            else if (helog.mid === 'gdn2')
                logsObj['gdn2'] = logsObj['gdn2'] + helog.count;
        }

        sourceWise.push(sourceObj);
        logsWise.push(logsObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {logsWise: logsWise, sourceWise: sourceWise};
}

function computeLogsUniqueSuccess(logsRawData) {

    let rawData, helog, logsObj, logsWise = [];
    for (let i=0; i < logsRawData.length; i++) {

        rawData = logsRawData[i];
        logsObj = _.clone(clonelogsObj());

        for (let j = 0; j < rawData.logs.length; j++) {
            helog = rawData.logs[j];

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (helog.mid === '1')
                logsObj['1'] = logsObj['1'] + 1;
            else if (helog.mid === '1569')
                logsObj['1569'] = logsObj['1569'] + 1;
            else if (helog.mid === 'aff3a')
                logsObj['aff3a'] = logsObj['aff3a'] + 1;
            else if (helog.mid === 'aff3')
                logsObj['aff3'] = logsObj['aff3'] + 1;
            else if (helog.mid === 'goonj')
                logsObj['goonj'] = logsObj['goonj'] + 1;
            else if (helog.mid === 'gdn')
                logsObj['gdn'] = logsObj['gdn'] + 1;
            else if (helog.mid === 'gdn2')
                logsObj['gdn2'] = logsObj['gdn2'] + 1;

        }

        logsWise.push(logsObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {logsWise: logsWise};
}

function insertNewRecord(data, type, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('data logs: ', data);
        if (result.length > 0){
            result = result[0];
            if (type === 'logs')
                result.logs = data;
            else if (type === 'unique')
                result.logsUniqueSuccessHe = data;

            affiliateRepo.updateReport(result, result._id);
        }
        else{
            let obj = {};
            if (type === 'logs')
                obj.logs = data;
            else if (type === 'unique')
                obj.logsUniqueSuccessHe = data;

            obj.date = dateString;
            affiliateRepo.createReport({logs: data, date: dateString});
        }
    });
}

function sourceWiseMidsCount(helog, source, dataObj) {
    console.log('source: ', source);

    if (helog.mid === '1')
        dataObj[source]['1'] = dataObj[source]['1'] + helog.count;
    else if (helog.mid === '1569')
        dataObj[source]['1569'] = dataObj[source]['1569'] + helog.count;
    else if (helog.mid === 'aff3')
        dataObj[source]['aff3'] = dataObj[source]['aff3'] + helog.count;
    else if (helog.mid === 'aff3a')
        dataObj[source]['aff3a'] = dataObj[source]['aff3a'] + helog.count;
    else if (helog.mid === 'gdn')
        dataObj[source]['gdn'] = dataObj[source]['gdn'] + helog.count;
    else if (helog.mid === 'gdn2')
        dataObj[source]['gdn2'] = dataObj[source]['gdn2'] + helog.count;
    else if (helog.mid === 'goonj')
        dataObj[source]['goonj'] = dataObj[source]['goonj'] + helog.count;

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
function cloneSourceWiseObj() {
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

function setDate(date, m, s, mi){
    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}
function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    computeLogsReports: computeLogsReports,
    computeLogsUniqueSuccessReports: computeLogsUniqueSuccessReports,
};
const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');

const logsRepo = container.resolve('logsRepo');
const  _ = require('lodash');

computeHelogsReports = async(req, res) => {
    console.log('computeHelogsReports');

    let fromDate, toDate, day, month, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    day = req.day ? req.day : 21;
    day = day > 9 ? day : '0'+Number(day);
    req.day = day;

    month = req.month ? req.month : 4;
    month = month > 9 ? month : '0'+Number(month);
    req.month = month;

    console.log('day : ', day, req.day);
    console.log('month : ', month, req.month);

    fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
    toDate  = _.clone(fromDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    console.log('computeHelogsReports: ', fromDate, toDate);
    logsRepo.getHelogsByDateRange(req, fromDate, toDate).then( async function(helogsData) {
        console.log('helogsData: ', helogsData);

        if (helogsData.length > 0){
            finalList = computeHelogsData(helogsData);

            console.log('finalList.length : ', finalList);
                insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeHelogsReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeHelogsReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeHelogsReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeHelogsReports(req, res);
        }
    });
};

function computeHelogsData(helogsRawData) {

    let rawData, helog, helogsObj, sourceObj, helogsWise = [], sourceWise = [];
    for (let i=0; i < helogsRawData.length; i++) {

        rawData = helogsRawData[i];
        sourceObj = _.clone(cloneSourceWiseObj());
        helogsObj = _.clone(cloneHelogsObj());

        for (let j = 0; j < rawData.helogs.length; j++) {
            helog = rawData.helogs[j];

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

            //collect data => Affiliate mid wise, get its count
            //1, 1569, aff3a, aff3, goonj, gdn, gdn2
            if (helog.mid === '1')
                helogsObj['1'] = helogsObj['1'] + 1;
            else if (helog.mid === '1569')
                helogsObj['1569'] = helogsObj['1569'] + 1;
            else if (helog.mid === 'aff3a')
                helogsObj['aff3a'] = helogsObj['aff3a'] + 1;
            else if (helog.mid === 'aff3')
                helogsObj['aff3'] = helogsObj['aff3'] + 1;
            else if (helog.mid === 'goonj')
                helogsObj['goonj'] = helogsObj['goonj'] + 1;
            else if (helog.mid === 'gdn')
                helogsObj['gdn'] = helogsObj['gdn'] + 1;
            else if (helog.mid === 'gdn2')
                helogsObj['gdn2'] = helogsObj['gdn2'] + 1;

        }

        helogsObj.added_dtm = rawData.added_dtm;
        sourceObj.added_dtm = rawData.added_dtm;
        helogsObj.added_dtm_hours = setDate(new Date(rawData.added_dtm), null, 0, 0, 0);
        sourceObj.added_dtm_hours = setDate(new Date(rawData.added_dtm), null, 0, 0, 0);

        sourceWise.push(sourceObj);
        helogsWise.push(helogsObj);
    }

    //sourceWise, statusWise, packageWise, sourceWise
    return {helogsWise: helogsWise, sourceWise: sourceWise};
}

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('data helogs: ', data);
        if (result.length > 0){
            result = result[0];
            result.helogs = data;
            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({helogs: data, date: dateString});
    });
}

function sourceWiseMidsCount(logs, source, dataObj) {
    console.log('source: ', source);

    if (logs.mid === '1')
        dataObj[source]['1'] = dataObj[source]['1'] + logs.count;
    else if (logs.mid === '1569')
        dataObj[source]['1569'] = dataObj[source]['1569'] + logs.count;
    else if (logs.mid === 'aff3')
        dataObj[source]['aff3'] = dataObj[source]['aff3'] + logs.count;
    else if (logs.mid === 'aff3a')
        dataObj[source]['aff3a'] = dataObj[source]['aff3a'] + logs.count;
    else if (logs.mid === 'gdn')
        dataObj[source]['gdn'] = dataObj[source]['gdn'] + logs.count;
    else if (logs.mid === 'gdn2')
        dataObj[source]['gdn2'] = dataObj[source]['gdn2'] + logs.count;
    else if (logs.mid === 'goonj')
        dataObj[source]['goonj'] = dataObj[source]['goonj'] + logs.count;

    console.log('dataObj: ', dataObj);

    return dataObj;
}

function cloneHelogsObj() {
    return {
        '1': 0,
        '1569': 0,
        aff3: 0,
        aff3a: 0,
        gdn: 0,
        gdn2: 0,
        goonj: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneSourceWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    return {
        app: _.clone(mids),
        web: _.clone(mids),
        gdn2: _.clone(mids),
        HE: _.clone(mids),
        he: _.clone(mids),
        affiliate: _.clone(mids),
        added_dtm: '',
        added_dtm_hours: ''
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
    computeHelogsReports: computeHelogsReports,
};
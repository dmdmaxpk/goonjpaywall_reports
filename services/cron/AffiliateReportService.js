const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');

const subscriptionRepo = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeAffiliateReports = async(req, res) => {
    console.log('computeAffiliateReports: ');

    let fromDate, toDate, day, month, computedData = [];
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

    console.log('computeAffiliateReports: ', fromDate, toDate);
    subscriptionRepo.getAffiliateDataDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscription: ', subscriptions);

        if (subscriptions.length > 0){
            computedData = computeAffiliateData(subscriptions);
            console.log('computedData : ', computedData);

            //affiliateWise, statusWise, packageWise, sourceWise
            insertNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getUsersByDateRange -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeAffiliateReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getUsersByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeAffiliateReports(req, res);
        }
    });
};

function computeAffiliateData(subscriptionsRawData) {

    let rawData, statusWiseObj, packageWiseObj, sourceWiseObj, affiliateObj, history, billing_dtm, result,
        affiliateWise = [], statusWise = [], packageWise = [], sourceWise = [];
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        affiliateObj = _.clone(cloneAffilateObj());
        statusWiseObj = _.clone(cloneStatusWiseObj());
        packageWiseObj = _.clone(clonePackageWiseObj());
        sourceWiseObj = _.clone(cloneSourceWiseObj());

        billing_dtm = setDate(new Date(rawData.billing_dtm), null, 0, 0, 0).getTime();
        for (let j = 0; j < rawData.history.length; j++) {
            history = rawData.history[j];

            //collect data => billing_status to package - then package to affiliate_type, get mids count
            if (history.status === 'Success') {
                if (history.package_id === 'QDfC') {
                    if (history.affiliate === "HE")
                        affiliateObj = _.clone(affliateWiseMidsCount(history, history.package_id, history.affiliate, affiliateObj));
                    else if (history.affiliate === "affiliate_web")
                        affiliateObj = _.clone(affliateWiseMidsCount(history, history.package_id, history.affiliate, affiliateObj));
                }
                else if (history.package_id === 'QDfG') {
                    if (history.affiliate === "HE")
                        affiliateObj = _.clone(affliateWiseMidsCount(history, history.package_id, history.affiliate, affiliateObj));
                    else if (history.affiliate === "affiliate_web")
                        affiliateObj = _.clone(affliateWiseMidsCount(history, history.package_id, history.affiliate, affiliateObj));
                }
            }

            //collect data => billing_status wise, get Mids count
            if (history.status === 'Success')
                statusWiseObj = _.clone(wiseMidsCount(history, 'success', statusWiseObj));
            else if (history.status === 'trial')
                statusWiseObj = _.clone(wiseMidsCount(history, 'trial', statusWiseObj));
            else if (history.status === 'Affiliate callback sent')
                statusWiseObj = _.clone(wiseMidsCount(history, 'callback_sent', statusWiseObj));

            //collect data => package wise, get Mids count
            if (history.package_id === 'QDfC')
                packageWiseObj = _.clone(wiseMidsCount(history, 'QDfC', packageWiseObj));
            else if (history.package_id === 'QDfG')
                packageWiseObj = _.clone(wiseMidsCount(history, 'QDfG', packageWiseObj));

            //collect data => source wise, get Mids count
            if (history.affiliate === 'HE')
                sourceWiseObj = _.clone(wiseMidsCount(history, 'HE', sourceWiseObj));
            else if (history.affiliate === 'affiliate_web')
                sourceWiseObj = _.clone(wiseMidsCount(history, 'affiliate_web', sourceWiseObj));

        }

        affiliateObj.added_dtm = history.added_dtm;
        statusWiseObj.added_dtm = history.added_dtm;
        packageWiseObj.added_dtm = history.added_dtm;
        sourceWiseObj.added_dtm = history.added_dtm;
        affiliateObj.added_dtm_hours = setDate(new Date(history.added_dtm), null, 0, 0, 0);
        statusWiseObj.added_dtm_hours = setDate(new Date(history.added_dtm), null, 0, 0, 0);
        packageWiseObj.added_dtm_hours = setDate(new Date(history.added_dtm), null, 0, 0, 0);
        sourceWiseObj.added_dtm_hours = setDate(new Date(history.added_dtm), null, 0, 0, 0);

        affiliateWise.push(affiliateObj);
        statusWise.push(statusWiseObj);
        packageWise.push(packageWiseObj);
        sourceWise.push(sourceWiseObj);
    }

    //affiliateWise, statusWise, packageWise, sourceWise
    return {affiliateWise: affiliateWise, statusWise: statusWise, packageWise: packageWise, sourceWise: sourceWise};
}

function insertNewRecord(affiliateWise, statusWise, packageWise, sourceWise, dateString) {
    //affiliateWise, statusWise, packageWise, sourceWise
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    console.log('=>=>=>=>=>=>=> affiliateWise', affiliateWise);
    console.log('=>=>=>=>=>=>=> statusWise', statusWise);
    console.log('=>=>=>=>=>=>=> packageWise', packageWise);
    console.log('=>=>=>=>=>=>=> sourceWise', sourceWise);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscriptions: ', result);
        if (result.length > 0) {
            result = result[0];
            result.affiliateWise = affiliateWise;
            result.statusWise = statusWise;
            result.packageWise = packageWise;
            result.sourceWise = sourceWise;

            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({
                affiliateWise: affiliateWise,
                statusWise: statusWise,
                packageWise: packageWise,
                sourceWise: sourceWise,
                date: dateString
            });
    });
}

function affliateWiseMidsCount(history, package_id, affiliate, dataObj) {
    if (history.affiliate_mid === '1')
        dataObj['status'][package_id][affiliate]['1'] = dataObj['status'][package_id][affiliate]['1'] + history.count;
    else if (history.affiliate_mid === '1569')
        dataObj['status'][package_id][affiliate]['1569'] = dataObj['status'][package_id][affiliate]['1569'] + history.count;
    else if (history.affiliate_mid === 'aff3')
        dataObj['status'][package_id][affiliate]['aff3'] = dataObj['status'][package_id][affiliate]['aff3'] + history.count;
    else if (history.affiliate_mid === 'aff3a')
        dataObj['status'][package_id][affiliate]['aff3a'] = dataObj['status'][package_id][affiliate]['aff3a'] + history.count;
    else if (history.affiliate_mid === 'gdn')
        dataObj['status'][package_id][affiliate]['gdn'] = dataObj['status'][package_id][affiliate]['gdn'] + history.count;
    else if (history.affiliate_mid === 'gdn2')
        dataObj['status'][package_id][affiliate]['gdn2'] = dataObj['status'][package_id][affiliate]['gdn2'] + history.count;
    else if (history.affiliate_mid === 'goonj')
        dataObj['status'][package_id][affiliate]['goonj'] = dataObj['status'][package_id][affiliate]['goonj'] + history.count;

    return dataObj;
}
function wiseMidsCount(history, wise, dataObj) {
    console.log('wiseMidsCount::::::::::::: ');
    console.log('wise: ', wise);
    console.log('dataObj: ', dataObj);
    if (history.affiliate_mid === '1')
        dataObj[wise]['1'] = dataObj[wise]['1'] + history.count;
    else if (history.affiliate_mid === '1569')
        dataObj[wise]['1569'] = dataObj[wise]['1569'] + history.count;
    else if (history.affiliate_mid === 'aff3')
        dataObj[wise]['aff3'] = dataObj[wise]['aff3'] + history.count;
    else if (history.affiliate_mid === 'aff3a')
        dataObj[wise]['aff3a'] = dataObj[wise]['aff3a'] + history.count;
    else if (history.affiliate_mid === 'gdn')
        dataObj[wise]['gdn'] = dataObj[wise]['gdn'] + history.count;
    else if (history.affiliate_mid === 'gdn2')
        dataObj[wise]['gdn2'] = dataObj[wise]['gdn2'] + history.count;
    else if (history.affiliate_mid === 'goonj')
        dataObj[wise]['goonj'] = dataObj[wise]['goonj'] + history.count;

    return dataObj;
}

function cloneAffilateObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        status: {
            QDfC: {
                HE: mids,
                affiliate_web: mids
            },
            QDfG: {
                HE: mids,
                affiliate_web: mids
            }
        },
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneStatusWiseObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        success: mids,
        trial: mids,
        callback_sent: mids,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function clonePackageWiseObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        QDfC: mids,
        QDfG: mids,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneSourceWiseObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        HE: mids,
        affiliate_web: mids,
        added_dtm: '',
        added_dtm_hours: ''
    }
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
    computeAffiliateReports: computeAffiliateReports,
};
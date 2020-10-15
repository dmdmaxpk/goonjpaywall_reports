const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../helper/helper');
const  _ = require('lodash');


computeAffiliateReports = async(req, res) => {
    console.log('computeAffiliateReports: ');
    let fromDate, toDate, day, month, computedData = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 19, 6);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeAffiliateReports: ', fromDate, toDate);
    subscriptionRepo.getAffiliateDataDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscription: ', subscriptions);

        if (subscriptions.length > 0){
            computedData = computeAffiliateData(subscriptions);
            console.log('computedData : ', computedData);

            //affiliateWise, statusWise, packageWise, sourceWise
            insertNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('getUsersByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeAffiliateReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeAffiliateReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getUsersByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeAffiliateReports(req, res);
        }
    });
};

function computeAffiliateData(subscriptionsRawData) {

    let rawData, statusWiseObj, packageWiseObj, sourceWiseObj, affiliateObj, history,
        affiliateWise = [], statusWise = [], packageWise = [], sourceWise = [];
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        affiliateObj = _.clone(cloneAffiliateWiseObj());
        statusWiseObj = _.clone(cloneStatusWiseObj());
        packageWiseObj = _.clone(clonePackageWiseObj());
        sourceWiseObj = _.clone(cloneSourceWiseObj());

        for (let j = 0; j < rawData.history.length; j++) {
            history = rawData.history[j];

            //collect data => billing_status to package - then package to affiliate_type, then get mids count
            if (history.package_id === 'QDfC') {
                if (history.affiliate === "HE")
                    affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                else if (history.affiliate === "affiliate_web")
                    affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
            }
            else if (history.package_id === 'QDfG') {
                if (history.affiliate === "HE")
                    affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                else if (history.affiliate === "affiliate_web")
                    affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
            }

            //collect data => billing_status wise, get Mids count
            //Success, trial, Affiliate callback sent
            if (history.status === 'Success')
                statusWiseObj = wiseMidsCount(history, 'success', statusWiseObj);
            else if (history.status === 'trial')
                statusWiseObj = wiseMidsCount(history, 'trial', statusWiseObj);
            else if (history.status === 'Affiliate callback sent')
                statusWiseObj = wiseMidsCount(history, 'callback_sent', statusWiseObj);

            //collect data => package wise, get Mids count
            if (history.package_id === 'QDfC')
                packageWiseObj = wiseMidsCount(history, 'QDfC', packageWiseObj);
            else if (history.package_id === 'QDfG')
                packageWiseObj = wiseMidsCount(history, 'QDfG', packageWiseObj);

            //collect data => source wise, get Mids count
            if (history.affiliate === 'HE')
                sourceWiseObj = wiseMidsCount(history, 'HE', sourceWiseObj);
            else if (history.affiliate === 'affiliate_web')
                sourceWiseObj = wiseMidsCount(history, 'affiliate_web', sourceWiseObj);

        }

        affiliateObj.billing_dtm = rawData.billing_dtm;
        statusWiseObj.billing_dtm = rawData.billing_dtm;
        packageWiseObj.billing_dtm = rawData.billing_dtm;
        sourceWiseObj.billing_dtm = rawData.billing_dtm;
        affiliateObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        statusWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        packageWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        sourceWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);

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
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
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

function affliateWiseMidsCount(history, billing_status, package_id, affiliate, dataObj) {

    let status;
    if (billing_status === 'Success')
        status = 'success';
    else if (billing_status === 'trial')
        status = 'trial';
    else if (billing_status === 'Affiliate callback sent')
        status = 'callback_sent';

    if (history.affiliate_mid === '1')
        dataObj[status][package_id][affiliate]['1'] = dataObj[status][package_id][affiliate]['1'] + history.count;
    else if (history.affiliate_mid === '1569')
        dataObj[status][package_id][affiliate]['1569'] = dataObj[status][package_id][affiliate]['1569'] + history.count;
    else if (history.affiliate_mid === 'aff3')
        dataObj[status][package_id][affiliate]['aff3'] = dataObj[status][package_id][affiliate]['aff3'] + history.count;
    else if (history.affiliate_mid === 'aff3a')
        dataObj[status][package_id][affiliate]['aff3a'] = dataObj[status][package_id][affiliate]['aff3a'] + history.count;
    else if (history.affiliate_mid === 'gdn')
        dataObj[status][package_id][affiliate]['gdn'] = dataObj[status][package_id][affiliate]['gdn'] + history.count;
    else if (history.affiliate_mid === 'gdn2')
        dataObj[status][package_id][affiliate]['gdn2'] = dataObj[status][package_id][affiliate]['gdn2'] + history.count;
    else if (history.affiliate_mid === 'goonj')
        dataObj[status][package_id][affiliate]['goonj'] = dataObj[status][package_id][affiliate]['goonj'] + history.count;

    return dataObj;
}
function wiseMidsCount(history, wise, dataObj) {
    console.log('wise: ', wise);

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

    console.log('dataObj: ', dataObj);

    return dataObj;
}

function cloneAffiliateObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    return {
        trial: _.clone(mids),
        QDfC: _.clone(mids),
        QDfG: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneAffiliateWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    let affiliate = {
        QDfC: { HE: _.clone(mids), affiliate_web: _.clone(mids) },
        QDfG: { HE: _.clone(mids), affiliate_web: _.clone(mids) }
    };
    return {
        success: _.clone(affiliate),
        trial: _.clone(affiliate),
        callback_sent: _.clone(affiliate),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneStatusWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    return {
        success: _.clone(mids),
        trial: _.clone(mids),
        callback_sent: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function clonePackageWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    return {
        QDfC: _.clone(mids),
        QDfG: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 };
    return {
        HE: _.clone(mids),
        affiliate_web: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}

module.exports = {
    computeAffiliateReports: computeAffiliateReports,
};
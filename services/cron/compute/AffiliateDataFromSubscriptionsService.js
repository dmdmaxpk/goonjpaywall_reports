const container = require("../../../configurations/container");
const affiliateRepo = require('../../../repos/apis/AffiliateRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeAffiliateReports = async(req, res) => {
    console.log('computeAffiliateReports: ');
    let dateData, fromDate, toDate, day, month, computedData = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 9);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeAffiliateReports: ', fromDate, toDate);
    await subscriptionRepo.getAffiliateDataByDateRange(req, fromDate, toDate).then(async function (subscriptions) {
        console.log('subscription: ', subscriptions.length);

        if (subscriptions.length > 0){
            computedData = computeAffiliateData(subscriptions);
            // console.log('computedData:::::::::::::::::: : ', computedData);

            //affiliateWise, statusWise, packageWise, sourceWise, tpSourcePkgWise, tpSourceTrialWise, tpSourceExpireWise
            await insertNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, computedData.tpSourcePkgWise, computedData.tpSourceTrialWise, computedData.tpSourceExpireWise, fromDate);
        }

        // Get compute data for next time slot
        console.log('req.day: ', req.day);

        req.day = Number(req.day) + 1;
        console.log('getAffiliateDataByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

        if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
            if (Number(month) < Number(helper.getTodayMonthNo()))
                computeAffiliateReports(req, res);
            else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
                computeAffiliateReports(req, res);
        }
        else{
            console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getAffiliateDataByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

            if (Number(req.month) <= Number(helper.getTodayMonthNo()))
                computeAffiliateReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeAffiliateReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};
computeAffiliateMidsFromSubscriptionsReports = async(req, res) => {
    console.log('computeAffiliateMidsFromSubscriptionsReports: ');
    let dateData, fromDate, toDate, day, month, affiliateMidsData = [];

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 1, 9);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('computeAffiliateMidsFromSubscriptionsReports: ', fromDate, toDate);
    await subscriptionRepo.getAffiliateMidFromSubscriptionsByDateRange(req, fromDate, toDate).then(async function (affiliateMids) {
        console.log('affiliateMids: ', affiliateMids.length);

        if (affiliateMids.length > 0){
            affiliateMidsData = computeAffiliateMidsData(affiliateMids);
            console.log('affiliateMidsData : ', affiliateMidsData.length);

            await insertAffiliateMidsNewRecord(affiliateMidsData.affiliateMids, affiliateMidsData.tpSourceWise, fromDate);
        }
    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('getAffiliateMidFromSubscriptionsByDateRange -> day : ', Number(day), Number(req.day), Number(month), Number(helper.getDaysInMonth(month)));

    if (Number(req.day) <= Number(helper.getDaysInMonth(month))){
        if (Number(month) < Number(helper.getTodayMonthNo()))
            computeAffiliateMidsFromSubscriptionsReports(req, res);
        else if (Number(month) === Number(helper.getTodayMonthNo()) && Number(req.day) <= Number(helper.getTodayDayNo()))
            computeAffiliateMidsFromSubscriptionsReports(req, res);
    }
    else{
        console.log('else - 1: ', Number(req.month), Number(helper.getTodayMonthNo()));

        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('getAffiliateMidFromSubscriptionsByDateRange -> month : ', Number(month), Number(req.month), new Date().getMonth());

        if (Number(req.month) <= Number(helper.getTodayMonthNo()))
            computeAffiliateMidsFromSubscriptionsReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeAffiliateMidsFromSubscriptionsReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeAffiliateReports = async(req, res) => {
    console.log('promiseBasedComputeAffiliateReports: ');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, computedData = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('computeAffiliateReports: ', fromDate, toDate);
        await subscriptionRepo.getAffiliateDataByDateRange(req, fromDate, toDate).then(async function (subscriptions) {
            console.log('subscription: ', subscriptions.length);

            if (subscriptions.length > 0){
                computedData = computeAffiliateData(subscriptions);
                //affiliateWise, statusWise, packageWise, sourceWise, tpSourcePkgWise, tpSourceTrialWise, tpSourceExpireWise
                await insertNewRecord(computedData.affiliateWise, computedData.statusWise, computedData.packageWise, computedData.sourceWise, computedData.tpSourcePkgWise, computedData.tpSourceTrialWise, computedData.tpSourceExpireWise, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeAffiliateReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};
promiseBasedComputeAffiliateMidsFromSubscriptionsReports = async(req, res) => {
    console.log('promiseBasedComputeAffiliateMidsFromSubscriptionsReports: ');
    return new Promise(async (resolve, reject) => {
        let dateData, fromDate, toDate, affiliateMidsData = [];

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('computeAffiliateMidsFromSubscriptionsReports: ', fromDate, toDate);
        await subscriptionRepo.getAffiliateMidFromSubscriptionsByDateRange(req, fromDate, toDate).then(async function (affiliateMids) {
            console.log('affiliateMids: ', affiliateMids.length);

            if (affiliateMids.length > 0){
                affiliateMidsData = computeAffiliateMidsData(affiliateMids);
                console.log('affiliateMidsData: ', affiliateMidsData);

                await insertAffiliateMidsNewRecord(affiliateMidsData.affiliateMids, affiliateMidsData.tpSourceWise, fromDate);
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeAffiliateMidsFromSubscriptionsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeAffiliateData(subscriptionsRawData) {

    let rawData, statusWiseObj, packageWiseObj, sourceWiseObj, affiliateObj, tpSourceAndPkgWiseObj, tpSourceAndTrialWiseObj, tpSourceAndExpireWiseObj, history,
        affiliateWise = [], statusWise = [], packageWise = [], sourceWise = [], tpSourcePkgWise = [], tpSourceTrialWise = [], tpSourceExpireWise = [];

    affiliateObj = _.clone(cloneAffiliateWiseObj());
    statusWiseObj = _.clone(cloneStatusWiseObj());
    packageWiseObj = _.clone(clonePackageWiseObj());
    sourceWiseObj = _.clone(cloneSourceWiseObj());
    tpSourceAndPkgWiseObj = _.clone(cloneSourceAndPackageWiseObj());
    tpSourceAndTrialWiseObj = _.clone(cloneSourceAndTrialWiseObj());
    tpSourceAndExpireWiseObj = _.clone(cloneSourceAndExpireWiseObj());
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        if (rawData.history.length > 0){
            for (let j = 0; j < rawData.history.length; j++) {
                history = rawData.history[j];

                //collect data => billing_status to package - then package to affiliate_type, then get mids count
                if (history.status === 'Success' || history.status === 'trial' || history.status === 'Affiliate callback sent') {
                    if (history.package_id === 'QDfC') {
                        if (history.affiliate === "HE")
                            affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                        else if (history.affiliate === "affiliate_web")
                            affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                    } else if (history.package_id === 'QDfG') {
                        if (history.affiliate === "HE")
                            affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                        else if (history.affiliate === "affiliate_web")
                            affiliateObj = affliateWiseMidsCount(history, history.status, history.package_id, history.affiliate, affiliateObj);
                    }
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
                    packageWiseObj = packageWiseMidsCount(history, 'QDfC', packageWiseObj);
                else if (history.package_id === 'QDfG')
                    packageWiseObj = packageWiseMidsCount(history, 'QDfG', packageWiseObj);

                //collect data => source wise, get Mids count
                if (history.affiliate === 'HE')
                    sourceWiseObj = wiseMidsCount(history, 'HE', sourceWiseObj);
                else if (history.affiliate === 'affiliate_web')
                    sourceWiseObj = wiseMidsCount(history, 'affiliate_web', sourceWiseObj);

                //collect data => source wise and package wise Mids count
                if (history.affiliate === 'tp_geo_ent'){
                    if (history.status === 'Success'){
                        if (history.package_id === 'QDfC')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_geo_ent', 'QDfC', tpSourceAndPkgWiseObj);
                        else if (history.package_id === 'QDfG')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_geo_ent', 'QDfG', tpSourceAndPkgWiseObj);
                    }

                    if (history.status === 'trial')
                        tpSourceAndTrialWiseObj = sourceAndTrialWiseMidsCount(history, 'tp_geo_ent', tpSourceAndTrialWiseObj);

                    if (history.status === 'expired' || history.status === 'unsubscribe-request-recieved' || history.status === 'unsubscribe-request-received-and-expired')
                        tpSourceAndExpireWiseObj = sourceAndExpireWiseMidsCount(history, 'tp_geo_ent', tpSourceAndExpireWiseObj);

                }
                else if (history.affiliate === 'tp_discover_pak'){
                    if (history.status === 'Success') {
                        if (history.package_id === 'QDfC')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_discover_pak', 'QDfC', tpSourceAndPkgWiseObj);
                        else if (history.package_id === 'QDfG')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_discover_pak', 'QDfG', tpSourceAndPkgWiseObj);
                    }

                    if (history.status === 'trial')
                        tpSourceAndTrialWiseObj = sourceAndTrialWiseMidsCount(history, 'tp_discover_pak', tpSourceAndTrialWiseObj);

                    if (history.status === 'expired' || history.status === 'unsubscribe-request-recieved' || history.status === 'unsubscribe-request-received-and-expired')
                        tpSourceAndExpireWiseObj = sourceAndExpireWiseMidsCount(history, 'tp_discover_pak', tpSourceAndExpireWiseObj);

                }
                else if (history.affiliate === 'tp_dw_eng'){
                    if (history.status === 'Success') {
                        if (history.package_id === 'QDfC')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_dw_eng', 'QDfC', tpSourceAndPkgWiseObj);
                        else if (history.package_id === 'QDfG')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'tp_dw_eng', 'QDfG', tpSourceAndPkgWiseObj);
                    }

                    if (history.status === 'trial')
                        tpSourceAndTrialWiseObj = sourceAndTrialWiseMidsCount(history, 'tp_dw_eng', tpSourceAndTrialWiseObj);

                    if (history.status === 'expired' || history.status === 'unsubscribe-request-recieved' || history.status === 'unsubscribe-request-received-and-expired')
                        tpSourceAndExpireWiseObj = sourceAndExpireWiseMidsCount(history, 'tp_dw_eng', tpSourceAndExpireWiseObj);

                }
                else if (history.affiliate === 'youtube'){
                    if (history.status === 'Success') {
                        if (history.package_id === 'QDfC')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'youtube', 'QDfC', tpSourceAndPkgWiseObj);
                        else if (history.package_id === 'QDfG')
                            tpSourceAndPkgWiseObj = sourceAndPackageWiseMidsCount(history, 'youtube', 'QDfG', tpSourceAndPkgWiseObj);
                    }

                    if (history.status === 'trial')
                        tpSourceAndTrialWiseObj = sourceAndTrialWiseMidsCount(history, 'youtube', tpSourceAndTrialWiseObj);

                    if (history.status === 'expired' || history.status === 'unsubscribe-request-recieved' || history.status === 'unsubscribe-request-received-and-expired')
                        tpSourceAndExpireWiseObj = sourceAndExpireWiseMidsCount(history, 'youtube', tpSourceAndExpireWiseObj);

                }
            }
        }

        affiliateObj.billing_dtm = rawData.billing_dtm;
        statusWiseObj.billing_dtm = rawData.billing_dtm;
        packageWiseObj.billing_dtm = rawData.billing_dtm;
        sourceWiseObj.billing_dtm = rawData.billing_dtm;
        tpSourceAndPkgWiseObj.billing_dtm = rawData.billing_dtm;
        tpSourceAndTrialWiseObj.billing_dtm = rawData.billing_dtm;
        tpSourceAndExpireWiseObj.billing_dtm = rawData.billing_dtm;

        affiliateObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        statusWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        packageWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        sourceWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        tpSourceAndPkgWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        tpSourceAndTrialWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
        tpSourceAndExpireWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.billing_dtm), null, 0, 0, 0);
    }

    //affiliateWise, statusWise, packageWise, sourceWise, tpSourceWise
    affiliateWise.push(affiliateObj);
    statusWise.push(statusWiseObj);
    packageWise.push(packageWiseObj);
    sourceWise.push(sourceWiseObj);
    tpSourcePkgWise.push(tpSourceAndPkgWiseObj);
    tpSourceTrialWise.push(tpSourceAndTrialWiseObj);
    tpSourceExpireWise.push(tpSourceAndExpireWiseObj);

    return {affiliateWise: affiliateWise, statusWise: statusWise, packageWise: packageWise, sourceWise: sourceWise, tpSourcePkgWise: tpSourcePkgWise, tpSourceTrialWise: tpSourceTrialWise, tpSourceExpireWise: tpSourceExpireWise};
}
function computeAffiliateMidsData(affiliateMidsData) {

    let rawData, innerObj, affiliateMids = [], affiliateMidsObj = { tp_fb_campaign: 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, gdn3: 0, goonj: 0, '1569': 0, '1': 0, 'null': 0 };
    let tpSourceWise = [], tpSourceWiseObj = _.clone(cloneSourceSubscriptionWiseObj());

    for (let i=0; i < affiliateMidsData.length; i++) {
        rawData = affiliateMidsData[i];
        for (let j = 0; j < rawData.affiliate_mids.length; j++) {
            innerObj = rawData.affiliate_mids[j];

            //collect data => billing_status wise, get Mids count
            //Success, trial, Affiliate callback sent
            if(innerObj.affiliate_mid === 'aff3')
                affiliateMidsObj.aff3 = affiliateMidsObj.aff3 + innerObj.count;
            else if(innerObj.affiliate_mid === 'tp_fb_campaign')
                affiliateMidsObj.tp_fb_campaign = affiliateMidsObj.tp_fb_campaign + innerObj.count;
            else if(innerObj.affiliate_mid === 'aff3a')
                affiliateMidsObj.aff3a = affiliateMidsObj.aff3a + innerObj.count;
            else if(innerObj.affiliate_mid === 'gdn')
                affiliateMidsObj.gdn = affiliateMidsObj.gdn + innerObj.count;
            else if(innerObj.affiliate_mid === 'gdn2')
                affiliateMidsObj.gdn2 = affiliateMidsObj.gdn2 + innerObj.count;
            else if(innerObj.affiliate_mid === 'gdn3')
                affiliateMidsObj.gdn3 = affiliateMidsObj.gdn3 + innerObj.count;
            else if(innerObj.affiliate_mid === 'goonj')
                affiliateMidsObj.goonj = affiliateMidsObj.goonj + innerObj.count;
            else if(innerObj.affiliate_mid === '1569')
                affiliateMidsObj['1569'] = affiliateMidsObj['1569'] + innerObj.count;
            else if(innerObj.affiliate_mid === '1')
                affiliateMidsObj['1'] = affiliateMidsObj['1'] + innerObj.count;
            else if(innerObj.affiliate_mid === 'null')
                affiliateMidsObj['null'] = affiliateMidsObj['null'] + innerObj.count;

            //collect data => source wise and package wise Mids count
            if (innerObj.affiliate === 'tp_geo_ent'){
                console.log('affiliate: ', innerObj.affiliate);
                tpSourceWiseObj = sourceAndSubscriptionswiseMidsCount(innerObj, 'tp_geo_ent', tpSourceWiseObj);
                console.log('tpSourceWiseObj: ', tpSourceWiseObj);
            }

            else if (innerObj.affiliate === 'tp_discover_pak'){
                console.log('affiliate: ', innerObj.affiliate);
                tpSourceWiseObj = sourceAndSubscriptionswiseMidsCount(innerObj, 'tp_discover_pak', tpSourceWiseObj);
                console.log('tpSourceWiseObj: ', tpSourceWiseObj);
            }

            else if (innerObj.affiliate === 'tp_dw_eng'){
                console.log('affiliate: ', innerObj.affiliate);
                tpSourceWiseObj = sourceAndSubscriptionswiseMidsCount(innerObj, 'tp_dw_eng', tpSourceWiseObj);
                console.log('tpSourceWiseObj: ', tpSourceWiseObj);
            }

            else if (innerObj.affiliate === 'youtube'){
                console.log('affiliate: ', innerObj.affiliate);
                tpSourceWiseObj = sourceAndSubscriptionswiseMidsCount(innerObj, 'youtube', tpSourceWiseObj);
                console.log('tpSourceWiseObj: ', tpSourceWiseObj);
            }

        }
    }

    affiliateMidsObj.added_dtm = rawData.added_dtm;
    tpSourceWiseObj.added_dtm = rawData.added_dtm;
    affiliateMidsObj.billing_dtm_hours = helper.setDate(new Date(rawData.added_dtm), null, 0, 0, 0);
    tpSourceWiseObj.billing_dtm_hours = helper.setDate(new Date(rawData.added_dtm), null, 0, 0, 0);

    affiliateMids.push(affiliateMidsObj);
    tpSourceWise.push(tpSourceWiseObj);

    return { affiliateMids: affiliateMids, tpSourceWise: tpSourceWise};
}

function insertNewRecord(affiliateWise, statusWise, packageWise, sourceWise, tpSourcePkgWise, tpSourceTrialWise, tpSourceExpireWise, dateString) {
    //affiliateWise, statusWise, packageWise, sourceWise, tpSourceWise, tpSourceTrialWise, tpSourceExpireWise
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            result.affiliateWise = affiliateWise;
            result.statusWise = statusWise;
            result.packageWise = packageWise;
            result.sourceWise = sourceWise;
            result.tpSourcePkgWise = tpSourcePkgWise;
            result.tpSourceTrialWise = tpSourceTrialWise;
            result.tpSourceExpireWise = tpSourceExpireWise;

            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({
                affiliateWise: affiliateWise,
                statusWise: statusWise,
                packageWise: packageWise,
                sourceWise: sourceWise,
                tpSourcePkgWise: tpSourcePkgWise,
                tpSourceTrialWise: tpSourceTrialWise,
                tpSourceExpireWise: tpSourceExpireWise,
                date: dateString
            });
    });
}
function insertAffiliateMidsNewRecord(affiliateMidsData, tpSourceWiseData, dateString) {

    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);

    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            result.subscriptions = affiliateMidsData;
            result.tpSourceWiseSubs = tpSourceWiseData;

            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({
                subscriptions: affiliateMidsData,
                tpSourceWiseSubs: tpSourceWiseData,
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
    else if (history.affiliate_mid === 'gdn3')
        dataObj[status][package_id][affiliate]['gdn3'] = dataObj[status][package_id][affiliate]['gdn3'] + history.count;
    else if (history.affiliate_mid === 'goonj')
        dataObj[status][package_id][affiliate]['goonj'] = dataObj[status][package_id][affiliate]['goonj'] + history.count;

    return dataObj;
}
function packageWiseMidsCount(history, wise, dataObj) {

    if (history.affiliate_mid === '1569' && ( history.status === 'Success' || history.status === 'Affiliate callback sent'))
        dataObj[wise]['1569'] = history.count;
    else if (history.affiliate_mid === 'aff3' && ( history.status === 'Success' || history.status === 'Affiliate callback sent'))
        dataObj[wise]['aff3'] = history.count;
    else if (history.affiliate_mid === 'aff3a' && ( history.status === 'Success' || history.status === 'Affiliate callback sent'))
        dataObj[wise]['aff3a'] = history.count;
    else if (history.affiliate_mid === 'goonj' && ( history.status === 'Success' || history.status === 'Affiliate callback sent'))
        dataObj[wise]['goonj'] = history.count;

    else if (history.affiliate_mid === 'gdn' && ( history.status === 'trial' ))
        dataObj[wise]['gdn'] = dataObj[wise]['gdn'] + history.count;
    else if (history.affiliate_mid === 'gdn2' && ( history.status === 'trial' ))
        dataObj[wise]['gdn2'] = dataObj[wise]['gdn2'] + history.count;
    else if (history.affiliate_mid === 'gdn3' && ( history.status === 'trial' ))
        dataObj[wise]['gdn3'] = dataObj[wise]['gdn3'] + history.count;
    else if (history.affiliate_mid === '1' && (  history.status === 'trial' ))
        dataObj[wise]['1'] = dataObj[wise]['1'] + history.count;

    return dataObj;
}
function wiseMidsCount(history, wise, dataObj) {

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
    else if (history.affiliate_mid === 'gdn3')
        dataObj[wise]['gdn3'] = dataObj[wise]['gdn3'] + history.count;
    else if (history.affiliate_mid === 'goonj')
        dataObj[wise]['goonj'] = dataObj[wise]['goonj'] + history.count;

    return dataObj;
}
function sourceAndPackageWiseMidsCount(history, wise, pkg, dataObj) {
    if (history.affiliate_mid === 'tp_fb_campaign')
        dataObj[wise][pkg]['tp_fb_campaign'] = history.count;

    return dataObj;
}
function sourceAndTrialWiseMidsCount(history, wise, dataObj) {
    if (history.affiliate_mid === 'tp_fb_campaign')
        dataObj[wise]['tp_fb_campaign'] = dataObj[wise]['tp_fb_campaign'] + history.count;

    return dataObj;
}
function sourceAndExpireWiseMidsCount(history, wise, dataObj) {
    if (history.affiliate_mid === 'tp_fb_campaign')
        dataObj[wise]['tp_fb_campaign'] = dataObj[wise]['tp_fb_campaign'] + history.count;

    console.log('sourceAndExpireWiseMidsCount - dataObj: ', dataObj);
    return dataObj;
}
function sourceAndSubscriptionswiseMidsCount(history, wise, dataObj) {
    if (history.affiliate_mid === 'tp_fb_campaign')
        dataObj[wise]['tp_fb_campaign'] = dataObj[wise]['tp_fb_campaign'] + history.count;

    return dataObj;
}

function cloneAffiliateWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, gdn3: 0, goonj: 0 };
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
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, gdn3: 0, goonj: 0 };
    return {
        success: _.clone(mids),
        trial: _.clone(mids),
        callback_sent: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function clonePackageWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, gdn3: 0, goonj: 0   };
    return {
        QDfC: _.clone(mids),
        QDfG: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceWiseObj() {
    let mids = { '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, gdn3: 0, goonj: 0};
    return {
        HE: _.clone(mids),
        affiliate_web: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceAndPackageWiseObj() {
    let mids = { tp_fb_campaign: 0 };
    return {
        tp_geo_ent: {
            QDfC : _.clone(mids),
            QDfG : _.clone(mids),
        },
        tp_discover_pak: {
            QDfC : _.clone(mids),
            QDfG : _.clone(mids),
        },
        tp_dw_eng: {
            QDfC : _.clone(mids),
            QDfG : _.clone(mids),
        },
        youtube: {
            QDfC : _.clone(mids),
            QDfG : _.clone(mids),
        },
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceAndTrialWiseObj() {
    let mids = { tp_fb_campaign: 0 };
    return {
        tp_geo_ent: _.clone(mids),
        tp_discover_pak: _.clone(mids),
        tp_dw_eng: _.clone(mids),
        youtube: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceAndExpireWiseObj() {
    let mids = { tp_fb_campaign: 0 };
    return {
        tp_geo_ent: _.clone(mids),
        tp_discover_pak: _.clone(mids),
        tp_dw_eng: _.clone(mids),
        youtube: _.clone(mids),
        billing_dtm: '',
        billing_dtm_hours: ''
    }
}
function cloneSourceSubscriptionWiseObj() {
    let mids = { tp_fb_campaign: 0 };
    return {
        tp_geo_ent: _.clone(mids),
        tp_discover_pak: _.clone(mids),
        tp_dw_eng: _.clone(mids),
        youtube: _.clone(mids),
        added_dtm: '',
        added_dtm_hours: ''
    }
}

module.exports = {
    computeAffiliateReports: computeAffiliateReports,
    computeAffiliateMidsFromSubscriptionsReports: computeAffiliateMidsFromSubscriptionsReports,

    promiseBasedComputeAffiliateReports: promiseBasedComputeAffiliateReports,
    promiseBasedComputeAffiliateMidsFromSubscriptionsReports: promiseBasedComputeAffiliateMidsFromSubscriptionsReports
};
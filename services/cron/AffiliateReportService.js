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

            insertNewRecord(computedData.subscriptionsStatusWise, computedData.subscriptionsPackageWise, new Date(setDate(fromDate, 0, 0, 0, 0)));
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

    let rawData, packageSubObj, statusSubObj, outerObj, subscription, outer_added_dtm, inner_added_dtm, dateInMili,
        subscriptionsPackageWise = [], subscriptionsStatusWise = [];
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        packageSubObj = _.clone(clonePackageSubObj());
        statusSubObj = _.clone(cloneStatusSubObj());

        for (let j = 0; j < rawData.subscriptions.length; j++) {
            outerObj = rawData.subscriptions[j];
            outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

            if (dateInMili !== outer_added_dtm) {
                for (let k = 0; k < rawData.subscriptions.length; k++) {
                    subscription = rawData.subscriptions[k];
                    inner_added_dtm = setDate(new Date(subscription.added_dtm), null, 0, 0, 0).getTime();

                    if (outer_added_dtm === inner_added_dtm) {
                        dateInMili = inner_added_dtm;

                        //collect data - package wise
                        if (rawData.package_id) {
                            if (rawData.package_id === 'QDfC')
                                packageSubObj = updateMidsCount(subscription, packageSubObj, 'QDfC');
                            else if (rawData.package_id === 'QDfG')
                                packageSubObj = updateMidsCount(subscription, packageSubObj, 'QDfG');
                        }

                        //collect data - billing status wise
                        if (rawData.status) {
                            if (rawData.status === 'trial')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'trial');
                            else if (rawData.status === 'graced')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'graced');
                            else if (rawData.status === 'Success')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'success');
                            else if (rawData.status === 'Affiliate callback sent')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'affiliate_callback_sent');
                            else if (rawData.status === 'graced_and_stream_stopped')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'graced_and_stream_stopped');
                            else if (rawData.status === 'direct-billing-tried-but-failed')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'direct_billing_tried_but_failed');
                            else if (rawData.status === 'package_change_upon_user_request')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'package_change_upon_user_request');
                            else if (rawData.status === 'switch-package-request-tried-but-failed')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'switch_package_request_tried_but_failed');
                            else if (rawData.status === 'unsubscribe-request-received-and-expired')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'unsubscribe_request_received_and_expired');
                            else if (rawData.status === 'subscription-request-received-for-the-same-package')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'subscription_request_received_for_the_same_package');
                            else if (rawData.status === 'subscription-request-received-for-the-same-package-after-unsub')
                                statusSubObj = updateMidsCount(subscription, statusSubObj, 'subscription_request_received_for_the_same_package_after_unsub');
                        }

                        packageSubObj.added_dtm = subscription.added_dtm;
                        packageSubObj.added_dtm_hours = setDate(new Date(subscription.added_dtm), null, 0, 0, 0);

                        statusSubObj.added_dtm = subscription.added_dtm;
                        statusSubObj.added_dtm_hours = setDate(new Date(subscription.added_dtm), null, 0, 0, 0);
                    }
                }
                subscriptionsPackageWise.push(packageSubObj);
                subscriptionsStatusWise.push(statusSubObj);
            }
        }
    }

    return {subscriptionsPackageWise: subscriptionsPackageWise, subscriptionsStatusWise: subscriptionsStatusWise};
}

function insertNewRecord(subscriptionsStatusWise, subscriptionsPackageWise, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    console.log('=>=>=>=>=>=>=> subscriptionsPackageWise', subscriptionsPackageWise);
    console.log('=>=>=>=>=>=>=> subscriptionsStatusWise', subscriptionsStatusWise);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscriptions: ', result);
        if (result.length > 0) {
            result = result[0];
            result.subscriptionsStatusWise = subscriptionsStatusWise;
            result.subscriptionsPackageWise = subscriptionsPackageWise;

            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({subscriptionsPackageWise: subscriptionsStatusWise, subscriptionsStatusWise: subscriptionsPackageWise, date: dateString});
    });
}

function updateMidsCount(subscription, dataObj, mid) {
    if (subscription.affiliate_mid === '1')
        dataObj[mid]['1'] = dataObj[mid]['1'] + 1;
    else if (subscription.affiliate_mid === '1569')
        dataObj[mid]['1569'] = dataObj[mid]['1569'] + 1;
    else if (subscription.affiliate_mid === 'aff3')
        dataObj[mid]['aff3'] = dataObj[mid]['aff3'] + 1;
    else if (subscription.affiliate_mid === 'aff3a')
        dataObj[mid]['aff3a'] = dataObj[mid]['aff3a'] + 1;
    else if (subscription.affiliate_mid === 'gdn')
        dataObj[mid]['gdn'] = dataObj[mid]['gdn'] + 1;
    else if (subscription.affiliate_mid === 'gdn2')
        dataObj[mid]['gdn2'] = dataObj[mid]['gdn2'] + 1;
    else if (subscription.affiliate_mid === 'goonj')
        dataObj[mid]['goonj'] = dataObj[mid]['goonj'] + 1;

    return dataObj;
}

function clonePackageSubObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        QDfC: mids,
        QDfG: mids,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneStatusSubObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        trial: mids,
        graced: mids,
        success: mids,
        affiliate_callback_sent: mids,
        graced_and_stream_stopped: mids,
        direct_billing_tried_but_failed: mids,
        package_change_upon_user_request: mids,
        switch_package_request_tried_but_failed: mids,
        unsubscribe_request_received_and_expired: mids,
        subscription_request_received_for_the_same_package: mids,
        subscription_request_received_for_the_same_package_after_unsub: mids,
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
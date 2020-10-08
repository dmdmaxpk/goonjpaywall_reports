const container = require("../../configurations/container");
const affiliateRepo = require('../../repos/apis/AffiliateRepo');

const subscriptionRepo = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeAffiliateReports = async(req, res) => {
    console.log('computeAffiliateReports: ');

    let fromDate, toDate, day, month, finalList = [];
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
            finalList = computeAffiliateData(subscriptions);

            console.log('finalList.length : ', finalList.length, finalList);
            if (finalList.length > 0)
                insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
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

    let rawData, newObj, outerObj, subscription, outer_added_dtm, inner_added_dtm, dateInMili, finalList = [];
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        newObj = _.clone(cloneObj());

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
                                newObj = updateMidsCount(subscription, newObj, 'package', 'QDfC');
                            else if (rawData.package_id === 'QDfG')
                                newObj = updateMidsCount(subscription, newObj, 'package', 'QDfG');
                        }

                        //collect data - billing status wise
                        if (rawData.status) {
                            if (rawData.status === 'trial')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'trial');
                            else if (rawData.status === 'graced')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'graced');
                            else if (rawData.status === 'Success')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'success');
                            else if (rawData.status === 'Affiliate callback sent')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'affiliate_callback_sent');
                            else if (rawData.status === 'graced_and_stream_stopped')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'graced_and_stream_stopped');
                            else if (rawData.status === 'direct-billing-tried-but-failed')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'direct_billing_tried_but_failed');
                            else if (rawData.status === 'package_change_upon_user_request')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'package_change_upon_user_request');
                            else if (rawData.status === 'switch-package-request-tried-but-failed')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'switch_package_request_tried_but_failed');
                            else if (rawData.status === 'unsubscribe-request-received-and-expired')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'unsubscribe_request_received_and_expired');
                            else if (rawData.status === 'subscription-request-received-for-the-same-package')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'subscription_request_received_for_the_same_package');
                            else if (rawData.status === 'subscription-request-received-for-the-same-package-after-unsub')
                                newObj = updateMidsCount(subscription, newObj, 'status', 'subscription_request_received_for_the_same_package_after_unsub');
                        }

                        newObj.added_dtm = subscription.added_dtm;
                        newObj.added_dtm_hours = setDate(new Date(subscription.added_dtm), null, 0, 0, 0);
                    }
                }
                finalList.push(newObj);
            }
        }
    }

    return finalList;
}

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    affiliateRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscriptions: ', result);
        if (result.length > 0) {
            result = result[0];
            result.affilateReportsData = data;

            affiliateRepo.updateReport(result, result._id);
        }
        else
            affiliateRepo.createReport({affilateReportsData: data, date: dateString});
    });
}

function updateMidsCount(subscription, newObj, type, mid) {
    if (subscription.affiliate_mid === '1')
        newObj[type][mid]['1'] = newObj[type][mid]['1'] + 1;
    else if (subscription.affiliate_mid === '1569')
        newObj[type][mid]['1569'] = newObj[type][mid]['1569'] + 1;
    else if (subscription.affiliate_mid === 'aff3')
        newObj[type][mid]['aff3'] = newObj[type][mid]['aff3'] + 1;
    else if (subscription.affiliate_mid === 'aff3a')
        newObj[type][mid]['aff3a'] = newObj[type][mid]['aff3a'] + 1;
    else if (subscription.affiliate_mid === 'gdn')
        newObj[type][mid]['gdn'] = newObj[type][mid]['gdn'] + 1;
    else if (subscription.affiliate_mid === 'gdn2')
        newObj[type][mid]['gdn2'] = newObj[type][mid]['gdn2'] + 1;
    else if (subscription.affiliate_mid === 'goonj')
        newObj[type][mid]['goonj'] = newObj[type][mid]['goonj'] + 1;

    return newObj;
}

function cloneObj() {
    let mids = _.clone({ '1': 0, '1569': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0 });
    return {
        package: {
            'QDfC': mids,
            'QDfG': mids
        },
        status: {
            'trial': mids,
            'graced': mids,
            'success': mids,
            'affiliate_callback_sent': mids,
            'graced_and_stream_stopped': mids,
            'direct_billing_tried_but_failed': mids,
            'package_change_upon_user_request': mids,
            'switch_package_request_tried_but_failed': mids,
            'unsubscribe_request_received_and_expired': mids,
            'subscription_request_received_for_the_same_package': mids,
            'subscription_request_received_for_the_same_package_after_unsub': mids,
        },
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
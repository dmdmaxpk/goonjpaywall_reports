const container = require("../../configurations/container");
const subscriberReportsRepo = require('../../repos/apis/SubscriberReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');

const  _ = require('lodash');

computeSubscriberTransactionsReports = async(req, res) => {
    console.log('computeSubscriberTransactionsReports: ');

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

    console.log('computeSubscriberTransactionsReports: ', fromDate, toDate);
    billingHistoryRepo.getSubscriberTransactionsByDateRange(req, fromDate, toDate).then(function (transactions) {
        console.log('transactions: ', transactions);

        if (transactions.length > 0){
            finalList = computeTransactionsData(transactions);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0){
                insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
                return;
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeSubscriberTransactionsReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeSubscriberTransactionsReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeSubscriberTransactionsReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeSubscriberTransactionsReports(req, res);
        }
    });
};

function computeTransactionsData(transactionsRawData) {

    let rawData, newObj, innerObj, finalList = [];
    for (let i=0; i < transactionsRawData.length; i++) {

        rawData = transactionsRawData[i];
        newObj = _.clone(cloneInfoObj());
        newObj.subscriber = rawData.subscriber_id;

        for (let k=0; k < rawData.transactions.length; k++) {
            innerObj = rawData.transactions[k];

            //Source wise transaction
            if(innerObj.source === 'app')
                newObj.source.app = newObj.source.app + 1;
            else if(innerObj.source === 'web')
                newObj.source.web = newObj.source.web + 1;
            else if(innerObj.source === 'gdn2')
                newObj.source.gdn2 = newObj.source.gdn2 + 1;
            else if(innerObj.source === 'HE')
                newObj.source.HE = newObj.source.HE + 1;
            else if(innerObj.source === 'affiliate_web')
                newObj.source.affiliate_web = newObj.source.affiliate_web + 1;

            //Package wise transaction
            if(innerObj.package_id === 'QDfC')
                newObj.package.dailyLive = newObj.package.dailyLive + 1;
            else if(innerObj.package_id === 'QDfG')
                newObj.package.weeklyLive = newObj.package.weeklyLive + 1;
            else if(innerObj.package_id === 'QDfH')
                newObj.package.dailyComedy = newObj.package.dailyComedy + 1;
            else if(innerObj.package_id === 'QDfI')
                newObj.package.weeklyComedy = newObj.package.weeklyComedy + 1;

            //Paywall wise transaction
            if(innerObj.paywall_id === 'ghRtjhT7')
                newObj.paywall.comedy = newObj.paywall.comedy + 1;
            else if(innerObj.paywall_id === 'Dt6Gp70c')
                newObj.paywall.live = newObj.paywall.live + 1;

            //Operator wise transaction
            if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator'))
                newObj.operator.telenor = newObj.operator.telenor + 1;
            else if(innerObj.operator === 'easypaisa')
                newObj.operator.easypaisa = newObj.operator.easypaisa + 1;


            //Price wise transaction details
            if (innerObj.price === 15)
                newObj.price['15'] = newObj.price['15'] + 1;
            else if (innerObj.price === 11.95)
                newObj.price['15'] = newObj.price['11.95'] + 1;
            else if (innerObj.price === 10)
                newObj.price['10'] = newObj.price['10'] + 1;
            else if (innerObj.price === 7)
                newObj.price['7'] = newObj.price['7'] + 1;
            else if (innerObj.price === 5)
                newObj.price['5'] = newObj.price['5'] + 1;
            else if(innerObj.price === 4)
                newObj.price['4'] = newObj.price['4'] + 1;
            else if (innerObj.price === 2)
                newObj.price['2'] = newObj.price['2'] + 1;

            //Status wise transaction
            if(innerObj.billing_status === 'trial')
                newObj.billing_status.trial = newObj.billing_status.trial + 1;
            else if(innerObj.billing_status === 'graced')
                newObj.billing_status.graced = newObj.billing_status.graced + 1;
            else if(innerObj.billing_status === 'expired')
                newObj.billing_status.expired = newObj.billing_status.expired + 1;
            else if(innerObj.billing_status === 'Success')
                newObj.billing_status.success = newObj.billing_status.success + 1;
            else if(innerObj.billing_status === 'Affiliate callback sent')
                newObj.billing_status.affiliate_callback_sent = newObj.billing_status.affiliate_callback_sent + 1;
            else if(innerObj.billing_status === 'graced_and_stream_stopped')
                newObj.billing_status.graced_and_stream_stopped = newObj.billing_status.graced_and_stream_stopped + 1;
            else if(innerObj.billing_status === 'micro-charging-exceeded')
                newObj.billing_status.micro_charging_exceeded = newObj.billing_status.micro_charging_exceeded + 1;
            else if(innerObj.billing_status === 'direct-billing-tried-but-failed')
                newObj.billing_status.direct_billing_tried_but_failed = newObj.billing_status.direct_billing_tried_but_failed + 1;
            else if(innerObj.billing_status === 'package_change_upon_user_request')
                newObj.billing_status.package_change_upon_user_request = newObj.billing_status.package_change_upon_user_request + 1;
            else if(innerObj.billing_status === 'switch-package-request-tried-but-failed')
                newObj.billing_status.switch_package_request_tried_but_failed = newObj.billing_status.switch_package_request_tried_but_failed + 1;
            else if(innerObj.billing_status === 'unsubscribe-request-received-and-expired')
                newObj.billing_status.unsubscribe_request_received_and_expired = newObj.billing_status.unsubscribe_request_received_and_expired + 1;
            else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package')
                newObj.billing_status.subscription_request_received_for_the_same_package = newObj.billing_status.subscription_request_received_for_the_same_package + 1;
            else if(innerObj.billing_status === 'subscription-request-received-for-the-same-package-after-unsub')
                newObj.billing_status.subscription_request_received_for_the_same_package_after_unsub = newObj.billing_status.subscription_request_received_for_the_same_package_after_unsub + 1;


            newObj.added_dtm = innerObj.added_dtm;
            newObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
        }
        finalList.push(newObj);
    }

    return finalList;
}

function insertNewRecord(data, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    subscriberReportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result transaction: ', result);
        if (result.length > 0) {
            result = result[0];
            result.transactions = data;

            subscriberReportsRepo.updateReport(result, result._id);
        }
        else
            subscriberReportsRepo.createReport({transactions: data, date: dateString});
    });
}

function cloneInfoObj() {
    return {
        subscriber: '',
        package: {
            dailyLive: 0,
            weeklyLive: 0,
            dailyComedy: 0,
            weeklyComedy: 0
        },
        paywall: {
            comedy: 0,
            live: 0
        },
        source: {
            app: 0,
            web: 0,
            gdn2: 0,
            HE: 0,
            affiliate_web: 0
        },
        operator: {
            telenor: 0,
            easypaisa: 0
        },
        price: {
            '15': 0,
            '11.95': 0,
            '10': 0,
            '7': 0,
            '5': 0,
            '4': 0,
            '3': 0,
        },
        billing_status: {
            trial: 0,
            graced: 0,
            expired: 0,
            success: 0,
            affiliate_callback_sent: 0,
            micro_charging_exceeded: 0,
            graced_and_stream_stopped: 0,
            direct_billing_tried_but_failed: 0,
            package_change_upon_user_request: 0,
            switch_package_request_tried_but_failed: 0,
            unsubscribe_request_received_and_expired: 0,
            subscription_request_received_for_the_same_package: 0,
            subscription_request_received_for_the_same_package_after_unsub: 0
        },
        added_dtm: '',
        added_dtm_hours: ''
    };
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
    computeSubscriberTransactionsReports: computeSubscriberTransactionsReports,
};
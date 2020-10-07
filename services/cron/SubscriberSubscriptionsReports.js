const container = require("../../configurations/container");
const subscriberReportsRepo = require('../../repos/apis/SubscriberReportsRepo');
const subscriptionRepository = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeSubscriberSubscriptionsReports = async(req, res) => {
    console.log('computeSubscriberSubscriptionsReports: ');

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

    console.log('computeSubscriberSubscriptionsReports: ', fromDate, toDate);
    subscriptionRepository.getSubscriberSubscriptionsByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions);

        if (subscriptions.length > 0){
            finalList = computeSubscriptionsData(subscriptions);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeSubscriberSubscriptionsReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeSubscriberSubscriptionsReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeSubscriberSubscriptionsReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeSubscriberSubscriptionsReports(req, res);
        }
    });
};

function computeSubscriptionsData(subscriptionsRawData) {

    let rawData, newObj, innerObj, finalList = [];
    for (let i=0; i < subscriptionsRawData.length; i++) {

        rawData = subscriptionsRawData[i];
        newObj = _.clone(cloneInfoObj());
        newObj.subscriber = rawData.subscriber_id;

        for (let k=0; k < rawData.subscriptions.length; k++) {
            innerObj = rawData.subscriptions[k];

            //Source wise subscriptions
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

            //Affiliate mid wise subscriptions
            if(innerObj.affiliate_mid){
                if(innerObj.affiliate_mid === 'aff3')
                    newObj.affiliate_mid.aff3 = newObj.affiliate_mid.aff3 + 1;
                else if(innerObj.affiliate_mid === 'aff3a')
                    newObj.affiliate_mid.aff3a = newObj.affiliate_mid.aff3a + 1;
                else if(innerObj.affiliate_mid === 'gdn')
                    newObj.affiliate_mid.gdn = newObj.affiliate_mid.gdn + 1;
                else if(innerObj.affiliate_mid === 'gdn2')
                    newObj.affiliate_mid.gdn2 = newObj.affiliate_mid.gdn2 + 1;
                else if(innerObj.affiliate_mid === 'goonj')
                    newObj.affiliate_mid.goonj = newObj.affiliate_mid.goonj + 1;
                else if(innerObj.affiliate_mid === '1565')
                    newObj.affiliate_mid['1565'] = newObj.affiliate_mid['1565'] + 1;
                else if(innerObj.affiliate_mid === '1')
                    newObj.affiliate_mid['1'] = newObj.affiliate_mid['1'] + 1;
                else if(innerObj.affiliate_mid === 'null')
                    newObj.affiliate_mid['null'] = newObj.affiliate_mid['null'] + 1;
            }

            //Package wise subscriptions
            if(innerObj.subscribed_package_id === 'QDfC')
                newObj.package.dailyLive = newObj.package.dailyLive + 1;
            else if(innerObj.subscribed_package_id === 'QDfG')
                newObj.package.weeklyLive = newObj.package.weeklyLive + 1;
            else if(innerObj.subscribed_package_id === 'QDfH')
                newObj.package.dailyComedy = newObj.package.dailyComedy + 1;
            else if(innerObj.subscribed_package_id === 'QDfI')
                newObj.package.weeklyComedy = newObj.package.weeklyComedy + 1;

            //Paywall wise subscriptions
            if(innerObj.paywall_id === 'ghRtjhT7')
                newObj.paywall.comedy = newObj.paywall.comedy + 1;
            else if(innerObj.paywall_id === 'Dt6Gp70c')
                newObj.paywall.live = newObj.paywall.live + 1;

            //Operator wise subscriptions
            if(innerObj.payment_source === 'telenor' || !innerObj.hasOwnProperty('payment_source'))
                newObj.operator.telenor = newObj.operator.telenor + 1;
            else if(innerObj.payment_source === 'easypaisa')
                newObj.operator.easypaisa = newObj.operator.easypaisa + 1;

            //Status wise subscriptions
            if(innerObj.subscription_status === 'trial')
                newObj.subscription_status.trial = newObj.subscription_status.trial + 1;
            else if(innerObj.subscription_status === 'expired')
                newObj.subscription_status.expired = newObj.subscription_status.expired + 1;
            else if(innerObj.subscription_status === 'graced')
                newObj.subscription_status.graced = newObj.subscription_status.graced + 1;
            else if(innerObj.subscription_status === 'billed')
                newObj.subscription_status.billed = newObj.subscription_status.billed + 1;
            else if(innerObj.subscription_status === 'not_billed')
                newObj.subscription_status.not_billed = newObj.subscription_status.not_billed + 1;

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
        console.log('result subscriptions: ', result);
        if (result.length > 0) {
            result = result[0];
            result.subscriptions = data;

            subscriberReportsRepo.updateReport(result, result._id);
        }
        else
            subscriberReportsRepo.createReport({subscriptions: data, date: dateString});
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
        affiliate_mid: {
            aff3: 0,
            aff3a: 0,
            gdn: 0,
            gdn2: 0,
            goonj: 0,
            '1565': 0,
            '1': 0,
            'null': 0,
        },
        operator: {
            telenor: 0,
            easypaisa: 0
        },
        subscription_status: {
            trial: 0,
            expired: 0,
            graced: 0,
            billed: 0,
            not_billed: 0
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
    computeSubscriberSubscriptionsReports: computeSubscriberSubscriptionsReports,
};
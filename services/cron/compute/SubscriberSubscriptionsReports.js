const container = require("../../../configurations/container");
const subscriberReportsRepo = require('../../../repos/apis/SubscriberReportsRepo');
const reportsRepo = require('../../../repos/apis/ReportsRepo');

const subscriptionRepository = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

let dateData, fromHours, toHours, fromDate, toDate, day, month, finalList = [];
computeSubscriberSubscriptionsReports = async(req, res) => {
    console.log('computeSubscriberSubscriptionsReports: ');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextEightHoursDate(req, 1, 2);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;
    fromHours = dateData.fromHours;
    toHours = dateData.toHours;

    console.log('computeSubscriberSubscriptionsReports: ', fromDate, toDate);
    subscriptionRepository.getSubscriberSubscriptionsByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions.length);

        if (subscriptions.length > 0){
            finalList = computeSubscriptionsData(subscriptions);

            console.log('finalList.length : ', finalList.length);
            if (finalList.length > 0)
                insertNewRecord(finalList, fromHours, new Date(helper.setDate(fromDate, 0, 0, 0, 0)));
        }

        if (Number(req.toHours) < 23) {
            console.log('Number(req.toHours) if: ', Number(req.toHours));

            //increment in hours ('from' to 'to') for next data-chunk
            req.fromHours = Number(req.fromHours) + 8;
            req.toHours = Number(req.toHours) + 8;

            // Compute Data for next data-chuck
            computeSubscriberSubscriptionsReports(req, res);
        }
        else{
            // Get compute data for next time slot
            req.day = Number(req.day) + 1;
            console.log('computeSubscriberSubscriptionsReports -> day : ', day, req.day, helper.getDaysInMonth(month));

            if (req.day <= helper.getDaysInMonth(month)){
                if (month < helper.getTodayMonthNo())
                    computeSubscriberSubscriptionsReports(req, res);
                else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                    computeSubscriberSubscriptionsReports(req, res);
            }
            else{
                req.day = 1;
                req.month = Number(req.month) + 1;
                req.fromHours = 0; req.toHours = 7;

                console.log('computeSubscriberSubscriptionsReports -> month : ', month, req.month, new Date().getMonth());

                if (req.month <= helper.getTodayMonthNo())
                    computeSubscriberSubscriptionsReports(req, res);
            }
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
                else if(innerObj.affiliate_mid === '1569')
                    newObj.affiliate_mid['1569'] = newObj.affiliate_mid['1569'] + 1;
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
            newObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
        }
        finalList.push(newObj);
    }

    return finalList;
}

function insertNewRecord(data, fromHours, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        if (result.length > 0) {
            result = result[0];
            if (fromHours === 00 || fromHours === '00'){
                if (result.subscribers){
                    if (result.subscribers.hasOwnProperty('subscriptions'))
                        result.subscribers.subscriptions = data;
                    else{
                        result.subscribers = {subscriptions: ''};
                        result.subscribers.subscriptions = data;
                    }
                }
                else{
                    result.subscribers = {subscriptions: ''};
                    result.subscribers.subscriptions = data;
                }
            }
            else{
                if (result.subscribers){
                    if (result.subscribers.hasOwnProperty('subscriptions'))
                        result.subscribers.subscriptions.concat(data);
                    else {
                        result.subscribers = {subscriptions: ''};
                        result.subscribers.subscriptions = data;
                    }
                }
                else{
                    result.subscribers = {subscriptions: ''};
                    result.subscribers.subscriptions = data;
                }
            }
            reportsRepo.updateReport(result, result._id);
        }
        else{
            let subscribers = {subscriptions: ''};
            subscribers.subscriptions = data;
            reportsRepo.createReport({subscribers: subscribers, date: dateString});
        }
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
            '1569': 0,
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

module.exports = {
    computeSubscriberSubscriptionsReports: computeSubscriberSubscriptionsReports,
};
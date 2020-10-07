const container = require("../../configurations/container");
const reportsRepo = require('../../repos/apis/ReportsRepo');

const subscriptionRepo = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeSubscriptionReports = async(req, res) => {
    console.log('computeSubscriptionReports');

    let fromDate, toDate, day, month, finalData, finalList = [], subscribersFinalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
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

    console.log('computeSubscriptionReports: ', fromDate, toDate);
    subscriptionRepo.getSubscriptionsByDateRange(req, fromDate, toDate).then(function (subscriptions) {
        console.log('subscriptions: ', subscriptions.length);

        if (subscriptions.length > 0){
            finalData = computeSubscriberData(subscriptions);
            finalList = finalData.finalList;
            subscribersFinalList = finalData.subscribersFinalList;
            console.log('finalList.length : ', finalList.length, finalList);
            console.log('subscribersFinalList.length : ', subscribersFinalList.length, subscribersFinalList);
            if (finalList.length > 0 || subscribersFinalList.length > 0)
                insertNewRecord(finalList, subscribersFinalList,  new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeSubscriptionReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeSubscriptionReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeSubscriptionReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeSubscriptionReports(req, res);
        }
    });
};

function computeSubscriberData(subscriptions) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, subscriberObj, finalList = [], subscribersFinalList = [];
    for (let j=0; j < subscriptions.length; j++) {

        outerObj = subscriptions[j];

        newObj = _.clone(cloneInfoObj());
        subscriberObj = _.clone(cloneSubscribersObj());
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < subscriptions.length; k++) {

                innerObj = subscriptions[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;

                    //Active, inactive subscriptions
                    if (innerObj.active)
                        newObj.active = newObj.active + 1;
                    else
                        newObj.nonActive = newObj.nonActive + 1;

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

                    // Active Subscribers - Subscription wise
                    if (innerObj.subscription_status){
                        if (innerObj.subscription_status === "trial" || innerObj.subscription_status === "graced" || innerObj.subscription_status === "billed")
                            subscriberObj.active = subscriberObj.active + 1;
                        else
                            subscriberObj.nonActive = subscriberObj.nonActive + 1;

                        subscriberObj.added_dtm = outerObj.added_dtm;
                        subscriberObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                    }

                    newObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
            subscribersFinalList.push(subscriberObj);
        }
    }

    return {finalList: finalList, subscribersFinalList: subscribersFinalList};
}

function insertNewRecord(finalList, subscribersFinalList, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, finalList.length, subscribersFinalList.length);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result subscriptions: ', result);
        if (result.length > 0){
            result = result[0];
            result.subscriptions = finalList;

            if (result.subscribers)
                result.subscribers.activeInActive = subscribersFinalList;
            else{
                result.subscribers = {activeInActive: ''};
                result.subscribers.activeInActive = subscribersFinalList;
            }
            console.log('result.subscribers: ', result.subscribers);

            console.log('result: ', result);
            reportsRepo.updateReport(result, result._id);
        }
        else{
            let subscribers = {activeInActive: ''};
            subscribers.activeInActive = subscribersFinalList;
            reportsRepo.createReport({subscriptions: finalList, subscribers: subscribers, date: dateString});
        }
    });
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

function cloneSubscribersObj() {
    return {
        active: 0,
        nonActive: 0,
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneInfoObj() {
    return {
        active : 0,
        nonActive: 0,
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
        added_dtm: '',
        added_dtm_hours: ''
    };
}

module.exports = {
    computeSubscriptionReports: computeSubscriptionReports,
};
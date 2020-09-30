const container = require("../../configurations/container");
const reportsRepo = require('../../repos/ReportsRepo');

const subscriptionRepo = container.resolve('subscriptionRepository');
const  _ = require('lodash');

computeChargeDetailsReports = async(req, res) => {
    console.log('computeChargeDetailsReports');

    let fromDate, toDate, day, month, chargeDetailList = [], transactingSubsList = [];
    reportsRepo.checkLastDocument().then(function (result) {
        console.log('result: ', result.length);

        day = req.day ? req.day : 1;
        day = day > 9 ? day : '0'+Number(day);
        req.day = day;

        month = req.month ? req.month : 9;
        month = month > 9 ? month : '0'+Number(month);
        req.month = month;

        console.log('day : ', day, req.day);
        console.log('month : ', month, req.month);

        fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
        toDate  = _.clone(fromDate);
        toDate.setHours(23);
        toDate.setMinutes(59);
        toDate.setSeconds(59);

        console.log('computeChargeDetailsReports: ', fromDate, toDate);
        subscriptionRepo.getChargeDetailsByDateRange(req, fromDate, toDate).then(function (chargeDetails) {
            console.log('chargeDetails: ', chargeDetails.length);

            if (chargeDetails.length > 0){
                finalData = computeChargeDetailData(chargeDetails);
                transactingSubsList = finalData.transactingSubsList;
                chargeDetailList = finalData.chargeDetailList;

                console.log('chargeDetailList.length : ', chargeDetailList.length, chargeDetailList);
                console.log('transactingSubsList.length : ', transactingSubsList.length, transactingSubsList);

                insertNewRecord(transactingSubsList, chargeDetailList, new Date(setDate(fromDate, 0, 0, 0, 0)));

                req.day = Number(req.day) + 1;
                console.log('getChargeDetailsByDateRange -> day : ', day, req.day, getDaysInMonth(month));

                if (req.day <= getDaysInMonth(month))
                    computeChargeDetailsReports(req, res);
                else{
                    req.month = Number(req.month) + 1;
                    console.log('getChargeDetailsByDateRange -> month : ', month, req.month, new Date().getMonth());

                    if (req.month <= new Date().getMonth())
                        computeChargeDetailsReports(req, res);
                }
            }
        });
    });
};

function computeChargeDetailData(chargeDetails) {

    let dateInMili, outer_added_dtm, inner_added_dtm, chargeDetailObj, transactingSubsriberObj, outerObj, innerObj, price,
        micro_charge, transactingSubsList = [], chargeDetailList = [];
    for (let j=0; j < chargeDetails.length; j++) {

        outerObj = chargeDetails[j];

        //app, web, HE, sms, gdn2, CP, null, affiliate_web, system_after_grace_end
        chargeDetailObj = _.clone(cloneChargeDetailObj());
        transactionObj = _.clone(cloneTransactionObj());
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < chargeDetails.length; k++) {

                innerObj = chargeDetails[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    price = innerObj.price - (innerObj.discount ? innerObj.discount : 0);
                    micro_charge = innerObj.micro_charge === false ? false : true;
                    dateInMili = inner_added_dtm;

                    //Transactions and Charge details
                    if (innerObj.billing_status === 'Success' || innerObj.billing_status === 'billed'){

                        //Source wise Charge Details
                        if (innerObj.source === 'app'){
                            transactionObj.transactions.source.app = transactionObj.transactions.source.app + 1;
                            transactionObj.subscribers.source.app = transactionObj.subscribers.source.app + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.app.full = chargeDetailObj.source.app.full + price;
                            else
                                chargeDetailObj.source.app.micro = chargeDetailObj.source.app.micro + price;

                            chargeDetailObj.source.app.total = chargeDetailObj.source.app.total + price;
                        }
                        else if (innerObj.source === 'web'){
                            transactionObj.transactions.source.web = transactionObj.transactions.source.web + 1;
                            transactionObj.subscribers.source.web = transactionObj.subscribers.source.web + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.web.full = chargeDetailObj.source.web.full + price;
                            else
                                chargeDetailObj.source.web.micro = chargeDetailObj.source.web.micro + price;

                            chargeDetailObj.source.web.total = chargeDetailObj.source.web.total + price;
                        }
                        else if (innerObj.source === 'HE'){
                            transactionObj.transactions.source.HE = transactionObj.transactions.source.HE + 1;
                            transactionObj.subscribers.source.HE = transactionObj.subscribers.source.HE + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.HE.full = chargeDetailObj.source.HE.full + price;
                            else
                                chargeDetailObj.source.HE.micro = chargeDetailObj.source.HE.micro + price;

                            chargeDetailObj.source.HE.total = chargeDetailObj.source.HE.total + price;
                        }
                        else if (innerObj.source === 'sms'){
                            transactionObj.transactions.source.sms = transactionObj.transactions.source.sms + 1;
                            transactionObj.subscribers.source.sms = transactionObj.subscribers.source.sms + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.sms.full = chargeDetailObj.source.sms.full + price;
                            else
                                chargeDetailObj.source.sms.micro = chargeDetailObj.source.sms.micro + price;

                            chargeDetailObj.source.sms.total = chargeDetailObj.source.sms.total + price;
                        }
                        else if (innerObj.source === 'gdn2'){
                            transactionObj.transactions.source.gdn2 = transactionObj.transactions.source.gdn2 + 1;
                            transactionObj.subscribers.source.gdn2 = transactionObj.subscribers.source.gdn2 + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.gdn2.full = chargeDetailObj.source.gdn2.full + price;
                            else
                                chargeDetailObj.source.gdn2.micro = chargeDetailObj.source.gdn2.micro + price;

                            chargeDetailObj.source.gdn2.total = chargeDetailObj.source.gdn2.total + price;
                        }
                        else if (innerObj.source === 'CP'){
                            transactionObj.transactions.source.CP = transactionObj.transactions.source.CP + 1;
                            transactionObj.subscribers.source.CP = transactionObj.subscribers.source.CP + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.CP.full = chargeDetailObj.source.CP.full + price;
                            else
                                chargeDetailObj.source.CP.micro = chargeDetailObj.source.CP.micro + price;

                            chargeDetailObj.source.CP.total = chargeDetailObj.source.CP.total + price;
                        }
                        else if (innerObj.source === 'null'){
                            transactionObj.transactions.source.null = transactionObj.transactions.source.null + 1;
                            transactionObj.subscribers.source.null = transactionObj.subscribers.source.null + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.null.full = chargeDetailObj.source.null.full + price;
                            else
                                chargeDetailObj.source.null.micro = chargeDetailObj.source.null.micro + price;

                            chargeDetailObj.source.null.total = chargeDetailObj.source.null.total + price;
                        }
                        else if (innerObj.source === 'affiliate_web'){
                            transactionObj.transactions.source.affiliate_web = transactionObj.transactions.source.affiliate_web + 1;
                            transactionObj.subscribers.source.affiliate_web = transactionObj.subscribers.source.affiliate_web + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.affiliate_web.full = chargeDetailObj.source.affiliate_web.full + price;
                            else
                                chargeDetailObj.source.affiliate_web.micro = chargeDetailObj.source.affiliate_web.micro + price;

                            chargeDetailObj.source.affiliate_web.total = chargeDetailObj.source.affiliate_web.total + price;
                        }
                        else if (innerObj.source === 'system_after_grace_end'){
                            transactionObj.transactions.source.system_after_grace_end = transactionObj.transactions.source.system_after_grace_end + 1;
                            transactionObj.subscribers.source.system_after_grace_end = transactionObj.subscribers.source.system_after_grace_end + 1;

                            if(!micro_charge)
                                chargeDetailObj.source.system_after_grace_end.full = chargeDetailObj.source.system_after_grace_end.full + price;
                            else
                                chargeDetailObj.source.system_after_grace_end.micro = chargeDetailObj.source.system_after_grace_end.micro + price;

                            chargeDetailObj.source.system_after_grace_end.total = chargeDetailObj.source.system_after_grace_end.total + price;
                        }

                        //Package wise Charge Details
                        if(innerObj.package === 'QDfC'){
                            transactionObj.transactions.package.dailyLive = transactionObj.transactions.package.dailyLive + 1;
                            transactionObj.subscribers.package.dailyLive = transactionObj.subscribers.package.dailyLive + 1;

                            if(!micro_charge)
                                chargeDetailObj.package.dailyLive.full = chargeDetailObj.package.dailyLive.full + price;
                            else
                                chargeDetailObj.package.dailyLive.micro = chargeDetailObj.package.dailyLive.micro + price;

                            chargeDetailObj.package.dailyLive.total = chargeDetailObj.package.dailyLive.total + price;
                        }
                        else if(innerObj.package === 'QDfG'){
                            transactionObj.transactions.package.weeklyLive = transactionObj.transactions.package.weeklyLive + 1;
                            transactionObj.subscribers.package.weeklyLive = transactionObj.subscribers.package.weeklyLive + 1;

                            if(!micro_charge)
                                chargeDetailObj.package.weeklyLive.full = chargeDetailObj.package.weeklyLive.full + price;
                            else
                                chargeDetailObj.package.weeklyLive.micro = chargeDetailObj.package.weeklyLive.micro + price;

                            chargeDetailObj.package.weeklyLive.total = chargeDetailObj.package.weeklyLive.total + price;
                        }
                        else if(innerObj.package === 'QDfH'){
                            transactionObj.transactions.package.dailyComedy = transactionObj.transactions.package.dailyComedy + 1;
                            transactionObj.subscribers.package.dailyComedy = transactionObj.subscribers.package.dailyComedy + 1;

                            if(!micro_charge)
                                chargeDetailObj.package.dailyComedy.full = chargeDetailObj.package.dailyComedy.full + price;
                            else
                                chargeDetailObj.package.dailyComedy.micro = chargeDetailObj.package.dailyComedy.micro + price;

                            chargeDetailObj.package.dailyComedy.total = chargeDetailObj.package.dailyComedy.total + price;
                        }
                        else if(innerObj.package === 'QDfI'){
                            transactionObj.transactions.package.weeklyComedy = transactionObj.transactions.package.weeklyComedy + 1;
                            transactionObj.subscribers.package.weeklyComedy = transactionObj.subscribers.package.weeklyComedy + 1;

                            if(!micro_charge)
                                chargeDetailObj.package.weeklyComedy.full = chargeDetailObj.package.weeklyComedy.full + price;
                            else
                                chargeDetailObj.package.weeklyComedy.micro = chargeDetailObj.package.weeklyComedy.micro + price;

                            chargeDetailObj.package.weeklyComedy.total = chargeDetailObj.package.weeklyComedy.total + price;
                        }

                        //Paywall wise Charge Details
                        if(innerObj.paywall === 'Dt6Gp70c'){
                            transactionObj.transactions.paywall.comedy = transactionObj.transactions.paywall.comedy + 1;
                            transactionObj.subscribers.paywall.comedy = transactionObj.subscribers.paywall.comedy + 1;

                            if(!micro_charge)
                                chargeDetailObj.paywall.comedy.full = chargeDetailObj.paywall.comedy.full + price;
                            else
                                chargeDetailObj.paywall.comedy.micro = chargeDetailObj.paywall.comedy.micro + price;

                            chargeDetailObj.paywall.comedy.total = chargeDetailObj.paywall.comedy.total + price;
                        }
                        else if(innerObj.paywall === 'ghRtjhT7'){
                            transactionObj.transactions.paywall.live = transactionObj.transactions.paywall.live + 1;
                            transactionObj.subscribers.paywall.live = transactionObj.subscribers.paywall.live + 1;

                            if(!micro_charge)
                                chargeDetailObj.paywall.live.full = chargeDetailObj.paywall.live.full + price;
                            else
                                chargeDetailObj.paywall.live.micro = chargeDetailObj.paywall.live.micro + price;

                            chargeDetailObj.paywall.live.total = chargeDetailObj.paywall.live.total + price;
                        }

                        //Operator wise Charge Details
                        if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                            transactionObj.transactions.operator.telenor = transactionObj.transactions.operator.telenor + 1;
                            transactionObj.subscribers.operator.telenor = transactionObj.subscribers.operator.telenor + 1;

                            if(!micro_charge)
                                chargeDetailObj.operator.telenor.full = chargeDetailObj.operator.telenor.full + price;
                            else
                                chargeDetailObj.operator.telenor.micro = chargeDetailObj.operator.telenor.micro + price;

                            chargeDetailObj.operator.telenor.total = chargeDetailObj.operator.telenor.total + price;
                        }
                        else if(innerObj.operator === 'easypaisa'){
                            transactionObj.transactions.operator.easypaisa = transactionObj.transactions.operator.easypaisa + 1;
                            transactionObj.subscribers.operator.easypaisa = transactionObj.subscribers.operator.easypaisa + 1;

                            if(!micro_charge)
                                chargeDetailObj.operator.easypaisa.full = chargeDetailObj.operator.easypaisa.full + price;
                            else
                                chargeDetailObj.operator.easypaisa.micro = chargeDetailObj.operator.easypaisa.micro + price;

                            chargeDetailObj.operator.easypaisa.total = chargeDetailObj.operator.easypaisa.total + price;
                        }


                        //Price wise transactions
                        if (innerObj.price === '15')
                            transactionObj.transactions.price['15'] = transactionObj.transactions.price['15'] + 1;
                        else if (innerObj.price === '11.95')
                            transactionObj.transactions.price['15'] = transactionObj.transactions.price['11.95'] + 1;
                        else if (innerObj.price === '10')
                            transactionObj.transactions.price['10'] = transactionObj.transactions.price['10'] + 1;
                        else if (innerObj.price === '7')
                            transactionObj.transactions.price['7'] = transactionObj.transactions.price['7'] + 1;
                        else if (innerObj.price === '5')
                            transactionObj.transactions.price['5'] = transactionObj.transactions.price['5'] + 1;
                        else if(innerObj.price === '4')
                            transactionObj.transactions.price['4'] = transactionObj.transactions.price['4'] + 1;
                        else if (innerObj.price === '2')
                            transactionObj.transactions.price['2'] = transactionObj.transactions.price['2'] + 1;

                        //Success rate
                        transactionObj.transactions.successRate = transactionObj.transactions.successRate + 1;
                        transactionObj.transactions.netTotal = transactionObj.transactions.netTotal + 1;

                        if(!micro_charge)
                            chargeDetailObj.chargeType.full = chargeDetailObj.chargeType.full + price;
                        else
                            chargeDetailObj.chargeType.micro = chargeDetailObj.chargeType.micro + price;

                        // Add Timestemps
                        transactionObj.added_dtm = outerObj.added_dtm;
                        transactionObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);

                        chargeDetailObj.added_dtm = outerObj.added_dtm;
                        chargeDetailObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                    }
                    else if (innerObj.billing_status === 'graced'){

                        //Failure Rate
                        transactionObj.transactions.netTotal = transactionObj.transactions.netTotal + 1;
                        transactionObj.transactions.failureRate = transactionObj.transactions.failureRate + 1;

                        // Add Timestemps
                        transactionObj.added_dtm = outerObj.added_dtm;
                        transactionObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);

                        chargeDetailObj.added_dtm = outerObj.added_dtm;
                        chargeDetailObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                    }
                }
            }

            if (transactionObj.transactions.netTotal > 0){
                transactionObj.transactions.successRate = (transactionObj.transactions.successRate / transactionObj.transactions.netTotal) * 100;
                transactionObj.transactions.failureRate = (transactionObj.transactions.failureRate / transactionObj.transactions.netTotal) * 100;
            }
            else{
                transactionObj.transactions.failureRate = 0;
                transactionObj.transactions.successRate = 0;
            }

            transactingSubsList.push(transactionObj);
            chargeDetailList.push(chargeDetailObj);
        }
    }

    return {transactingSubsList: transactingSubsList, chargeDetailList: chargeDetailList};
}

function insertNewRecord(transactingSubsList, chargeDetailList, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('getReportByDateString - result : ', transactingSubsList, chargeDetailList);
        if (result.length > 0) {
            result = result[0];
            result.chargeDetails = chargeDetailList;
            result.transactions = transactingSubsList;

            reportsRepo.updateReport(result, result._id);
        }
        else
            reportsRepo.createReport({transactions: transactingSubsList, chargeDetails: chargeDetailList, date: dateString});
    });
}

function cloneChargeDetailObj() {
    return {
        source: {
            app: { full: 0, micro: 0, total: 0 },
            web: { full: 0, micro: 0, total: 0 },
            HE: { full: 0, micro: 0, total: 0 },
            sms: { full: 0, micro: 0, total: 0 },
            gdn2: { full: 0, micro: 0, total: 0 },
            CP: { full: 0, micro: 0, total: 0 },
            null: { full: 0, micro: 0, total: 0 },
            affiliate_web: { full: 0, micro: 0, total: 0 },
            system_after_grace_end: { full: 0, micro: 0, total: 0 }
        },
        package: {
            dailyLive: { full: 0, micro: 0, total: 0 },
            weeklyLive: { full: 0, micro: 0, total: 0 },
            dailyComedy: { full: 0, micro: 0, total: 0 },
            weeklyComedy: { full: 0, micro: 0, total: 0 }
        },
        operator: {
          telenor: { full: 0, micro: 0, total: 0 },
          easypaisa: { full: 0, micro: 0, total: 0 }
        },
        paywall: {
            comedy: { full: 0, micro: 0, total: 0 },
            live: { full: 0, micro: 0, total: 0 }
        },
        chargeType: {
            full: 0,
            micro: 0
        },
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneTransactionObj() {
    return {
        transactions: {
            source: {
                app: 0,
                web: 0,
                HE: 0,
                sms: 0,
                gdn2: 0,
                CP: 0,
                null: 0,
                affiliate_web: 0,
                system_after_grace_end: 0
            },
            package: {
                dailyLive: 0,
                weeklyLive: 0,
                dailyComedy: 0,
                weeklyComedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            },
            paywall: {
                comedy: 0,
                live: 0
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
            netTotal: 0,
            failureRate: 0,
            successRate: 0
        },
        subscribers: {
            source: {
                app: 0,
                web: 0,
                HE: 0,
                sms: 0,
                gdn2: 0,
                CP: 0,
                null: 0,
                affiliate_web: 0,
                system_after_grace_end: 0
            },
            package: {
                dailyLive: 0,
                weeklyLive: 0,
                dailyComedy: 0,
                weeklyComedy: 0
            },
            operator: {
                telenor: 0,
                easypaisa: 0
            },
            paywall: {
                comedy: 0,
                live: 0
            },
            netTotal: 0
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
    computeChargeDetailsReports: computeChargeDetailsReports,
};
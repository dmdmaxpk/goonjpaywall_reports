const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Revenue Compute Functions
computeRevenuePackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0};
    let dayDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0};
    let weeklyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0};
    let monthlyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        if (billingHistory.revenue.package){
                            innerObj = billingHistory.revenue.package;
                            if (innerObj.liveDaily){
                                dataObj.totalLiveDaily = dataObj.totalLiveDaily + innerObj.liveDaily;
                                dayDataObj.totalLiveDaily = dayDataObj.totalLiveDaily + innerObj.liveDaily;
                                weeklyDataObj.totalLiveDaily = weeklyDataObj.totalLiveDaily + innerObj.liveDaily;
                                monthlyDataObj.totalLiveDaily = monthlyDataObj.totalLiveDaily + innerObj.liveDaily;
                            }
                            if (innerObj.liveWeekly){
                                dataObj.totalLiveWeekly = dataObj.totalLiveWeekly + innerObj.liveWeekly;
                                dayDataObj.totalLiveWeekly = dayDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                weeklyDataObj.totalLiveWeekly = weeklyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                monthlyDataObj.totalLiveWeekly = monthlyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                            }
                            if (innerObj.comedyDaily){
                                dataObj.totalComedyDaily = dataObj.totalComedyDaily + innerObj.comedyDaily;
                                dayDataObj.totalComedyDaily = dayDataObj.totalComedyDaily + innerObj.comedyDaily;
                                weeklyDataObj.totalComedyDaily = weeklyDataObj.totalComedyDaily + innerObj.comedyDaily;
                                monthlyDataObj.totalComedyDaily = monthlyDataObj.totalComedyDaily + innerObj.comedyDaily;
                            }
                            if (innerObj.comedyWeekly){
                                dataObj.totalComedyWeekly = dataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                dayDataObj.totalComedyWeekly = dayDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                weeklyDataObj.totalComedyWeekly = weeklyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                monthlyDataObj.totalComedyWeekly = monthlyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                totalLiveDaily: innerObj.liveDaily, totalLiveWeekly: innerObj.liveWeekly,
                                totalComedyDaily: innerObj.comedyDaily, totalComedyWeekly: innerObj.comedyWeekly,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0});

            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
computeRevenuePaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {live: 0, comedy: 0};
    let dayDataObj = {live: 0, comedy: 0};
    let weeklyDataObj = {live: 0, comedy: 0};
    let monthlyDataObj = {live: 0, comedy: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        if (billingHistory.revenue.paywall){
                            innerObj = billingHistory.revenue.paywall;
                            if (innerObj.live){
                                dataObj.live = dataObj.live + innerObj.live;
                                dayDataObj.live = dayDataObj.live + innerObj.live;
                                weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                                monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                            }
                            if (innerObj.comedy){
                                dataObj.comedy = dataObj.comedy + innerObj.comedy;
                                dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                                weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                                monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.live, comedy: innerObj.comedy,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({live: 0, comedy: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({live: 0, comedy: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({live: 0, comedy: 0});

            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
computeRevenueOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {telenor: 0, easypaisa: 0};
    let dayDataObj = {telenor: 0, easypaisa: 0};
    let weeklyDataObj = {telenor: 0, easypaisa: 0};
    let monthlyDataObj = {telenor: 0, easypaisa: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        if (billingHistory.revenue.operator){
                            innerObj = billingHistory.revenue.operator;
                            if (innerObj.telenor){
                                dataObj.telenor = dataObj.telenor + innerObj.telenor;
                                dayDataObj.telenor = dayDataObj.telenor + innerObj.telenor;
                                weeklyDataObj.telenor = weeklyDataObj.telenor + innerObj.telenor;
                                monthlyDataObj.telenor = monthlyDataObj.telenor + innerObj.telenor;
                            }
                            if (innerObj.easypaisa){
                                dataObj.easypaisa = dataObj.easypaisa + innerObj.easypaisa;
                                dayDataObj.easypaisa = dayDataObj.easypaisa + innerObj.easypaisa;
                                weeklyDataObj.easypaisa = weeklyDataObj.easypaisa + innerObj.easypaisa;
                                monthlyDataObj.easypaisa = monthlyDataObj.easypaisa + innerObj.easypaisa;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.telenor, comedy: innerObj.easypaisa,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({telenor: 0, easypaisa: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({telenor: 0, easypaisa: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({telenor: 0, easypaisa: 0});

            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
computeRevenueBillingStatusWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueBillingStatusWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0};
    let dayDataObj = {trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0};
    let weeklyDataObj = {trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0};
    let monthlyDataObj = {trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0};


    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.billingStatus) {
                        innerObj = billingHistory.billingStatus;
                        if (innerObj.trial){
                            dataObj.trial = dataObj.trial + innerObj.trial;
                            dayDataObj.trial = dayDataObj.trial + innerObj.trial;
                            weeklyDataObj.trial = weeklyDataObj.trial + innerObj.trial;
                            monthlyDataObj.trial = monthlyDataObj.trial + innerObj.trial;
                        }
                        if (innerObj.graced){
                            dataObj.graced = dataObj.graced + innerObj.graced;
                            dayDataObj.graced = dayDataObj.graced + innerObj.graced;
                            weeklyDataObj.graced = weeklyDataObj.graced + innerObj.graced;
                            monthlyDataObj.graced = monthlyDataObj.graced + innerObj.graced;
                        }
                        if (innerObj.expired){
                            dataObj.expired = dataObj.expired + innerObj.expired;
                            dayDataObj.expired = dayDataObj.expired + innerObj.expired;
                            weeklyDataObj.expired = weeklyDataObj.expired + innerObj.expired;
                            monthlyDataObj.expired = monthlyDataObj.expired + innerObj.expired;
                        }
                        if (innerObj.success){
                            dataObj.success = dataObj.success + innerObj.success;
                            dayDataObj.success = dayDataObj.success + innerObj.success;
                            weeklyDataObj.success = weeklyDataObj.success + innerObj.success;
                            monthlyDataObj.success = monthlyDataObj.success + innerObj.success;
                        }
                        if (innerObj.affiliate_callback_sent){
                            dataObj.affiliateCallbackSent = dataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            dayDataObj.affiliateCallbackSent = dayDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            weeklyDataObj.affiliateCallbackSent = weeklyDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            monthlyDataObj.affiliateCallbackSent = monthlyDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                        }
                        if (innerObj.micro_charging_exceeded){
                            dataObj.micro_charging_exceeded = dataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            dayDataObj.micro_charging_exceeded = dayDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            weeklyDataObj.micro_charging_exceeded = weeklyDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            monthlyDataObj.micro_charging_exceeded = monthlyDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                        }
                        if (innerObj.graced_and_stream_stopped){
                            dataObj.gracedAndStreamStopped = dataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            dayDataObj.gracedAndStreamStopped = dayDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            weeklyDataObj.gracedAndStreamStopped = weeklyDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            monthlyDataObj.gracedAndStreamStopped = monthlyDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                        }
                        if (innerObj.direct_billing_tried_but_failed){
                            dataObj.directBillingTriedButFailed = dataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            dayDataObj.directBillingTriedButFailed = dayDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            weeklyDataObj.directBillingTriedButFailed = weeklyDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            monthlyDataObj.directBillingTriedButFailed = monthlyDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                        }
                        if (innerObj.package_change_upon_user_request){
                            dataObj.packageChangeUponUserRequest = dataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            dayDataObj.packageChangeUponUserRequest = dayDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            weeklyDataObj.packageChangeUponUserRequest = weeklyDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            monthlyDataObj.packageChangeUponUserRequest = monthlyDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                        }
                        if (innerObj.unsubscribe_request_received_and_expired){
                            dataObj.switchPackageRequestTriedButFailed = dataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            dayDataObj.switchPackageRequestTriedButFailed = dayDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            weeklyDataObj.switchPackageRequestTriedButFailed = weeklyDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            monthlyDataObj.switchPackageRequestTriedButFailed = monthlyDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                        }
                        if (innerObj.subscription_request_received_for_the_same_package){
                            dataObj.unsubscribeRequestReceivedAndExpired = dataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            dayDataObj.unsubscribeRequestReceivedAndExpired = dayDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            weeklyDataObj.unsubscribeRequestReceivedAndExpired = weeklyDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            monthlyDataObj.unsubscribeRequestReceivedAndExpired = monthlyDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                        }
                        if (innerObj.switch_package_request_tried_but_failed){
                            dataObj.subscriptionRequestReceivedForTheSamePackage = dataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            dayDataObj.subscriptionRequestReceivedForTheSamePackage = dayDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            weeklyDataObj.subscriptionRequestReceivedForTheSamePackage = weeklyDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            monthlyDataObj.subscriptionRequestReceivedForTheSamePackage = monthlyDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                        }
                        if (innerObj.subscription_request_received_for_the_same_package_after_unsub){
                            dataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = dataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            dayDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = dayDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            weeklyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = weeklyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            monthlyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = monthlyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            trial: innerObj.trial,
                            graced: innerObj.graced,
                            expired: innerObj.expired,
                            success: innerObj.success,
                            affiliateCallbackSent: innerObj.affiliate_callback_sent,
                            microChargingExceeded: innerObj.micro_charging_exceeded,
                            gracedAndStreamStopped: innerObj.graced_and_stream_stopped,
                            directBillingTriedButFailed: innerObj.direct_billing_tried_but_failed,
                            packageChangeUponUserRequest: innerObj.package_change_upon_user_request,
                            switchPackageRequestTriedButFailed: innerObj.switch_package_request_tried_but_failed,
                            unsubscribeRequestReceivedAndExpired: innerObj.unsubscribe_request_received_and_expired,
                            subscriptionRequestReceivedForTheSamePackage: innerObj.subscription_request_received_for_the_same_package,
                            subscriptionRequestReceivedForTheSamePackageAfterUnsub: innerObj.subscription_request_received_for_the_same_package_after_unsub,
                            date: billingHistory.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = billingHistory.added_dtm;

                        if (month_from_date === null)
                            month_from_date = billingHistory.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
                        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
                        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
                        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
                        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
                        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
                        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
                    gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
                    switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
                    subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0});
            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // Total Count Data
        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
computeRevenueNetReport = async (rawDataSet, params) =>{
    console.log('computeRevenueNetReport');
};

module.exports = {
    computeRevenuePackageWiseReport: computeRevenuePackageWiseReport,
    computeRevenuePaywallWiseReport: computeRevenuePaywallWiseReport,
    computeRevenueOperatorWiseReport: computeRevenueOperatorWiseReport,
    computeRevenueBillingStatusWiseReport: computeRevenueBillingStatusWiseReport,
    computeRevenueNetReport: computeRevenueNetReport,
};
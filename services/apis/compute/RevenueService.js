const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Revenue Compute Functions
computeRevenuePackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let dayDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let weeklyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let monthlyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};

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
                                dataObj.netTotal = dataObj.netTotal + innerObj.liveDaily;

                                dayDataObj.totalLiveDaily = dayDataObj.totalLiveDaily + innerObj.liveDaily;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.liveDaily;

                                weeklyDataObj.totalLiveDaily = weeklyDataObj.totalLiveDaily + innerObj.liveDaily;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.liveDaily;

                                monthlyDataObj.totalLiveDaily = monthlyDataObj.totalLiveDaily + innerObj.liveDaily;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.liveDaily;
                            }
                            if (innerObj.liveWeekly){
                                dataObj.totalLiveWeekly = dataObj.totalLiveWeekly + innerObj.liveWeekly;
                                dataObj.netTotal = dataObj.netTotal + innerObj.liveWeekly;

                                dayDataObj.totalLiveWeekly = dayDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.liveWeekly;

                                weeklyDataObj.totalLiveWeekly = weeklyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.liveWeekly;

                                monthlyDataObj.totalLiveWeekly = monthlyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.liveWeekly;

                            }
                            if (innerObj.comedyDaily){
                                dataObj.totalComedyDaily = dataObj.totalComedyDaily + innerObj.comedyDaily;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedyDaily;

                                dayDataObj.totalComedyDaily = dayDataObj.totalComedyDaily + innerObj.comedyDaily;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedyDaily;

                                weeklyDataObj.totalComedyDaily = weeklyDataObj.totalComedyDaily + innerObj.comedyDaily;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedyDaily;

                                monthlyDataObj.totalComedyDaily = monthlyDataObj.totalComedyDaily + innerObj.comedyDaily;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedyDaily;
                            }
                            if (innerObj.comedyWeekly){
                                dataObj.totalComedyWeekly = dataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedyWeekly;

                                dayDataObj.totalComedyWeekly = dayDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedyWeekly;

                                weeklyDataObj.totalComedyWeekly = weeklyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedyWeekly;

                                monthlyDataObj.totalComedyWeekly = monthlyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedyWeekly;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                totalLiveDaily: innerObj.liveDaily, totalLiveWeekly: innerObj.liveWeekly,
                                totalComedyDaily: innerObj.comedyDaily, totalComedyWeekly: innerObj.comedyWeekly,
                                netTotal: innerObj.liveDaily + innerObj.liveWeekly + innerObj.comedyDaily + innerObj.comedyWeekly,
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
                    monthlyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});

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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeRevenuePaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {live: 0, comedy: 0, netTotal: 0};
    let dayDataObj = {live: 0, comedy: 0, netTotal: 0};
    let weeklyDataObj = {live: 0, comedy: 0, netTotal: 0};
    let monthlyDataObj = {live: 0, comedy: 0, netTotal: 0};

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
                                dataObj.netTotal = dataObj.netTotal + innerObj.live;

                                dayDataObj.live = dayDataObj.live + innerObj.live;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.live;

                                weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.live;

                                monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.live;
                            }
                            if (innerObj.comedy){
                                dataObj.comedy = dataObj.comedy + innerObj.comedy;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedy;

                                dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedy;

                                weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedy;

                                monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedy;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.live, comedy: innerObj.comedy,
                                netTotal: innerObj.live + innerObj.comedy,
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
                    monthlyDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});

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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeRevenueOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let dayDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let weeklyDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let monthlyDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};

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
                                dataObj.netTotal = dataObj.netTotal + innerObj.telenor;

                                dayDataObj.telenor = dayDataObj.telenor + innerObj.telenor;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.telenor;

                                weeklyDataObj.telenor = weeklyDataObj.telenor + innerObj.telenor;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.telenor;

                                monthlyDataObj.telenor = monthlyDataObj.telenor + innerObj.telenor;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.telenor;
                            }
                            if (innerObj.easypaisa){
                                dataObj.easypaisa = dataObj.easypaisa + innerObj.easypaisa;
                                dataObj.netTotal = dataObj.netTotal + innerObj.easypaisa;

                                dayDataObj.easypaisa = dayDataObj.easypaisa + innerObj.easypaisa;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.easypaisa;

                                weeklyDataObj.easypaisa = weeklyDataObj.easypaisa + innerObj.easypaisa;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.easypaisa;

                                monthlyDataObj.easypaisa = monthlyDataObj.easypaisa + innerObj.easypaisa;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.easypaisa;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.telenor, comedy: innerObj.easypaisa,
                                netTotal: innerObj.telenor + innerObj.easypaisa,
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
                    monthlyDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});

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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeRevenueBillingStatusWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueBillingStatusWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneRevenueBillingStatusWiseObj());
    let dayDataObj = _.clone(cloneRevenueBillingStatusWiseObj());
    let weeklyDataObj = _.clone(cloneRevenueBillingStatusWiseObj());
    let monthlyDataObj = _.clone(cloneRevenueBillingStatusWiseObj());


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
                            dataObj.netTotal = dataObj.netTotal + innerObj.trial;

                            dayDataObj.trial = dayDataObj.trial + innerObj.trial;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.trial;

                            weeklyDataObj.trial = weeklyDataObj.trial + innerObj.trial;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.trial;

                            monthlyDataObj.trial = monthlyDataObj.trial + innerObj.trial;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.trial;
                        }
                        if (innerObj.graced){
                            dataObj.graced = dataObj.graced + innerObj.graced;
                            dataObj.netTotal = dataObj.netTotal + innerObj.graced;

                            dayDataObj.graced = dayDataObj.graced + innerObj.graced;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.graced;

                            weeklyDataObj.graced = weeklyDataObj.graced + innerObj.graced;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.graced;

                            monthlyDataObj.graced = monthlyDataObj.graced + innerObj.graced;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.graced;
                        }
                        if (innerObj.expired){
                            dataObj.expired = dataObj.expired + innerObj.expired;
                            dataObj.netTotal = dataObj.netTotal + innerObj.expired;

                            dayDataObj.expired = dayDataObj.expired + innerObj.expired;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.expired;

                            weeklyDataObj.expired = weeklyDataObj.expired + innerObj.expired;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.expired;

                            monthlyDataObj.expired = monthlyDataObj.expired + innerObj.expired;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.expired;
                        }
                        if (innerObj.success){
                            dataObj.success = dataObj.success + innerObj.success;
                            dataObj.netTotal = dataObj.netTotal + innerObj.success;

                            dayDataObj.success = dayDataObj.success + innerObj.success;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.success;

                            weeklyDataObj.success = weeklyDataObj.success + innerObj.success;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.success;

                            monthlyDataObj.success = monthlyDataObj.success + innerObj.success;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.success;
                        }
                        if (innerObj.affiliate_callback_sent){
                            dataObj.affiliateCallbackSent = dataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            dataObj.netTotal = dataObj.netTotal + innerObj.affiliate_callback_sent;

                            dayDataObj.affiliateCallbackSent = dayDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.affiliate_callback_sent;

                            weeklyDataObj.affiliateCallbackSent = weeklyDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.affiliate_callback_sent;

                            monthlyDataObj.affiliateCallbackSent = monthlyDataObj.affiliateCallbackSent + innerObj.affiliate_callback_sent;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.affiliate_callback_sent;
                        }
                        if (innerObj.micro_charging_exceeded){
                            dataObj.micro_charging_exceeded = dataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            dataObj.netTotal = dataObj.netTotal + innerObj.micro_charging_exceeded;

                            dayDataObj.micro_charging_exceeded = dayDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.micro_charging_exceeded;

                            weeklyDataObj.micro_charging_exceeded = weeklyDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.micro_charging_exceeded;

                            monthlyDataObj.micro_charging_exceeded = monthlyDataObj.micro_charging_exceeded + innerObj.micro_charging_exceeded;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.micro_charging_exceeded;
                        }
                        if (innerObj.graced_and_stream_stopped){
                            dataObj.gracedAndStreamStopped = dataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            dataObj.netTotal = dataObj.netTotal + innerObj.graced_and_stream_stopped;

                            dayDataObj.gracedAndStreamStopped = dayDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.graced_and_stream_stopped;

                            weeklyDataObj.gracedAndStreamStopped = weeklyDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.graced_and_stream_stopped;

                            monthlyDataObj.gracedAndStreamStopped = monthlyDataObj.gracedAndStreamStopped + innerObj.graced_and_stream_stopped;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.graced_and_stream_stopped;
                        }
                        if (innerObj.direct_billing_tried_but_failed){
                            dataObj.directBillingTriedButFailed = dataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            dataObj.netTotal = dataObj.netTotal + innerObj.direct_billing_tried_but_failed;

                            dayDataObj.directBillingTriedButFailed = dayDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.direct_billing_tried_but_failed;

                            weeklyDataObj.directBillingTriedButFailed = weeklyDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.direct_billing_tried_but_failed;

                            monthlyDataObj.directBillingTriedButFailed = monthlyDataObj.directBillingTriedButFailed + innerObj.direct_billing_tried_but_failed;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.direct_billing_tried_but_failed;
                        }
                        if (innerObj.package_change_upon_user_request){
                            dataObj.packageChangeUponUserRequest = dataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            dataObj.netTotal = dataObj.netTotal + innerObj.package_change_upon_user_request;

                            dayDataObj.packageChangeUponUserRequest = dayDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.package_change_upon_user_request;

                            weeklyDataObj.packageChangeUponUserRequest = weeklyDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.package_change_upon_user_request;

                            monthlyDataObj.packageChangeUponUserRequest = monthlyDataObj.packageChangeUponUserRequest + innerObj.package_change_upon_user_request;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.package_change_upon_user_request;
                        }
                        if (innerObj.unsubscribe_request_received_and_expired){
                            dataObj.switchPackageRequestTriedButFailed = dataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            dataObj.netTotal = dataObj.netTotal + innerObj.unsubscribe_request_received_and_expired;

                            dayDataObj.switchPackageRequestTriedButFailed = dayDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.unsubscribe_request_received_and_expired;

                            weeklyDataObj.switchPackageRequestTriedButFailed = weeklyDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.unsubscribe_request_received_and_expired;

                            monthlyDataObj.switchPackageRequestTriedButFailed = monthlyDataObj.switchPackageRequestTriedButFailed + innerObj.unsubscribe_request_received_and_expired;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.unsubscribe_request_received_and_expired;
                        }
                        if (innerObj.subscription_request_received_for_the_same_package){
                            dataObj.unsubscribeRequestReceivedAndExpired = dataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            dataObj.netTotal = dataObj.netTotal + innerObj.subscription_request_received_for_the_same_package;

                            dayDataObj.unsubscribeRequestReceivedAndExpired = dayDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package;

                            weeklyDataObj.unsubscribeRequestReceivedAndExpired = weeklyDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package;

                            monthlyDataObj.unsubscribeRequestReceivedAndExpired = monthlyDataObj.unsubscribeRequestReceivedAndExpired + innerObj.subscription_request_received_for_the_same_package;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package;
                        }
                        if (innerObj.switch_package_request_tried_but_failed){
                            dataObj.subscriptionRequestReceivedForTheSamePackage = dataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            dataObj.netTotal = dataObj.netTotal + innerObj.switch_package_request_tried_but_failed;

                            dayDataObj.subscriptionRequestReceivedForTheSamePackage = dayDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.switch_package_request_tried_but_failed;

                            weeklyDataObj.subscriptionRequestReceivedForTheSamePackage = weeklyDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.switch_package_request_tried_but_failed;

                            monthlyDataObj.subscriptionRequestReceivedForTheSamePackage = monthlyDataObj.subscriptionRequestReceivedForTheSamePackage + innerObj.switch_package_request_tried_but_failed;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.switch_package_request_tried_but_failed;
                        }
                        if (innerObj.subscription_request_received_for_the_same_package_after_unsub){
                            dataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = dataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            dataObj.netTotal = dataObj.netTotal + innerObj.subscription_request_received_for_the_same_package_after_unsub;

                            dayDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = dayDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package_after_unsub;

                            weeklyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = weeklyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package_after_unsub;

                            monthlyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub = monthlyDataObj.subscriptionRequestReceivedForTheSamePackageAfterUnsub + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.subscription_request_received_for_the_same_package_after_unsub;
                        }
                        if (innerObj.other_subscriptions_status_wise){
                            dataObj.otherSubscriptionsStatusWise = dataObj.otherSubscriptionsStatusWise + innerObj.other_subscriptions_status_wise;
                            dataObj.netTotal = dataObj.netTotal + innerObj.other_subscriptions_status_wise;

                            dayDataObj.otherSubscriptionsStatusWise = dayDataObj.otherSubscriptionsStatusWise + innerObj.other_subscriptions_status_wise;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.other_subscriptions_status_wise;

                            weeklyDataObj.otherSubscriptionsStatusWise = weeklyDataObj.otherSubscriptionsStatusWise + innerObj.other_subscriptions_status_wise;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.other_subscriptions_status_wise;

                            monthlyDataObj.otherSubscriptionsStatusWise = monthlyDataObj.otherSubscriptionsStatusWise + innerObj.other_subscriptions_status_wise;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.other_subscriptions_status_wise;
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
                            otherSubscriptionsStatusWise: innerObj.other_subscriptions_status_wise,

                            netTotal: innerObj.trial + innerObj.graced + innerObj.expired + innerObj.success + innerObj.affiliate_callback_sent +
                                innerObj.micro_charging_exceeded + innerObj.graced_and_stream_stopped + innerObj.direct_billing_tried_but_failed +
                                innerObj.package_change_upon_user_request + innerObj.switch_package_request_tried_but_failed + innerObj.unsubscribe_request_received_and_expired +
                                innerObj.subscription_request_received_for_the_same_package + innerObj.subscription_request_received_for_the_same_package_after_unsub +
                                innerObj.other_subscriptions_status_wise,

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
                    monthlyDataObj = _.clone(cloneRevenueBillingStatusWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneRevenueBillingStatusWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneRevenueBillingStatusWiseObj());
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};


function cloneRevenueBillingStatusWiseObj(){
    return {trial: 0, graced: 0, expired: 0, success: 0, affiliateCallbackSent: 0, micro_charging_exceeded: 0,
        gracedAndStreamStopped: 0, directBillingTriedButFailed: 0, packageChangeUponUserRequest: 0,
        switchPackageRequestTriedButFailed: 0, unsubscribeRequestReceivedAndExpired: 0,
        subscriptionRequestReceivedForTheSamePackage: 0, subscriptionRequestReceivedForTheSamePackageAfterUnsub: 0,
        otherSubscriptionsStatusWise: 0, netTotal: 0};
}

module.exports = {
    computeRevenuePackageWiseReport: computeRevenuePackageWiseReport,
    computeRevenuePaywallWiseReport: computeRevenuePaywallWiseReport,
    computeRevenueOperatorWiseReport: computeRevenueOperatorWiseReport,
    computeRevenueBillingStatusWiseReport: computeRevenueBillingStatusWiseReport
};
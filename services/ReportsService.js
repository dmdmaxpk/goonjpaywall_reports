const container = require("../configurations/container");
const reportsRepo = require('../repos/ReportsRepo');
const reportsTransformer = container.resolve('reportsTransformer');
const  _ = require('lodash');

generateReportsData = async (params,res) => {
    try {
        let rawDataSet = await reportsRepo.generateReportsData(params);
        if (params.type === 'users'){
            if (params.sub_type === 'active_inactive')
                return computeVerifiedUserReport(rawDataSet, params);
            else if (params.sub_type === 'accessing_service')
                return computeAccessingServiceUserReport(rawDataSet, params);
            else if (params.sub_type === 'unique_paying')
                return computeUniquePayingUserReport(rawDataSet, params);
            else if (params.sub_type === 'full_and_partial_charged')
                return computeFullPartialChargedUserReport(rawDataSet, params);
            else if (params.sub_type === 'returning_user')
                return computeReturningUserReport(rawDataSet, params);
            else if (params.sub_type === 'user_billed')
                if (params.user_billed === 'package_wise')
                    return computeUserBilledPackageWiseReport(rawDataSet, params);
                else if (params.user_billed === 'paywall_wise')
                    return computeUserBilledPaywallWiseReport(rawDataSet, params);
                else if (params.user_billed === 'operator_wise')
                    return computeUserBilledOperatorWiseReport(rawDataSet, params);
        }
        else if (params.type === 'subscribers'){
            if (params.sub_type === 'total')
                return computeTotalSubscribersReport(rawDataSet, params);
            else if (params.sub_type === 'active_inactive')
                return computeActiveSubscribersReport(rawDataSet, params);
        }
        else if (params.type === 'subscriptions'){
            if (params.sub_type === 'active_inactive')
                return activeInactiveSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return packageWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'source_wise')
                return sourceWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return paywallWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'affiliate_mid')
                return affliateMidWiseSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'callback_send')
                return callbackSendSubscriptionReport(rawDataSet, params);
            else if (params.sub_type === 'success_rate')
                return successRateSubscriptionReport(rawDataSet, params);
        }
        else if (params.type === 'revenue'){
            if (params.sub_type === 'package_wise')
                return computeRevenuePackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return computeRevenuePaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return computeRevenueOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'billing_status_wise')
                return computeRevenueBillingStatusWiseReport(rawDataSet, params);
            else if (params.sub_type === 'net_revenue')
                return computeRevenueNetReport(rawDataSet, params);
        }
        else if (params.type === 'trial') {
            if (params.sub_type === 'source_wise')
                return computeTrialSourceWiseReport(rawDataSet, params);
        }
        else if (params.type === 'unsubscribe') {
            if (params.sub_type === 'source_wise')
                return computeUnSubscriptionsSourceWiseReport(rawDataSet, params);
        }
        else if (params.type === 'charge_details') {
            if (params.sub_type === 'source_wise')
                return computeChargeDetailsSourceWiseReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return computeChargeDetailsPackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return computeChargeDetailsPaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return computeChargeDetailsOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'full_micro_total')
                return computeFullAndMicroChargeDetailsReport(rawDataSet, params);
        }
        else if (params.type === 'net_additions') {
            if (params.sub_type === 'source_wise')
                return computeNetAdditionsSourceWiseReport(rawDataSet, params);
            else if (params.sub_type === 'package_wise')
                return computeNetAdditionsPackageWiseReport(rawDataSet, params);
            else if (params.sub_type === 'operator_wise')
                return computeNetAdditionsOperatorWiseReport(rawDataSet, params);
            else if (params.sub_type === 'paywall_wise')
                return computeNetAdditionsPaywallWiseReport(rawDataSet, params);
            else if (params.sub_type === 'net_additions_overall')
                return computeNetAdditionsReport(rawDataSet, params);
        }
        else if (params.type === 'transactions'){
            if (params.sub_type === 'transactions'){
                if (params.transactions === 'success_rate')
                    return computeTransactionsSuccessRateReport(rawDataSet, params);
                else if (params.transactions === 'failure_rate')
                    return computeTransactionsFailureRateReport(rawDataSet, params);
                else if (params.transactions === 'source_wise')
                    return computeTransactionsSourceWiseReport(rawDataSet, params);
                else if(params.transactions === 'package_wise')
                    return computeTransactionsPackageWiseReport(rawDataSet, params);
                else if(params.transactions === 'paywall_wise')
                    return computeTransactionsPaywallWiseReport(rawDataSet, params);
                else if(params.transactions === 'operator_wise')
                    return computeTransactionsOperatorWiseReport(rawDataSet, params);
                else if(params.transactions === 'price_wise')
                    return computeTransactionsPriceWiseWiseReport(rawDataSet, params);
            }
            else if (params.sub_type === 'subscribers'){
                if (params.subscribers === 'source_wise')
                    return computeTransactingSubscribersSourceWiseReport(rawDataSet, params);
                else if(params.subscribers === 'package_wise')
                    return computeTransactingSubscribersPackageWiseReport(rawDataSet, params);
                else if(params.subscribers === 'paywall_wise')
                    return computeTransactingSubscribersPaywallWiseReport(rawDataSet, params);
                else if(params.subscribers === 'operator_wise')
                    return computeTransactingSubscribersOperatorWiseReport(rawDataSet, params);
                else if(params.subscribers === 'net_total')
                    return computeTransactingSubscribersNetTotalWiseReport(rawDataSet, params);
            }
            else if (params.sub_type === 'avg_number') {
                if (params.avg_number === 'source_wise')
                    return computeTransactionsSourceWiseReport(rawDataSet, params);
                else if(params.avg_number === 'package_wise')
                    return computeTransactionsPackageWiseReport(rawDataSet, params);
                else if(params.avg_number === 'paywall_wise')
                    return computeTransactionsPaywallWiseReport(rawDataSet, params);
                else if(params.avg_number === 'operator_wise')
                    return computeTransactionsOperatorWiseReport(rawDataSet, params);
                else if(params.avg_number === 'net_total')
                    return computeTransactionsNetTotalWiseReport(rawDataSet, params);
            }
        }
    }catch (e) {
        return reportsTransformer.transformErrorCatchData(false, e.message);
    }
};


// User Compute Functions
function computeVerifiedUserReport(rawDataSet, params) {
    console.log('computeVerifiedUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let dayDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let weeklyDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let monthlyDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.users){
                for (let j=0; j<outerObj.users.length; j++){
                    innerObj = outerObj.users[j];
                    if (innerObj.active){
                        dataObj.totalActive = dataObj.totalActive + innerObj.active;
                        dayDataObj.totalActive = dayDataObj.totalActive + innerObj.active;
                        weeklyDataObj.totalActive = weeklyDataObj.totalActive + innerObj.active;
                        monthlyDataObj.totalActive = monthlyDataObj.totalActive + innerObj.active;
                    }
                    if (innerObj.nonActive){
                        dataObj.totalInactive = dataObj.totalInactive + innerObj.nonActive;
                        dayDataObj.totalInactive = dayDataObj.totalInactive + innerObj.nonActive;
                        weeklyDataObj.totalInactive = weeklyDataObj.totalInactive + innerObj.nonActive;
                        monthlyDataObj.totalInactive = monthlyDataObj.totalInactive + innerObj.nonActive;
                    }
                    if (innerObj.verified){
                        dataObj.totalVerified = dataObj.totalVerified + innerObj.verified;
                        dayDataObj.totalVerified = dayDataObj.totalVerified + innerObj.verified;
                        weeklyDataObj.totalVerified = weeklyDataObj.totalVerified + innerObj.verified;
                        monthlyDataObj.totalVerified = monthlyDataObj.totalVerified + innerObj.verified;
                    }
                    if (innerObj.nonVerified){
                        dataObj.totalNonVerified = dataObj.totalNonVerified + innerObj.nonVerified;
                        dayDataObj.totalNonVerified = dayDataObj.totalNonVerified + innerObj.nonVerified;
                        weeklyDataObj.totalNonVerified = weeklyDataObj.totalNonVerified + innerObj.nonVerified;
                        monthlyDataObj.totalNonVerified = monthlyDataObj.totalNonVerified + innerObj.nonVerified;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        totalActive: innerObj.active, totalInactive: innerObj.nonActive,
                        totalVerified: innerObj.verified, totalNonVerified: innerObj.nonVerified,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeAccessingServiceUserReport(rawDataSet, params) {
    console.log('computeAccessingServiceUserReport');

}
function computeUniquePayingUserReport(rawDataSet, params) {
    console.log('computeUniquePayingUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {total: 0};
    let dayDataObj = {total: 0};
    let weeklyDataObj = {total: 0};
    let monthlyDataObj = {total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.uniquePayingUsers){
                for (let j=0; j<outerObj.uniquePayingUsers.length; j++){
                    innerObj = outerObj.uniquePayingUsers[j];
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        total: innerObj.total,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({total: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeFullPartialChargedUserReport(rawDataSet, params) {
    console.log('computeFullPartialChargedUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let dayDataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let weeklyDataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let monthlyDataObj = {fullCharged: 0, partialCharged: 0, total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.fullAndPartialChargeUser){
                for (let j=0; j<outerObj.fullAndPartialChargeUser.length; j++){
                    innerObj = outerObj.fullAndPartialChargeUser[j];
                    if (innerObj.fullCharge){
                        dataObj.fullCharged = dataObj.fullCharged + innerObj.fullCharge;
                        dayDataObj.fullCharged = dayDataObj.fullCharged + innerObj.fullCharge;
                        weeklyDataObj.fullCharged = weeklyDataObj.fullCharged + innerObj.fullCharge;
                        monthlyDataObj.fullCharged = monthlyDataObj.fullCharged + innerObj.fullCharge;
                    }
                    if (innerObj.partialCharge){
                        dataObj.partialCharged = dataObj.partialCharged + innerObj.partialCharge;
                        dayDataObj.partialCharged = dayDataObj.partialCharged + innerObj.partialCharge;
                        weeklyDataObj.partialCharge = weeklyDataObj.partialCharge + innerObj.partialCharge;
                        monthlyDataObj.partialCharge = monthlyDataObj.partialCharge + innerObj.partialCharge;
                    }
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        fullCharged: innerObj.fullCharge,
                        partialCharged: innerObj.partialCharge,
                        total: innerObj.total, date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeReturningUserReport(rawDataSet, params) {
    console.log('computeReturningUserReport');
    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {total: 0};
    let dayDataObj = {total: 0};
    let weeklyDataObj = {total: 0};
    let monthlyDataObj = {total: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.returningUsers){
                for (let j=0; j<outerObj.returningUsers.length; j++){
                    innerObj = outerObj.returningUsers[j];
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        total: innerObj.total,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({total: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeUserBilledPackageWiseReport(rawDataSet, params) {
    console.log('computeUserBilledPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let dayDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let weeklyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let monthlyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.userBilled.package){
                        innerObj = billingHistory.userBilled.package;
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
                        if (innerObj.total){
                            dataObj.total = dataObj.total + innerObj.total;
                            dayDataObj.total = dayDataObj.total + innerObj.total;
                            weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                            monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            totalLiveDaily: innerObj.liveDaily, totalLiveWeekly: innerObj.liveWeekly,
                            totalComedyDaily: innerObj.comedyDaily, totalComedyWeekly: innerObj.comedyWeekly,
                            total: innerObj.total, date: billingHistory.added_dtm_hours
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeUserBilledPaywallWiseReport(rawDataSet, params) {
    console.log('computeUserBilledPaywallWiseReport');

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
                    if (billingHistory.userBilled.paywall){
                        innerObj = billingHistory.userBilled.paywall;
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

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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

        // Total Count Data
        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeUserBilledOperatorWiseReport(rawDataSet, params) {
    console.log('computeUserBilledOperatorWiseReport');

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
                    if (billingHistory.userBilled.operator){
                        innerObj = billingHistory.userBilled.operator;
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
                            telenor: innerObj.telenor, easypaisa: innerObj.easypaisa,
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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

        // Total Count Data
        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}


// Subscriber Compute Functions
function computeTotalSubscribersReport(rawDataSet, params) {
    console.log('computeTotalSubscribersReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, subscribers;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {total: 0};
    let dayDataObj = {total: 0};
    let weeklyDataObj = {total: 0};
    let monthlyDataObj = {total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscribers){
                subscribers = outerObj.subscribers;
                if (subscribers.total){
                    for (let j=0; j<subscribers.total.length; j++){
                        innerObj = subscribers.total[j];
                        if (innerObj.total){
                            dataObj.total = dataObj.total + innerObj.total;
                            dayDataObj.total = dayDataObj.total + innerObj.total;
                            weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                            monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            total: innerObj.total,
                            date: innerObj.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = innerObj.added_dtm;

                        if (month_from_date === null)
                            month_from_date = innerObj.added_dtm;
                    }

                    monthNo = new Date(outerObj.date).getMonth() + 1;
                    dayNo = new Date(outerObj.date).getDate();

                    // Monthly Data Count
                    if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                        monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                        monthWiseTotalCount.push(_.clone(monthlyDataObj));
                        monthlyDataObj = _.clone({total: 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0){
                        weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                        weekWiseTotalCount.push(_.clone(weeklyDataObj));
                        weeklyDataObj = _.clone({total: 0});
                        week_from_date = null;
                    }

                    // Day Wise Date Count
                    dayDataObj.date = outerObj.date;
                    dayWiseTotalCount.push(_.clone(dayDataObj));
                    dayDataObj = _.clone({total: 0});
                }
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeActiveSubscribersReport(rawDataSet, params) {
    console.log('computeActiveSubscribersReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, subscribers, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalActive: 0, totalInactive: 0};
    let dayDataObj = {totalActive: 0, totalInactive: 0};
    let weeklyDataObj = {totalActive: 0, totalInactive: 0};
    let monthlyDataObj = {totalActive: 0, totalInactive: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscribers) {
                subscribers = outerObj.subscribers;
                if (subscribers.activeInActive){
                    for (let j=0; j<subscribers.activeInActive.length; j++){
                        innerObj = subscribers.activeInActive[j];
                        if (innerObj.active){
                            dataObj.totalActive = dataObj.totalActive + innerObj.active;
                            dayDataObj.totalActive = dayDataObj.totalActive + innerObj.active;
                            weeklyDataObj.totalActive = weeklyDataObj.totalActive + innerObj.active;
                            monthlyDataObj.totalActive = monthlyDataObj.totalActive + innerObj.active;
                        }
                        if (innerObj.nonActive){
                            dataObj.totalInactive = dataObj.totalInactive + innerObj.nonActive;
                            dayDataObj.totalInactive = dayDataObj.totalInactive + innerObj.nonActive;
                            weeklyDataObj.totalInactive = weeklyDataObj.totalInactive + innerObj.nonActive;
                            monthlyDataObj.totalInactive = monthlyDataObj.totalInactive + innerObj.nonActive;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            totalActive: innerObj.active,
                            totalInactive: innerObj.nonActive,
                            date: innerObj.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = innerObj.added_dtm;

                        if (month_from_date === null)
                            month_from_date = innerObj.added_dtm;
                    }

                    monthNo = new Date(outerObj.date).getMonth() + 1;
                    dayNo = new Date(outerObj.date).getDate();

                    // Monthly Data Count
                    if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                        monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                        monthWiseTotalCount.push(_.clone(monthlyDataObj));
                        monthlyDataObj = _.clone({totalActive: 0, totalInactive: 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0){
                        weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                        weekWiseTotalCount.push(_.clone(weeklyDataObj));
                        weeklyDataObj = _.clone({totalActive: 0, totalInactive: 0});
                        week_from_date = null;
                    }

                    // Day Wise Date Count
                    dayDataObj.date = outerObj.date;
                    dayWiseTotalCount.push(_.clone(dayDataObj));
                    dayDataObj = _.clone({totalActive: 0, totalInactive: 0});
                }
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}


// Subscription Compute Functions
function activeInactiveSubscriptionReport(rawDataSet, params) {
    console.log('activeInactiveSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalActive: 0, totalInactive: 0};
    let dayDataObj = {totalActive: 0, totalInactive: 0};
    let weeklyDataObj = {totalActive: 0, totalInactive: 0};
    let monthlyDataObj = {totalActive: 0, totalInactive: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                for (let j=0; j<outerObj.subscriptions.length; j++) {
                    innerObj = outerObj.subscriptions[j];
                    if (innerObj.active){
                        dataObj.totalActive = dataObj.totalActive + innerObj.active;
                        dayDataObj.totalActive = dayDataObj.totalActive + innerObj.active;
                        weeklyDataObj.totalActive = weeklyDataObj.totalActive + innerObj.active;
                        monthlyDataObj.totalActive = monthlyDataObj.totalActive + innerObj.active;
                    }
                    if (innerObj.nonActive){
                        dataObj.totalInactive = dataObj.totalInactive + innerObj.nonActive;
                        dayDataObj.totalInactive = dayDataObj.totalInactive + innerObj.nonActive;
                        weeklyDataObj.totalInactive = weeklyDataObj.totalInactive + innerObj.nonActive;
                        monthlyDataObj.totalInactive = monthlyDataObj.totalInactive + innerObj.nonActive;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        totalActive: innerObj.active,
                        totalInactive: innerObj.nonActive,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalActive: 0, totalInactive: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalActive: 0, totalInactive: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalActive: 0, totalInactive: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function packageWiseSubscriptionReport(rawDataSet, params) {
    console.log('packageWiseSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, subscription, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let dayDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let weeklyDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let monthlyDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                for (let j=0; j<outerObj.subscriptions.length; j++) {
                    subscription = outerObj.subscriptions[j];
                    if (subscription.package) {
                        innerObj = subscription.package;
                        if (innerObj.dailyLive){
                            dataObj.dailyLive = dataObj.dailyLive + innerObj.dailyLive;
                            dayDataObj.dailyLive = dayDataObj.dailyLive + innerObj.dailyLive;
                            weeklyDataObj.dailyLive = weeklyDataObj.dailyLive + innerObj.dailyLive;
                            monthlyDataObj.dailyLive = monthlyDataObj.dailyLive + innerObj.dailyLive;
                        }
                        if (innerObj.weeklyLive){
                            dataObj.weeklyLive = dataObj.weeklyLive + innerObj.weeklyLive;
                            dayDataObj.weeklyLive = dayDataObj.weeklyLive + innerObj.weeklyLive;
                            weeklyDataObj.weeklyLive = weeklyDataObj.weeklyLive + innerObj.weeklyLive;
                            monthlyDataObj.weeklyLive = monthlyDataObj.weeklyLive + innerObj.weeklyLive;
                        }
                        if (innerObj.dailyComedy){
                            dataObj.dailyComedy = dataObj.dailyComedy + innerObj.dailyComedy;
                            dayDataObj.dailyComedy = dayDataObj.dailyComedy + innerObj.dailyComedy;
                            weeklyDataObj.dailyComedy = weeklyDataObj.dailyComedy + innerObj.dailyComedy;
                            monthlyDataObj.dailyComedy = monthlyDataObj.dailyComedy + innerObj.dailyComedy;
                        }
                        if (innerObj.weeklyComedy){
                            dataObj.weeklyComedy = dataObj.weeklyComedy + innerObj.weeklyComedy;
                            dayDataObj.weeklyComedy = dayDataObj.weeklyComedy + innerObj.weeklyComedy;
                            weeklyDataObj.weeklyComedy = weeklyDataObj.weeklyComedy + innerObj.weeklyComedy;
                            monthlyDataObj.weeklyComedy = monthlyDataObj.weeklyComedy + innerObj.weeklyComedy;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            dailyLive: innerObj.dailyLive, weeklyLive: innerObj.weeklyLive,
                            dailyComedy: innerObj.dailyComedy, weeklyComedy: innerObj.weeklyComedy,
                            date: subscription.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = subscription.added_dtm;

                        if (month_from_date === null)
                            month_from_date = subscription.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function sourceWiseSubscriptionReport(rawDataSet, params) {
    console.log('sourceWiseSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, subscription, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dayDataObj = {app: 0, web: 0, gdn2: 0, HE: 0};
    let dataObj = {app: 0, web: 0, gdn2: 0, HE: 0};
    let weeklyDataObj = {app: 0, web: 0, gdn2: 0, HE: 0};
    let monthlyDataObj = {app: 0, web: 0, gdn2: 0, HE: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                for (let j=0; j<outerObj.subscriptions.length; j++) {
                    subscription = outerObj.subscriptions[j];
                    if (subscription.source) {
                        innerObj = subscription.source;
                        if (innerObj.app){
                            dataObj.app = dataObj.app + innerObj.app;
                            dayDataObj.app = dayDataObj.app + innerObj.app;
                            weeklyDataObj.app = weeklyDataObj.app + innerObj.app;
                            monthlyDataObj.app = monthlyDataObj.app + innerObj.app;
                        }
                        if (innerObj.web){
                            dataObj.web = dataObj.web + innerObj.web;
                            dayDataObj.web = dayDataObj.web + innerObj.web;
                            weeklyDataObj.web = weeklyDataObj.web + innerObj.web;
                            monthlyDataObj.web = monthlyDataObj.web + innerObj.web;
                        }
                        if (innerObj.gdn2){
                            dataObj.gdn2 = dataObj.gdn2 + innerObj.gdn2;
                            dayDataObj.gdn2 = dayDataObj.gdn2 + innerObj.gdn2;
                            weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + innerObj.gdn2;
                            monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + innerObj.gdn2;
                        }
                        if (innerObj.HE){
                            dataObj.HE = dataObj.HE + innerObj.HE;
                            dayDataObj.HE = dayDataObj.HE + innerObj.HE;
                            weeklyDataObj.HE = weeklyDataObj.HE + innerObj.HE;
                            monthlyDataObj.HE = monthlyDataObj.HE + innerObj.HE;
                        }
                        if (innerObj.affiliate_web){
                            dataObj.affiliate_web = dataObj.affiliate_web + innerObj.affiliate_web;
                            dayDataObj.affiliate_web = dayDataObj.affiliate_web + innerObj.affiliate_web;
                            weeklyDataObj.affiliate_web = weeklyDataObj.affiliate_web + innerObj.affiliate_web;
                            monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + innerObj.affiliate_web;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            app: innerObj.app, web: innerObj.web,
                            gdn2: innerObj.gdn2, HE: innerObj.HE,
                            affiliate_web: innerObj.affiliate_web,
                            date: subscription.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = subscription.added_dtm;

                        if (month_from_date === null)
                            month_from_date = subscription.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({app: 0, web: 0, gdn2: 0, HE: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({app: 0, web: 0, gdn2: 0, HE: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({app: 0, web: 0, gdn2: 0, HE: 0});
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function paywallWiseSubscriptionReport(rawDataSet, params) {
    console.log('paywallWiseSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {comedy: 0, web: 0, gdn2: 0, HE: 0};
    let dayDataObj = {comedy: 0, web: 0, gdn2: 0, HE: 0};
    let weeklyDataObj = {comedy: 0, web: 0, gdn2: 0, HE: 0};
    let monthlyDataObj = {comedy: 0, web: 0, gdn2: 0, HE: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                for (let j=0; j<outerObj.subscriptions.length; j++) {
                    subscription = outerObj.subscriptions[j];
                    if (subscription.paywall) {
                        innerObj = subscription.paywall;
                        if (innerObj.comedy){
                            dataObj.comedy = dataObj.comedy + innerObj.comedy;
                            dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                            weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                            monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                        }
                        if (innerObj.live){
                            dataObj.live = dataObj.live + innerObj.live;
                            dayDataObj.live = dayDataObj.live + innerObj.live;
                            weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                            monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            comedy: innerObj.comedy, live: innerObj.live, date: subscription.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = subscription.added_dtm;

                        if (month_from_date === null)
                            month_from_date = subscription.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({comedy: 0, web: 0, gdn2: 0, HE: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({comedy: 0, web: 0, gdn2: 0, HE: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({comedy: 0, web: 0, gdn2: 0, HE: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function affliateMidWiseSubscriptionReport(rawDataSet, params) {
    console.log('affliateMidWiseSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, subscription, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0};
    let dayDataObj = {'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0};
    let weeklyDataObj = {'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0};
    let monthlyDataObj = {'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                for (let j=0; j<outerObj.subscriptions.length; j++) {
                    subscription = outerObj.subscriptions[j];
                    if (subscription.affiliate_mid) {
                        innerObj = subscription.affiliate_mid;
                        if (innerObj['1']){
                            dataObj['1'] = dataObj['1'] + innerObj['1'];
                            dayDataObj['1'] = dayDataObj['1'] + innerObj['1'];
                            weeklyDataObj['1'] = weeklyDataObj['1'] + innerObj['1'];
                            monthlyDataObj['1'] = monthlyDataObj['1'] + innerObj['1'];
                        }
                        if (innerObj['1565']){
                            dataObj['1565'] = dataObj['1565'] + innerObj['1565'];
                            dayDataObj['1565'] = dayDataObj['1565'] + innerObj['1565'];
                            weeklyDataObj['1565'] = weeklyDataObj['1565'] + innerObj['1565'];
                            monthlyDataObj['1565'] = monthlyDataObj['1565'] + innerObj['1565'];
                        }
                        if (innerObj.aff3){
                            dataObj.aff3 = dataObj.aff3 + innerObj.aff3;
                            dayDataObj.aff3 = dayDataObj.aff3 + innerObj.aff3;
                            weeklyDataObj.aff3 = weeklyDataObj.aff3 + innerObj.aff3;
                            monthlyDataObj.aff3 = monthlyDataObj.aff3 + innerObj.aff3;
                        }
                        if (innerObj.aff3a){
                            dataObj.aff3a = dataObj.aff3a + innerObj.aff3a;
                            dayDataObj.aff3a = dayDataObj.aff3a + innerObj.aff3a;
                            weeklyDataObj.aff3a = weeklyDataObj.aff3a + innerObj.aff3a;
                            monthlyDataObj.aff3a = monthlyDataObj.aff3a + innerObj.aff3a;
                        }
                        if (innerObj.gdn){
                            dataObj.gdn = dataObj.gdn + innerObj.gdn;
                            dayDataObj.gdn = dayDataObj.gdn + innerObj.gdn;
                            weeklyDataObj.gdn = weeklyDataObj.gdn + innerObj.gdn;
                            monthlyDataObj.gdn = monthlyDataObj.gdn + innerObj.gdn;
                        }
                        if (innerObj.gdn2){
                            dataObj.gdn2 = dataObj.gdn2 + innerObj.gdn2;
                            dayDataObj.gdn2 = dayDataObj.gdn2 + innerObj.gdn2;
                            weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + innerObj.gdn2;
                            monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + innerObj.gdn2;
                        }
                        if (innerObj.goonj){
                            dataObj.goonj = dataObj.goonj + innerObj.goonj;
                            dayDataObj.goonj = dayDataObj.goonj + innerObj.goonj;
                            weeklyDataObj.goonj = weeklyDataObj.goonj + innerObj.goonj;
                            monthlyDataObj.goonj = monthlyDataObj.goonj + innerObj.goonj;
                        }
                        if (innerObj['null']){
                            dataObj['null'] = dataObj['null'] + innerObj['null'];
                            dayDataObj['null'] = dayDataObj['null'] + innerObj['null'];
                            weeklyDataObj['null'] = weeklyDataObj['null'] + innerObj['null'];
                            monthlyDataObj['null'] = monthlyDataObj['null'] + innerObj['null'];
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            '1': innerObj['1'], '1565': innerObj['1565'],
                            aff3: innerObj.aff3, aff3a: innerObj.aff3a,
                            gdn: innerObj.gdn, gdn2: innerObj.gdn2,
                            goonj: innerObj.goonj, 'null': innerObj['null'],
                            date: subscription.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = subscription.added_dtm;

                        if (month_from_date === null)
                            month_from_date = subscription.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({'1': 0, '1565': 0, aff3: 0, aff3a: 0, gdn: 0, gdn2: 0, goonj: 0, 'null': 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeUnSubscriptionsSourceWiseReport(rawDataSet, params) {
    console.log('computeUnSubscriptionsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
    let dayDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
    let weeklyDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
    let monthlyDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.sourceWiseUnSub){
                for (let j=0; j<outerObj.sourceWiseUnSub.length; j++) {
                    innerObj = outerObj.sourceWiseUnSub[j];
                    if (innerObj.he){
                        dataObj.he = dataObj.he + innerObj.he;
                        weeklyDataObj.he = weeklyDataObj.he + innerObj.he;
                        dayDataObj.he = dayDataObj.he + innerObj.he;
                        monthlyDataObj.he = monthlyDataObj.he + innerObj.he;
                    }
                    if (innerObj.na){
                        dataObj.na = dataObj.na + innerObj.na;
                        dayDataObj.na = dayDataObj.na + innerObj.na;
                        weeklyDataObj.na = weeklyDataObj.na + innerObj.na;
                        monthlyDataObj.na = monthlyDataObj.na + innerObj.na;
                    }
                    if (innerObj.cc){
                        dataObj.cc = dataObj.cc + innerObj.cc;
                        dayDataObj.cc = dayDataObj.cc + innerObj.cc;
                        weeklyDataObj.cc = weeklyDataObj.cc + innerObj.cc;
                        monthlyDataObj.cc = monthlyDataObj.cc + innerObj.cc;
                    }
                    if (innerObj.cp){
                        dataObj.cp = dataObj.cp + innerObj.cp;
                        dayDataObj.cp = dayDataObj.cp + innerObj.cp;
                        weeklyDataObj.cp = weeklyDataObj.cp + innerObj.cp;
                        monthlyDataObj.cp = monthlyDataObj.cp + innerObj.cp;
                    }
                    if (innerObj.pwa){
                        dataObj.pwa = dataObj.pwa + innerObj.pwa;
                        dayDataObj.pwa = dayDataObj.pwa + innerObj.pwa;
                        weeklyDataObj.pwa = weeklyDataObj.pwa + innerObj.pwa;
                        monthlyDataObj.pwa = monthlyDataObj.pwa + innerObj.pwa;
                    }
                    if (innerObj.mta){
                        dataObj.mta = dataObj.mta + innerObj.mta;
                        dayDataObj.mta = dayDataObj.mta + innerObj.mta;
                        weeklyDataObj.mta = weeklyDataObj.mta + innerObj.mta;
                        monthlyDataObj.mta = monthlyDataObj.mta + innerObj.mta;
                    }
                    if (innerObj.app){
                        dataObj.app = dataObj.app + innerObj.app;
                        dayDataObj.app = dayDataObj.app + innerObj.app;
                        weeklyDataObj.app = weeklyDataObj.app + innerObj.app;
                        monthlyDataObj.app = monthlyDataObj.app + innerObj.app;
                    }
                    if (innerObj.web){
                        dataObj.web = dataObj.web + innerObj.web;
                        dayDataObj.web = dayDataObj.web + innerObj.web;
                        weeklyDataObj.web = weeklyDataObj.web + innerObj.web;
                        monthlyDataObj.web = monthlyDataObj.web + innerObj.web;
                    }
                    if (innerObj.sms){
                        dataObj.sms = dataObj.sms + innerObj.sms;
                        dayDataObj.sms = dayDataObj.sms + innerObj.sms;
                        weeklyDataObj.sms = weeklyDataObj.sms + innerObj.sms;
                        monthlyDataObj.sms = monthlyDataObj.sms + innerObj.sms;
                    }
                    if (innerObj.null){
                        dataObj.null = dataObj.null + innerObj.null;
                        dayDataObj.null = dayDataObj.null + innerObj.null;
                        weeklyDataObj.null = weeklyDataObj.null + innerObj.null;
                        monthlyDataObj.null = monthlyDataObj.null + innerObj.null;
                    }
                    if (innerObj.null2){
                        dataObj.null2 = dataObj.null2 + innerObj.null2;
                        dayDataObj.null2 = dayDataObj.null2 + innerObj.null2;
                        weeklyDataObj.null2 = weeklyDataObj.null2 + innerObj.null2;
                        monthlyDataObj.null2 = monthlyDataObj.null2 + innerObj.null2;
                    }
                    if (innerObj.system){
                        dataObj.system = dataObj.system + innerObj.system;
                        dayDataObj.system = dayDataObj.system + innerObj.system;
                        weeklyDataObj.system = weeklyDataObj.system + innerObj.system;
                        monthlyDataObj.system = monthlyDataObj.system + innerObj.system;
                    }
                    if (innerObj.ccp_api){
                        dataObj.ccp_api = dataObj.ccp_api + innerObj.ccp_api;
                        dayDataObj.ccp_api = dayDataObj.ccp_api + innerObj.ccp_api;
                        weeklyDataObj.ccp_api = weeklyDataObj.ccp_api + innerObj.ccp_api;
                        monthlyDataObj.ccp_api = monthlyDataObj.ccp_api + innerObj.ccp_api;
                    }
                    if (innerObj.CP_null){
                        dataObj.CP_null = dataObj.CP_null + innerObj.CP_null;
                        dayDataObj.CP_null = dayDataObj.CP_null + innerObj.CP_null;
                        weeklyDataObj.CP_null = weeklyDataObj.CP_null + innerObj.CP_null;
                        monthlyDataObj.CP_null = monthlyDataObj.CP_null + innerObj.CP_null;
                    }
                    if (innerObj.emptyString){
                        dataObj.emptyString = dataObj.emptyString + innerObj.emptyString;
                        dayDataObj.emptyString = dayDataObj.emptyString + innerObj.emptyString;
                        weeklyDataObj.emptyString = weeklyDataObj.emptyString + innerObj.emptyString;
                        monthlyDataObj.emptyString = monthlyDataObj.emptyString + innerObj.emptyString;
                    }
                    if (innerObj.systemExpire){
                        dataObj.systemExpire = dataObj.systemExpire + innerObj.systemExpire;
                        dayDataObj.systemExpire = dayDataObj.systemExpire + innerObj.systemExpire;
                        weeklyDataObj.systemExpire = weeklyDataObj.systemExpire + innerObj.systemExpire;
                        monthlyDataObj.systemExpire = monthlyDataObj.systemExpire + innerObj.systemExpire;
                    }
                    if (innerObj.CP_telenorccd){
                        dataObj.CP_telenorccd = dataObj.CP_telenorccd + innerObj.CP_telenorccd;
                        dayDataObj.CP_telenorccd = dayDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                        weeklyDataObj.CP_telenorccd = weeklyDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                        monthlyDataObj.CP_telenorccd = monthlyDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                    }
                    if (innerObj.affiliate_web){
                        dataObj.affiliate_web = dataObj.affiliate_web + innerObj.affiliate_web;
                        dayDataObj.affiliate_web = dayDataObj.affiliate_web + innerObj.affiliate_web;
                        weeklyDataObj.affiliate_web = weeklyDataObj.affiliate_web + innerObj.affiliate_web;
                        monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + innerObj.affiliate_web;
                    }
                    if (innerObj.CP_productccd){
                        dataObj.CP_productccd = dataObj.CP_productccd + innerObj.CP_productccd;
                        dayDataObj.CP_productccd = dayDataObj.CP_productccd + innerObj.CP_productccd;
                        weeklyDataObj.CP_productccd = weeklyDataObj.CP_productccd + innerObj.CP_productccd;
                        monthlyDataObj.CP_productccd = monthlyDataObj.CP_productccd + innerObj.CP_productccd;
                    }
                    if (innerObj.CP_whatsappccd){
                        dataObj.CP_whatsappccd = dataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                        dayDataObj.CP_whatsappccd = dayDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                        weeklyDataObj.CP_whatsappccd = weeklyDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                        monthlyDataObj.CP_whatsappccd = monthlyDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                    }
                    if (innerObj.CP_ideationccd1){
                        dataObj.CP_ideationccd1 = dataObj.CP_ideationccd1 + innerObj.CP_ideationccd1;
                        dayDataObj.CP_ideationccd1 = dayDataObj.CP_ideationccd1 + innerObj.CP_ideationccd1;
                        weeklyDataObj.CP_ideationccd1 = weeklyDataObj.CP_ideationccd1 + innerObj.CP_ideationccd1;
                        monthlyDataObj.CP_ideationccd1 = monthlyDataObj.CP_ideationccd1 + innerObj.CP_ideationccd1;
                    }
                    if (innerObj.CP_ideationccd2){
                        dataObj.CP_ideationccd2 = dataObj.CP_ideationccd2 + innerObj.CP_ideationccd2;
                        dayDataObj.CP_ideationccd2 = dayDataObj.CP_ideationccd2 + innerObj.CP_ideationccd2;
                        weeklyDataObj.CP_ideationccd2 = weeklyDataObj.CP_ideationccd2 + innerObj.CP_ideationccd2;
                        monthlyDataObj.CP_ideationccd2 = monthlyDataObj.CP_ideationccd2 + innerObj.CP_ideationccd2;
                    }
                    if (innerObj.system_after_grace_end){
                        dataObj.system_after_grace_end = dataObj.system_after_grace_end + innerObj.system_after_grace_end;
                        dayDataObj.system_after_grace_end = dayDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                        weeklyDataObj.system_after_grace_end = weeklyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                        monthlyDataObj.system_after_grace_end = monthlyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                    }


                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        he: innerObj.he, na: innerObj.na, cc: innerObj.cc, cp: innerObj.cp,
                        pwa: innerObj.pwa, mta: innerObj.mta, app: innerObj.app, web: innerObj.web,
                        sms: innerObj.sms, null: innerObj.null, null2: innerObj.null2, gdn2: innerObj.gdn2,
                        system: innerObj.system, ccp_api: innerObj.ccp_api, CP_null: innerObj.CP_null,
                        emptyString: innerObj.emptyString, CP_telenorccd: innerObj.CP_telenorccd,
                        affiliate_web: innerObj.affiliate_web, CP_productccd: innerObj.CP_productccd,
                        CP_whatsappccd: innerObj.CP_whatsappccd, CP_ideationccd1: innerObj.CP_ideationccd1,
                        CP_ideationccd2: innerObj.CP_ideationccd2, system_after_grace_end: innerObj.system_after_grace_end,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneUnsubscribeObjectSourceWiseObj());
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function callbackSendSubscriptionReport(rawDataSet, params) {
    console.log('callbackSendSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {callbackSent: 0};
    let dayDataObj = {callbackSent: 0};
    let weeklyDataObj = {callbackSent: 0};
    let monthlyDataObj = {callbackSent: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.callbackSend){
                for (let j=0; j<outerObj.callbackSend.length; j++) {
                    innerObj = outerObj.callbackSend[j];
                    if (innerObj.callbackSent){
                        dataObj.callbackSent = dataObj.callbackSent + innerObj.callbackSent;
                        dayDataObj.callbackSent = dayDataObj.callbackSent + innerObj.callbackSent;
                        weeklyDataObj.callbackSent = weeklyDataObj.callbackSent + innerObj.callbackSent;
                        monthlyDataObj.callbackSent = monthlyDataObj.callbackSent + innerObj.callbackSent;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        callbackSent: innerObj.callbackSent,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({callbackSent: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({callbackSent: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({callbackSent: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function successRateSubscriptionReport(rawDataSet, params) {
    console.log('successRateSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {rate: 0, total: 0, successful: 0};
    let dayDataObj = {rate: 0, total: 0, successful: 0};
    let weeklyDataObj = {rate: 0, total: 0, successful: 0};
    let monthlyDataObj = {rate: 0, total: 0, successful: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.successRate){
                for (let j=0; j<outerObj.successRate.length; j++) {
                    innerObj = outerObj.successRate[j];
                    if (innerObj.rate){
                        dataObj.rate = parseFloat(dataObj.rate) + parseFloat(innerObj.rate);
                        dayDataObj.rate = parseFloat(dayDataObj.rate) + parseFloat(innerObj.rate);
                        weeklyDataObj.rate = parseFloat(weeklyDataObj.rate) + parseFloat(innerObj.rate);
                        monthlyDataObj.rate = parseFloat(monthlyDataObj.rate) + parseFloat(innerObj.rate);
                    }
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }
                    if (innerObj.successful){
                        dataObj.successful = dataObj.successful + innerObj.successful;
                        dayDataObj.successful = dayDataObj.successful + innerObj.successful;
                        weeklyDataObj.successful = weeklyDataObj.successful + innerObj.successful;
                        monthlyDataObj.successful = monthlyDataObj.successful + innerObj.successful;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        rate: innerObj.rate,
                        date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({rate: 0, total: 0, successful: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({rate: 0, total: 0, successful: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({rate: 0, total: 0, successful: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}


// Revenue compute Functions
function computeRevenuePackageWiseReport(rawDataSet, params) {
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeRevenuePaywallWiseReport(rawDataSet, params) {
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeRevenueOperatorWiseReport(rawDataSet, params) {
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeRevenueBillingStatusWiseReport(rawDataSet, params) {
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
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeRevenueNetReport(rawDataSet, params) {
    console.log('computeRevenueNetReport');

}

// Trial Compute Functions
function computeTrialSourceWiseReport(rawDataSet, params) {
    console.log('computeTrialSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {app: 0, web: 0, he: 0, total: 0};
    let dayDataObj = {app: 0, web: 0, he: 0, total: 0};
    let weeklyDataObj = {app: 0, web: 0, he: 0, total: 0};
    let monthlyDataObj = {app: 0, web: 0, he: 0, total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.sourceWiseTrail){
                for (let j=0; j<outerObj.sourceWiseTrail.length; j++) {
                    innerObj = outerObj.sourceWiseTrail[j];
                    if (innerObj.app){
                        dataObj.app = dataObj.app + innerObj.app;
                        dayDataObj.app = dayDataObj.app + innerObj.app;
                        weeklyDataObj.app = weeklyDataObj.app + innerObj.app;
                        monthlyDataObj.app = monthlyDataObj.app + innerObj.app;
                    }
                    if (innerObj.web){
                        dataObj.web = dataObj.web + innerObj.web;
                        dayDataObj.web = dayDataObj.web + innerObj.web;
                        weeklyDataObj.web = weeklyDataObj.web + innerObj.web;
                        monthlyDataObj.web = monthlyDataObj.web + innerObj.web;
                    }
                    if (innerObj.he){
                        dataObj.he = dataObj.he + innerObj.he;
                        dayDataObj.he = dayDataObj.he + innerObj.he;
                        weeklyDataObj.he = weeklyDataObj.he + innerObj.he;
                        monthlyDataObj.he = monthlyDataObj.he + innerObj.he;
                    }
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        app: innerObj.app, web: innerObj.web, he: innerObj.he, total: innerObj.total, date: innerObj.added_dtm_hours
                    });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = innerObj.added_dtm;

                    if (month_from_date === null)
                        month_from_date = innerObj.added_dtm;
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({app: 0, web: 0, he: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({app: 0, web: 0, he: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({app: 0, web: 0, he: 0, total: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}

// Charge Details Compute Functions
function computeChargeDetailsSourceWiseReport(rawDataSet, params) {
    console.log('computeChargeDetailsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
    let dayDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
    let weeklyDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
    let monthlyDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.chargeDetails){
                for (let j=0; j<outerObj.chargeDetails.length; j++) {
                    chargeDetails = outerObj.chargeDetails[j];
                    if (chargeDetails.source) {
                        innerObj = chargeDetails.source;
                        if (innerObj.app){
                            returnData = updateDataArrs(innerObj, 'app', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.web){
                            returnData = updateDataArrs(innerObj, 'web', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.HE){
                            returnData = updateDataArrs(innerObj, 'HE', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.sms){
                            returnData = updateDataArrs(innerObj, 'sms', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.gdn2){
                            returnData = updateDataArrs(innerObj, 'gdn2', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.CP){
                            returnData = updateDataArrs(innerObj, 'CP', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.null){
                            returnData = updateDataArrs(innerObj, 'null', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.affiliate_web){
                            returnData = updateDataArrs(innerObj, 'affiliate_web', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.system_after_grace_end){
                            returnData = updateDataArrs(innerObj, 'system_after_grace_end', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            app: innerObj.app,
                            web: innerObj.web,
                            HE: innerObj.HE,
                            sms: innerObj.sms,
                            gdn2: innerObj.gdn2,
                            CP: innerObj.CP,
                            null: innerObj.null,
                            affiliate_web: innerObj.affiliate_web,
                            system_after_grace_end: innerObj.system_after_grace_end,
                            date: chargeDetails.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = chargeDetails.added_dtm;

                        if (month_from_date === null)
                            month_from_date = chargeDetails.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectSourceWiseObj('charge_details'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeChargeDetailsPackageWiseReport(rawDataSet, params) {
    console.log('computeChargeDetailsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
    let dayDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
    let weeklyDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
    let monthlyDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.chargeDetails){
                for (let j=0; j<outerObj.chargeDetails.length; j++) {
                    chargeDetails = outerObj.chargeDetails[j];
                    if (chargeDetails.package) {
                        innerObj = chargeDetails.package;
                        if (innerObj.dailyLive){
                            returnData = updateDataArrs(innerObj, 'dailyLive', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyLive){
                            returnData = updateDataArrs(innerObj, 'weeklyLive', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.dailyComedy){
                            returnData = updateDataArrs(innerObj, 'dailyComedy', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyComedy){
                            returnData = updateDataArrs(innerObj, 'weeklyComedy', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            dailyLive: innerObj.dailyLive,
                            weeklyLive: innerObj.weeklyLive,
                            dailyComedy: innerObj.dailyComedy,
                            weeklyComedy: innerObj.weeklyComedy,
                            date: chargeDetails.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = chargeDetails.added_dtm;

                        if (month_from_date === null)
                            month_from_date = chargeDetails.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPackageWiseObj('charge_details'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeChargeDetailsPaywallWiseReport(rawDataSet, params) {
    console.log('computeChargeDetailsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
    let dayDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
    let weeklyDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
    let monthlyDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.chargeDetails){
                for (let j=0; j<outerObj.chargeDetails.length; j++) {
                    chargeDetails = outerObj.chargeDetails[j];
                    if (chargeDetails.paywall) {
                        innerObj = chargeDetails.paywall;
                        if (innerObj.comedy){
                            returnData = updateDataArrs(innerObj, 'comedy', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.live){
                            returnData = updateDataArrs(innerObj, 'live', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            comedy: innerObj.comedy,
                            live: innerObj.live,
                            date: chargeDetails.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = chargeDetails.added_dtm;

                        if (month_from_date === null)
                            month_from_date = chargeDetails.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPaywallWiseObj('charge_details'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeChargeDetailsOperatorWiseReport(rawDataSet, params) {
    console.log('computeChargeDetailsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
    let dayDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
    let weeklyDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
    let monthlyDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.chargeDetails){
                for (let j=0; j<outerObj.chargeDetails.length; j++) {
                    chargeDetails = outerObj.chargeDetails[j];
                    if (chargeDetails.operator) {
                        innerObj = chargeDetails.operator;
                        if (innerObj.telenor){
                            returnData = updateDataArrs(innerObj, 'telenor', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.easypaisa){
                            returnData = updateDataArrs(innerObj, 'easypaisa', 'charge_details', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            telenor: innerObj.telenor,
                            easypaisa: innerObj.easypaisa,
                            date: chargeDetails.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = chargeDetails.added_dtm;

                        if (month_from_date === null)
                            month_from_date = chargeDetails.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectOperatorWiseObj('charge_details'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeFullAndMicroChargeDetailsReport(rawDataSet, params) {
    console.log('computeFullAndMicroChargeDetailsReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { full: 0, micro: 0};
    let dayDataObj = { full: 0, micro: 0};
    let weeklyDataObj = { full: 0, micro: 0};
    let monthlyDataObj = { full: 0, micro: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.chargeDetails){
                for (let j=0; j<outerObj.chargeDetails.length; j++) {
                    chargeDetails = outerObj.chargeDetails[j];
                    if (chargeDetails.chargeType) {
                        innerObj = chargeDetails.chargeType;
                        if (innerObj.full){
                            dataObj.full = dataObj.full + innerObj.full;
                            dayDataObj.full = dayDataObj.full + innerObj.full;
                            weeklyDataObj.full = weeklyDataObj.full + innerObj.full;
                            monthlyDataObj.full = monthlyDataObj.full + innerObj.full;
                        }
                        if (innerObj.micro){
                            dataObj.micro = dataObj.micro + innerObj.micro;
                            dayDataObj.micro = dayDataObj.micro + innerObj.micro;
                            weeklyDataObj.micro = weeklyDataObj.micro + innerObj.micro;
                            monthlyDataObj.micro = monthlyDataObj.micro + innerObj.micro;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            full: innerObj.full,
                            micro: innerObj.micro,
                            date: chargeDetails.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = chargeDetails.added_dtm;

                        if (month_from_date === null)
                            month_from_date = chargeDetails.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ full: 0, micro: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ full: 0, micro: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ full: 0, micro: 0});
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}

// Net Additions Revenue Compute Functions
function computeNetAdditionsSourceWiseReport(rawDataSet, params) {
    console.log('computeNetAdditionsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
    let dayDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
    let weeklyDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
    let monthlyDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.source) {
                        innerObj = netAddition.source;
                        if (innerObj.app){
                            returnData = updateDataArrs(innerObj, 'app', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.web){
                            returnData = updateDataArrs(innerObj, 'web', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.HE){
                            returnData = updateDataArrs(innerObj, 'HE', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.sms){
                            returnData = updateDataArrs(innerObj, 'sms', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.gdn2){
                            returnData = updateDataArrs(innerObj, 'gdn2', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.CP){
                            returnData = updateDataArrs(innerObj, 'CP', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.null){
                            returnData = updateDataArrs(innerObj, 'null', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.affiliate_web){
                            returnData = updateDataArrs(innerObj, 'affiliate_web', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.system_after_grace_end){
                            returnData = updateDataArrs(innerObj, 'system_after_grace_end', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            app: innerObj.app,
                            web: innerObj.web,
                            HE: innerObj.HE,
                            sms: innerObj.sms,
                            gdn2: innerObj.gdn2,
                            CP: innerObj.CP,
                            null: innerObj.null,
                            affiliate_web: innerObj.affiliate_web,
                            system_after_grace_end: innerObj.system_after_grace_end,
                            date: netAddition.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = netAddition.added_dtm;

                        if (month_from_date === null)
                            month_from_date = netAddition.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectSourceWiseObj('net_addition'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeNetAdditionsPackageWiseReport(rawDataSet, params) {
    console.log('computeNetAdditionsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
    let dayDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
    let weeklyDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
    let monthlyDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.package) {
                        innerObj = netAddition.package;
                        if (innerObj.dailyLive){
                            returnData = updateDataArrs(innerObj, 'dailyLive', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyLive){
                            returnData = updateDataArrs(innerObj, 'weeklyLive', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.dailyComedy){
                            returnData = updateDataArrs(innerObj, 'dailyComedy', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyComedy){
                            returnData = updateDataArrs(innerObj, 'weeklyComedy', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            dailyLive: innerObj.dailyLive,
                            weeklyLive: innerObj.weeklyLive,
                            dailyComedy: innerObj.dailyComedy,
                            weeklyComedy: innerObj.weeklyComedy,
                            date: netAddition.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = netAddition.added_dtm;

                        if (month_from_date === null)
                            month_from_date = netAddition.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPackageWiseObj('net_addition'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeNetAdditionsPaywallWiseReport(rawDataSet, params) {
    console.log('computeNetAdditionsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
    let dayDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
    let weeklyDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
    let monthlyDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.paywall) {
                        innerObj = netAddition.paywall;
                        if (innerObj.comedy){
                            returnData = updateDataArrs(innerObj, 'comedy', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.live){
                            returnData = updateDataArrs(innerObj, 'live', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            comedy: innerObj.comedy,
                            live: innerObj.live,
                            date: netAddition.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = netAddition.added_dtm;

                        if (month_from_date === null)
                            month_from_date = netAddition.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPaywallWiseObj('net_addition'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeNetAdditionsOperatorWiseReport(rawDataSet, params) {
    console.log('computeNetAdditionsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
    let dayDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
    let weeklyDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
    let monthlyDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.operator) {
                        innerObj = netAddition.operator;
                        if (innerObj.telenor){
                            returnData = updateDataArrs(innerObj, 'telenor', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.easypaisa){
                            returnData = updateDataArrs(innerObj, 'easypaisa', 'net_addition', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            telenor: innerObj.telenor,
                            easypaisa: innerObj.easypaisa,
                            date: netAddition.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = netAddition.added_dtm;

                        if (month_from_date === null)
                            month_from_date = netAddition.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectOperatorWiseObj('net_addition'));
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeNetAdditionsReport(rawDataSet, params) {
    console.log('computeNetAdditionsReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { expire: 0, system: 0 };
    let dayDataObj = { expire: 0, system: 0 };
    let weeklyDataObj = { expire: 0, system: 0 };
    let monthlyDataObj = { expire: 0, system: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.netAdditionType) {
                        innerObj = netAddition.netAdditionType;
                        if (innerObj.expire){
                            dataObj.expire = dataObj.expire + innerObj.expire;
                            dayDataObj.expire = dayDataObj.expire + innerObj.expire;
                            weeklyDataObj.expire = weeklyDataObj.expire + innerObj.expire;
                            monthlyDataObj.expire = monthlyDataObj.expire + innerObj.expire;
                        }
                        if (innerObj.system){
                            dataObj.system = dataObj.system + innerObj.system;
                            dayDataObj.system = dayDataObj.system + innerObj.system;
                            weeklyDataObj.system = weeklyDataObj.system + innerObj.system;
                            monthlyDataObj.system = monthlyDataObj.system + innerObj.system;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            expire: innerObj.expire,
                            system: innerObj.system,
                            date: netAddition.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = netAddition.added_dtm;

                        if (month_from_date === null)
                            month_from_date = netAddition.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ expire: 0, system: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ expire: 0, system: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ expire: 0, system: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}

// Transactions Compute Functions
function computeTransactionsSuccessRateReport(rawDataSet, params) {
    console.log('computeTransactionsSuccessRateReport');

}
function computeTransactionsFailureRateReport(rawDataSet, params) {
    console.log('computeTransactionsFailureRateReport');

}
function computeTransactionsSourceWiseReport(rawDataSet, params) {
    console.log('computeTransactionsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let dayDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let weeklyDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let monthlyDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        if (transactions.transactions.source) {
                            innerObj = transactions.transactions.source;
                            if (innerObj.app){
                                dataObj.app = dataObj.app + innerObj.app;
                                dayDataObj.app = dayDataObj.app + innerObj.app;
                                weeklyDataObj.app = weeklyDataObj.app + innerObj.app;
                                monthlyDataObj.app = monthlyDataObj.app + innerObj.app;
                            }
                            if (innerObj.web){
                                dataObj.web = dataObj.web + innerObj.web;
                                dayDataObj.web = dayDataObj.web + innerObj.web;
                                weeklyDataObj.web = weeklyDataObj.web + innerObj.web;
                                monthlyDataObj.web = monthlyDataObj.web + innerObj.web;
                            }
                            if (innerObj.HE){
                                dataObj.HE = dataObj.HE + innerObj.HE;
                                dayDataObj.HE = dayDataObj.HE + innerObj.HE;
                                weeklyDataObj.HE = weeklyDataObj.HE + innerObj.HE;
                                monthlyDataObj.HE = monthlyDataObj.HE + innerObj.HE;
                            }
                            if (innerObj.sms){
                                dataObj.sms = dataObj.sms + innerObj.sms;
                                dayDataObj.sms = dayDataObj.sms + innerObj.sms;
                                weeklyDataObj.sms = weeklyDataObj.sms + innerObj.sms;
                                monthlyDataObj.sms = monthlyDataObj.sms + innerObj.sms;
                            }
                            if (innerObj.gdn2){
                                dataObj.gdn2 = dataObj.gdn2 + innerObj.gdn2;
                                dayDataObj.gdn2 = dayDataObj.gdn2 + innerObj.gdn2;
                                weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + innerObj.gdn2;
                                monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + innerObj.gdn2;
                            }
                            if (innerObj.CP){
                                dataObj.CP = dataObj.CP + innerObj.CP;
                                dayDataObj.CP = dayDataObj.CP + innerObj.CP;
                                weeklyDataObj.CP = weeklyDataObj.CP + innerObj.CP;
                                monthlyDataObj.CP = monthlyDataObj.CP + innerObj.CP;
                            }
                            if (innerObj.null){
                                dataObj.null = dataObj.null + innerObj.null;
                                dayDataObj.null = dayDataObj.null + innerObj.null;
                                weeklyDataObj.null = weeklyDataObj.null + innerObj.null;
                                monthlyDataObj.null = monthlyDataObj.null + innerObj.null;
                            }
                            if (innerObj.affiliate_web){
                                dataObj.affiliate_web = dataObj.affiliate_web + innerObj.affiliate_web;
                                dayDataObj.affiliate_web = dayDataObj.affiliate_web + innerObj.affiliate_web;
                                weeklyDataObj.affiliate_web = weeklyDataObj.affiliate_web + innerObj.affiliate_web;
                                monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + innerObj.affiliate_web;
                            }
                            if (innerObj.system_after_grace_end){
                                dataObj.system_after_grace_end = dataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                dayDataObj.system_after_grace_end = dayDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                weeklyDataObj.system_after_grace_end = weeklyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                monthlyDataObj.system_after_grace_end = monthlyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                app: innerObj.app,
                                web: innerObj.web,
                                HE: innerObj.HE,
                                sms: innerObj.sms,
                                gdn2: innerObj.gdn2,
                                CP: innerObj.CP,
                                null: innerObj.null,
                                affiliate_web: innerObj.affiliate_web,
                                system_after_grace_end: innerObj.system_after_grace_end,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactionsPackageWiseReport(rawDataSet, params) {
    console.log('computeTransactionsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let dayDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let weeklyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let monthlyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        if (transactions.transactions.package) {
                            innerObj = transactions.transactions.package;
                            if (innerObj.dailyLive){
                                dataObj.dailyLive = dataObj.dailyLive + innerObj.dailyLive;
                                dayDataObj.dailyLive = dayDataObj.dailyLive + innerObj.dailyLive;
                                weeklyDataObj.dailyLive = weeklyDataObj.dailyLive + innerObj.dailyLive;
                                monthlyDataObj.dailyLive = monthlyDataObj.dailyLive + innerObj.dailyLive;
                            }
                            if (innerObj.weeklyLive){
                                dataObj.weeklyLive = dataObj.weeklyLive + innerObj.weeklyLive;
                                dayDataObj.weeklyLive = dayDataObj.weeklyLive + innerObj.weeklyLive;
                                weeklyDataObj.weeklyLive = weeklyDataObj.weeklyLive + innerObj.weeklyLive;
                                monthlyDataObj.weeklyLive = monthlyDataObj.weeklyLive + innerObj.weeklyLive;
                            }
                            if (innerObj.dailyComedy){
                                dataObj.dailyComedy = dataObj.dailyComedy + innerObj.dailyComedy;
                                dayDataObj.dailyComedy = dayDataObj.dailyComedy + innerObj.dailyComedy;
                                weeklyDataObj.dailyComedy = weeklyDataObj.dailyComedy + innerObj.dailyComedy;
                                monthlyDataObj.dailyComedy = monthlyDataObj.dailyComedy + innerObj.dailyComedy;
                            }
                            if (innerObj.weeklyComedy){
                                dataObj.weeklyComedy = dataObj.weeklyComedy + innerObj.weeklyComedy;
                                dayDataObj.weeklyComedy = dayDataObj.weeklyComedy + innerObj.weeklyComedy;
                                weeklyDataObj.weeklyComedy = weeklyDataObj.weeklyComedy + innerObj.weeklyComedy;
                                monthlyDataObj.weeklyComedy = monthlyDataObj.weeklyComedy + innerObj.weeklyComedy;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                dailyLive: innerObj.dailyLive,
                                weeklyLive: innerObj.weeklyLive,
                                dailyComedy: innerObj.dailyComedy,
                                weeklyComedy: innerObj.weeklyComedy,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactionsPaywallWiseReport(rawDataSet, params) {
    console.log('computeTransactionsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { live: 0, comedy: 0 };
    let dayDataObj = { live: 0, comedy: 0 };
    let weeklyDataObj = { live: 0, comedy: 0 };
    let monthlyDataObj = { live: 0, comedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        if (transactions.transactions.paywall) {
                            innerObj = transactions.transactions.paywall;
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
                                live: innerObj.live,
                                comedy: innerObj.comedy,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ live: 0, comedy: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ live: 0, comedy: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ live: 0, comedy: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactionsOperatorWiseReport(rawDataSet, params) {
    console.log('computeTransactionsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { telenor: 0, easypaisa: 0 };
    let dayDataObj = { telenor: 0, easypaisa: 0 };
    let weeklyDataObj = { telenor: 0, easypaisa: 0 };
    let monthlyDataObj = { telenor: 0, easypaisa: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        if (transactions.transactions.operator) {
                            innerObj = transactions.transactions.operator;
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
                                telenor: innerObj.telenor,
                                easypaisa: innerObj.easypaisa,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ telenor: 0, easypaisa: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ telenor: 0, easypaisa: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ telenor: 0, easypaisa: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactionsPriceWiseWiseReport(rawDataSet, params) {
    console.log('computeTransactionsPriceWiseWiseReport');

}


// Transacting Subscribers Compute Functions
function computeTransactingSubscribersSourceWiseReport(rawDataSet, params) {
    console.log('computeTransactingSubscribersSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let dayDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let weeklyDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };
    let monthlyDataObj = { app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.subscribers) {
                        if (transactions.subscribers.source) {
                            innerObj = transactions.subscribers.source;
                            if (innerObj.app){
                                dataObj.app = dataObj.app + innerObj.app;
                                dayDataObj.app = dayDataObj.app + innerObj.app;
                                weeklyDataObj.app = weeklyDataObj.app + innerObj.app;
                                monthlyDataObj.app = monthlyDataObj.app + innerObj.app;
                            }
                            if (innerObj.web){
                                dataObj.web = dataObj.web + innerObj.web;
                                dayDataObj.web = dayDataObj.web + innerObj.web;
                                weeklyDataObj.web = weeklyDataObj.web + innerObj.web;
                                monthlyDataObj.web = monthlyDataObj.web + innerObj.web;
                            }
                            if (innerObj.HE){
                                dataObj.HE = dataObj.HE + innerObj.HE;
                                dayDataObj.HE = dayDataObj.HE + innerObj.HE;
                                weeklyDataObj.HE = weeklyDataObj.HE + innerObj.HE;
                                monthlyDataObj.HE = monthlyDataObj.HE + innerObj.HE;
                            }
                            if (innerObj.sms){
                                dataObj.sms = dataObj.sms + innerObj.sms;
                                dayDataObj.sms = dayDataObj.sms + innerObj.sms;
                                weeklyDataObj.sms = weeklyDataObj.sms + innerObj.sms;
                                monthlyDataObj.sms = monthlyDataObj.sms + innerObj.sms;
                            }
                            if (innerObj.gdn2){
                                dataObj.gdn2 = dataObj.gdn2 + innerObj.gdn2;
                                dayDataObj.gdn2 = dayDataObj.gdn2 + innerObj.gdn2;
                                weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + innerObj.gdn2;
                                monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + innerObj.gdn2;
                            }
                            if (innerObj.CP){
                                dataObj.CP = dataObj.CP + innerObj.CP;
                                dayDataObj.CP = dayDataObj.CP + innerObj.CP;
                                weeklyDataObj.CP = weeklyDataObj.CP + innerObj.CP;
                                monthlyDataObj.CP = monthlyDataObj.CP + innerObj.CP;
                            }
                            if (innerObj.null){
                                dataObj.null = dataObj.null + innerObj.null;
                                dayDataObj.null = dayDataObj.null + innerObj.null;
                                weeklyDataObj.null = weeklyDataObj.null + innerObj.null;
                                monthlyDataObj.null = monthlyDataObj.null + innerObj.null;
                            }
                            if (innerObj.affiliate_web){
                                dataObj.affiliate_web = dataObj.affiliate_web + innerObj.affiliate_web;
                                dayDataObj.affiliate_web = dayDataObj.affiliate_web + innerObj.affiliate_web;
                                weeklyDataObj.affiliate_web = weeklyDataObj.affiliate_web + innerObj.affiliate_web;
                                monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + innerObj.affiliate_web;
                            }
                            if (innerObj.system_after_grace_end){
                                dataObj.system_after_grace_end = dataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                dayDataObj.system_after_grace_end = dayDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                weeklyDataObj.system_after_grace_end = weeklyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                                monthlyDataObj.system_after_grace_end = monthlyDataObj.system_after_grace_end + innerObj.system_after_grace_end;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                app: innerObj.app,
                                web: innerObj.web,
                                HE: innerObj.HE,
                                sms: innerObj.sms,
                                gdn2: innerObj.gdn2,
                                CP: innerObj.CP,
                                null: innerObj.null,
                                affiliate_web: innerObj.affiliate_web,
                                system_after_grace_end: innerObj.system_after_grace_end,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ app: 0, web: 0, HE: 0, sms: 0, gdn2: 0, CP: 0, null: 0, affiliate_web: 0, system_after_grace_end: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactingSubscribersPackageWiseReport(rawDataSet, params) {
    console.log('computeTransactingSubscribersPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let dayDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let weeklyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let monthlyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.subscribers) {
                        if (transactions.subscribers.package) {
                            innerObj = transactions.subscribers.package;
                            if (innerObj.dailyLive){
                                dataObj.dailyLive = dataObj.dailyLive + innerObj.dailyLive;
                                dayDataObj.dailyLive = dayDataObj.dailyLive + innerObj.dailyLive;
                                weeklyDataObj.dailyLive = weeklyDataObj.dailyLive + innerObj.dailyLive;
                                monthlyDataObj.dailyLive = monthlyDataObj.dailyLive + innerObj.dailyLive;
                            }
                            if (innerObj.weeklyLive){
                                dataObj.weeklyLive = dataObj.weeklyLive + innerObj.weeklyLive;
                                dayDataObj.weeklyLive = dayDataObj.weeklyLive + innerObj.weeklyLive;
                                weeklyDataObj.weeklyLive = weeklyDataObj.weeklyLive + innerObj.weeklyLive;
                                monthlyDataObj.weeklyLive = monthlyDataObj.weeklyLive + innerObj.weeklyLive;
                            }
                            if (innerObj.dailyComedy){
                                dataObj.dailyComedy = dataObj.dailyComedy + innerObj.dailyComedy;
                                dayDataObj.dailyComedy = dayDataObj.dailyComedy + innerObj.dailyComedy;
                                weeklyDataObj.dailyComedy = weeklyDataObj.dailyComedy + innerObj.dailyComedy;
                                monthlyDataObj.dailyComedy = monthlyDataObj.dailyComedy + innerObj.dailyComedy;
                            }
                            if (innerObj.weeklyComedy){
                                dataObj.weeklyComedy = dataObj.weeklyComedy + innerObj.weeklyComedy;
                                dayDataObj.weeklyComedy = dayDataObj.weeklyComedy + innerObj.weeklyComedy;
                                weeklyDataObj.weeklyComedy = weeklyDataObj.weeklyComedy + innerObj.weeklyComedy;
                                monthlyDataObj.weeklyComedy = monthlyDataObj.weeklyComedy + innerObj.weeklyComedy;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                dailyLive: innerObj.dailyLive,
                                weeklyLive: innerObj.weeklyLive,
                                dailyComedy: innerObj.dailyComedy,
                                weeklyComedy: innerObj.weeklyComedy,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactingSubscribersPaywallWiseReport(rawDataSet, params) {
    console.log('computeTransactingSubscribersPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { live: 0, comedy: 0 };
    let dayDataObj = { live: 0, comedy: 0 };
    let weeklyDataObj = { live: 0, comedy: 0 };
    let monthlyDataObj = { live: 0, comedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.subscribers) {
                        if (transactions.subscribers.paywall) {
                            innerObj = transactions.subscribers.paywall;
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
                                live: innerObj.live,
                                comedy: innerObj.comedy,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ live: 0, comedy: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ live: 0, comedy: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ live: 0, comedy: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactingSubscribersOperatorWiseReport(rawDataSet, params) {
    console.log('computeTransactingSubscribersOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { telenor: 0, easypaisa: 0 };
    let dayDataObj = { telenor: 0, easypaisa: 0 };
    let weeklyDataObj = { telenor: 0, easypaisa: 0 };
    let monthlyDataObj = { telenor: 0, easypaisa: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.subscribers) {
                        if (transactions.subscribers.operator) {
                            innerObj = transactions.subscribers.operator;
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
                                telenor: innerObj.telenor,
                                easypaisa: innerObj.easypaisa,
                                date: transactions.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = innerObj.added_dtm;

                            if (month_from_date === null)
                                month_from_date = innerObj.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ telenor: 0, easypaisa: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ telenor: 0, easypaisa: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ telenor: 0, easypaisa: 0 });
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
        return reportsTransformer.transformTheData(false, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Data not exist.');
    }
}
function computeTransactingSubscribersNetTotalWiseReport(rawDataSet, params) {
    console.log('computeTransactingSubscribersNetTotalWiseReport');
}



// Clone Objects to initialise the properties - Unsubscribe
function cloneUnsubscribeObjectSourceWiseObj() {
    return {
        he: 0, na: 0, cc: 0, cp: 0, pwa: 0, mta: 0, app: 0, web: 0, sms: 0, null: 0, null2: 0, gdn2: 0, system: 0,
        ccp_api: 0, CP_null: 0, emptyString: 0, systemExpire: 0, CP_telenorccd: 0, affiliate_web: 0, CP_productccd: 0,
        CP_whatsappccd: 0, CP_ideationccd1: 0, CP_ideationccd2: 0, system_after_grace_end: 0
    }
}

// Clone Objects to initialise the properties - Net Addition or Charge Details
function cloneObjectSourceWiseObj(type) {
    let obj;
    if (type === 'charge_details')
        obj =  { full: 0, micro: 0, total: 0 };
    else if (type === 'net_addition')
        obj =  { expire: 0, system: 0, total: 0 };

    return { app: _.clone(obj), web: _.clone(obj), HE: _.clone(obj), sms: _.clone(obj), gdn2: _.clone(obj), CP: _.clone(obj), null: _.clone(obj), affiliate_web: _.clone(obj), system_after_grace_end: _.clone(obj) }
}
function cloneObjectPackageWiseObj(type) {
    let obj;
    if (type === 'charge_details')
        obj =  { full: 0, micro: 0, total: 0 };
    else if (type === 'net_addition')
        obj =  { expire: 0, system: 0, total: 0 };

    return { dailyLive: _.clone(obj), weeklyLive: _.clone(obj), dailyComedy: _.clone(obj), weeklyComedy: _.clone(obj) }
}
function cloneObjectOperatorWiseObj(type) {
    let obj;
    if (type === 'charge_details')
        obj =  { full: 0, micro: 0, total: 0 };
    else if (type === 'net_addition')
        obj =  { expire: 0, system: 0, total: 0 };

    return { telenor: _.clone(obj), easypaisa: _.clone(obj) }
}
function cloneObjectPaywallWiseObj(type) {
    let obj;
    if (type === 'charge_details')
        obj =  { full: 0, micro: 0, total: 0 };
    else if (type === 'net_addition')
        obj =  { expire: 0, system: 0, total: 0 };

    return { live: _.clone(obj), comedy: _.clone(obj) }
}

// Populate object's properties with data - Net Addition or Charge Details
function updateDataArrs(innerObj, type, mode, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj) {

    let subType;
    subType = (mode === 'charge_details') ? 'full' : 'expire';
    subType = (mode === 'transacting_subscriber') ? 'full' : 'expire';
    if (innerObj[type][subType]){
        dataObj[type][subType] = dataObj[type][subType] + innerObj[type][subType];
        dayDataObj[type][subType] = dayDataObj[type][subType] + innerObj[type][subType];
        weeklyDataObj[type][subType] = weeklyDataObj[type][subType] + innerObj[type][subType];
        monthlyDataObj[type][subType] = monthlyDataObj[type][subType] + innerObj[type][subType];
    }

    subType = (mode === 'charge_details') ? 'micro' : 'system';
    if(innerObj[type][subType]){
        dataObj[type][subType] = dataObj[type][subType] + innerObj[type][subType];
        dayDataObj[type][subType] = dayDataObj[type][subType] + innerObj[type][subType];
        weeklyDataObj[type][subType] = weeklyDataObj[type][subType] + innerObj[type][subType];
        monthlyDataObj[type][subType] = monthlyDataObj[type][subType] + innerObj[type][subType];
    }
    if(innerObj[type].total){
        dataObj[type].total = dataObj[type].total + innerObj[type].total;
        dayDataObj[type].total = dayDataObj[type].total + innerObj[type].total;
        weeklyDataObj[type].total = weeklyDataObj[type].total + innerObj[type].total;
        monthlyDataObj[type].total = monthlyDataObj[type].total + innerObj[type].total;
    }

    return {dataObj: dataObj, dayDataObj: dayDataObj, weeklyDataObj: weeklyDataObj, monthlyDataObj: monthlyDataObj}
}

// Helper Functions
function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

module.exports = {
    generateReportsData: generateReportsData,
};
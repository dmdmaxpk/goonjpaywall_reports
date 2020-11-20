const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Transactions Compute Functions
computeTransactionsSourceWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, successful, sourceObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 };
    let dayDataObj = { app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 };
    let weeklyDataObj = { app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 };
    let monthlyDataObj = { app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                transactions = outerObj.transactions;
                if (transactions.successful) {
                    successful = transactions.successful;
                    for (let j=0; j < successful.length; j++) {
                        sourceObj = successful[j];
                        innerObj = sourceObj.source;
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
                        if (innerObj.ccp_api){
                            dataObj.ccp_api = dataObj.ccp_api + innerObj.ccp_api;
                            dayDataObj.ccp_api = dayDataObj.ccp_api + innerObj.ccp_api;
                            weeklyDataObj.ccp_api = weeklyDataObj.ccp_api + innerObj.ccp_api;
                            monthlyDataObj.ccp_api = monthlyDataObj.ccp_api + innerObj.ccp_api;
                        }
                        if (innerObj.CP_whatsappccd){
                            dataObj.CP_whatsappccd = dataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                            dayDataObj.CP_whatsappccd = dayDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                            weeklyDataObj.CP_whatsappccd = weeklyDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                            monthlyDataObj.CP_whatsappccd = monthlyDataObj.CP_whatsappccd + innerObj.CP_whatsappccd;
                        }
                        if (innerObj.dmdmax){
                            dataObj.dmdmax = dataObj.dmdmax + innerObj.dmdmax;
                            dayDataObj.dmdmax = dayDataObj.dmdmax + innerObj.dmdmax;
                            weeklyDataObj.dmdmax = weeklyDataObj.dmdmax + innerObj.dmdmax;
                            monthlyDataObj.dmdmax = monthlyDataObj.dmdmax + innerObj.dmdmax;
                        }
                        if (innerObj.system){
                            dataObj.system = dataObj.system + innerObj.system;
                            dayDataObj.system = dayDataObj.system + innerObj.system;
                            weeklyDataObj.system = weeklyDataObj.system + innerObj.system;
                            monthlyDataObj.system = monthlyDataObj.system + innerObj.system;
                        }
                        if (innerObj.CP_telenorccd){
                            dataObj.CP_telenorccd = dataObj.CP_telenorccd + innerObj.CP_telenorccd;
                            dayDataObj.CP_telenorccd = dayDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                            weeklyDataObj.CP_telenorccd = weeklyDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                            monthlyDataObj.CP_telenorccd = monthlyDataObj.CP_telenorccd + innerObj.CP_telenorccd;
                        }
                        if (innerObj.CP_productccd){
                            dataObj.CP_productccd = dataObj.CP_productccd + innerObj.CP_productccd;
                            dayDataObj.CP_productccd = dayDataObj.CP_productccd + innerObj.CP_productccd;
                            weeklyDataObj.CP_productccd = weeklyDataObj.CP_productccd + innerObj.CP_productccd;
                            monthlyDataObj.CP_productccd = monthlyDataObj.CP_productccd + innerObj.CP_productccd;
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
                            app: innerObj.app,
                            web: innerObj.web,
                            ccp_api: innerObj.ccp_api,
                            CP_whatsappccd: innerObj.CP_whatsappccd,
                            dmdmax: innerObj.dmdmax,
                            system: innerObj.system,
                            CP_telenorccd: innerObj.CP_telenorccd,
                            CP_productccd: innerObj.CP_productccd,
                            CP_ideationccd1: innerObj.CP_ideationccd1,
                            CP_ideationccd2: innerObj.CP_ideationccd2,
                            system_after_grace_end: innerObj.system_after_grace_end,
                            date: sourceObj.billing_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = sourceObj.billing_dtm;

                        if (month_from_date === null)
                            month_from_date = sourceObj.billing_dtm;
                    }

                    monthNo = new Date(outerObj.date).getMonth() + 1;
                    dayNo = new Date(outerObj.date).getDate();

                    // Monthly Data Count
                    if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                        monthlyDataObj.from_date = month_from_date;
                        monthlyDataObj.to_date = outerObj.date;
                        monthWiseTotalCount.push(_.clone(monthlyDataObj));
                        monthlyDataObj = _.clone({ app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 });
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0){
                        weeklyDataObj.from_date = week_from_date;
                        weeklyDataObj.to_date = outerObj.date;
                        weekWiseTotalCount.push(_.clone(weeklyDataObj));
                        weeklyDataObj = _.clone({ app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 });
                        week_from_date = null;
                    }

                    // Day Wise Date Count
                    dayDataObj.date = outerObj.date;
                    dayWiseTotalCount.push(_.clone(dayDataObj));
                    dayDataObj = _.clone({ app: 0, web: 0, ccp_api: 0, CP_whatsappccd: 0, dmdmax: 0, system: 0, CP_telenorccd: 0, CP_productccd: 0, CP_ideationccd1: 0 , CP_ideationccd2: 0 , system_after_grace_end: 0 });
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
        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactionsPackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, successful, packageObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let dayDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let weeklyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };
    let monthlyDataObj = { dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                transactions = outerObj.transactions;
                if (transactions.successful) {
                    successful = transactions.successful;
                    for (let j = 0; j < successful.length; j++) {
                        packageObj = successful[j];
                        innerObj = packageObj.package;
                        if (innerObj.dailyLive) {
                            dataObj.dailyLive = dataObj.dailyLive + innerObj.dailyLive;
                            dayDataObj.dailyLive = dayDataObj.dailyLive + innerObj.dailyLive;
                            weeklyDataObj.dailyLive = weeklyDataObj.dailyLive + innerObj.dailyLive;
                            monthlyDataObj.dailyLive = monthlyDataObj.dailyLive + innerObj.dailyLive;
                        }
                        if (innerObj.weeklyLive) {
                            dataObj.weeklyLive = dataObj.weeklyLive + innerObj.weeklyLive;
                            dayDataObj.weeklyLive = dayDataObj.weeklyLive + innerObj.weeklyLive;
                            weeklyDataObj.weeklyLive = weeklyDataObj.weeklyLive + innerObj.weeklyLive;
                            monthlyDataObj.weeklyLive = monthlyDataObj.weeklyLive + innerObj.weeklyLive;
                        }
                        if (innerObj.dailyComedy) {
                            dataObj.dailyComedy = dataObj.dailyComedy + innerObj.dailyComedy;
                            dayDataObj.dailyComedy = dayDataObj.dailyComedy + innerObj.dailyComedy;
                            weeklyDataObj.dailyComedy = weeklyDataObj.dailyComedy + innerObj.dailyComedy;
                            monthlyDataObj.dailyComedy = monthlyDataObj.dailyComedy + innerObj.dailyComedy;
                        }
                        if (innerObj.weeklyComedy) {
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
                            date: packageObj.billing_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = packageObj.billing_dtm;

                        if (month_from_date === null)
                            month_from_date = packageObj.billing_dtm;
                    }

                    monthNo = new Date(outerObj.date).getMonth() + 1;
                    dayNo = new Date(outerObj.date).getDate();

                    // Monthly Data Count
                    if (Number(dayNo) === Number(helper.getDaysInMonth(monthNo))) {
                        monthlyDataObj.from_date = month_from_date;
                        monthlyDataObj.to_date = outerObj.date;
                        monthWiseTotalCount.push(_.clone(monthlyDataObj));
                        monthlyDataObj = _.clone({dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0) {
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
computeTransactionsPaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, successful, paywallObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { live: 0, comedy: 0 };
    let dayDataObj = { live: 0, comedy: 0 };
    let weeklyDataObj = { live: 0, comedy: 0 };
    let monthlyDataObj = { live: 0, comedy: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                transactions = outerObj.transactions;
                if (transactions.successful) {
                    successful = transactions.successful;
                    for (let j = 0; j < successful.length; j++) {
                        paywallObj = successful[j];
                        innerObj = paywallObj.paywall;

                        if (innerObj.live) {
                            dataObj.live = dataObj.live + innerObj.live;
                            dayDataObj.live = dayDataObj.live + innerObj.live;
                            weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                            monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                        }
                        if (innerObj.comedy) {
                            dataObj.comedy = dataObj.comedy + innerObj.comedy;
                            dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                            weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                            monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            live: innerObj.live,
                            comedy: innerObj.comedy,
                            date: paywallObj.billing_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = paywallObj.billing_dtm;

                        if (month_from_date === null)
                            month_from_date = paywallObj.billing_dtm;
                    }

                    monthNo = new Date(outerObj.date).getMonth() + 1;
                    dayNo = new Date(outerObj.date).getDate();

                    // Monthly Data Count
                    if (Number(dayNo) === Number(helper.getDaysInMonth(monthNo))) {
                        monthlyDataObj.from_date = month_from_date;
                        monthlyDataObj.to_date = outerObj.date;
                        monthWiseTotalCount.push(_.clone(monthlyDataObj));
                        monthlyDataObj = _.clone({live: 0, comedy: 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0) {
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
computeTransactionsOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, successful, operatorObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { telenor: 0, easypaisa: 0 };
    let dayDataObj = { telenor: 0, easypaisa: 0 };
    let weeklyDataObj = { telenor: 0, easypaisa: 0 };
    let monthlyDataObj = { telenor: 0, easypaisa: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                transactions = outerObj.transactions;
                if (transactions.successful) {
                    successful = transactions.successful;
                    for (let j = 0; j < successful.length; j++) {
                        operatorObj = successful[j];
                        innerObj = operatorObj.operator;

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
                            date: operatorObj.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = operatorObj.added_dtm;

                        if (month_from_date === null)
                            month_from_date = operatorObj.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactionsPriceWiseWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsPriceWiseWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let dayDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let weeklyDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let monthlyDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        if (transactions.transactions.price) {
                            innerObj = transactions.transactions.price;
                            if (innerObj['15']){
                                dataObj['15'] = dataObj['15'] + innerObj['15'];
                                dayDataObj['15'] = dayDataObj['15'] + innerObj['15'];
                                weeklyDataObj['15'] = weeklyDataObj['15'] + innerObj['15'];
                                monthlyDataObj['15'] = monthlyDataObj['15'] + innerObj['15'];
                            }
                            if (innerObj['11']){
                                dataObj['11'] = dataObj['11'] + innerObj['11'];
                                dayDataObj['11'] = dayDataObj['11'] + innerObj['11'];
                                weeklyDataObj['11'] = weeklyDataObj['11'] + innerObj['11'];
                                monthlyDataObj['11'] = monthlyDataObj['11'] + innerObj['11'];
                            }
                            if (innerObj['10']){
                                dataObj['10'] = dataObj['10'] + innerObj['10'];
                                dayDataObj['10'] = dayDataObj['10'] + innerObj['10'];
                                weeklyDataObj['10'] = weeklyDataObj['10'] + innerObj['10'];
                                monthlyDataObj['10'] = monthlyDataObj['10'] + innerObj['10'];
                            }
                            if (innerObj['7']){
                                dataObj['7'] = dataObj['7'] + innerObj['7'];
                                dayDataObj['7'] = dayDataObj['7'] + innerObj['7'];
                                weeklyDataObj['7'] = weeklyDataObj['7'] + innerObj['7'];
                                monthlyDataObj['7'] = monthlyDataObj['7'] + innerObj['7'];
                            }
                            if (innerObj['5']){
                                dataObj['5'] = dataObj['5'] + innerObj['5'];
                                dayDataObj['5'] = dayDataObj['5'] + innerObj['5'];
                                weeklyDataObj['5'] = weeklyDataObj['5'] + innerObj['5'];
                                monthlyDataObj['5'] = monthlyDataObj['5'] + innerObj['5'];
                            }
                            if (innerObj['4']){
                                dataObj['4'] = dataObj['4'] + innerObj['4'];
                                dayDataObj['4'] = dayDataObj['4'] + innerObj['4'];
                                weeklyDataObj['4'] = weeklyDataObj['4'] + innerObj['4'];
                                monthlyDataObj['4'] = monthlyDataObj['4'] + innerObj['4'];
                            }
                            if (innerObj['2']){
                                dataObj['2'] = dataObj['2'] + innerObj['2'];
                                dayDataObj['2'] = dayDataObj['2'] + innerObj['2'];
                                weeklyDataObj['2'] = weeklyDataObj['2'] + innerObj['2'];
                                monthlyDataObj['2'] = monthlyDataObj['2'] + innerObj['2'];
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                '15': innerObj['15']|| 0,
                                '11': innerObj['11']|| 0,
                                '10': innerObj['10']|| 0,
                                '7': innerObj['7']|| 0,
                                '5': innerObj['5']|| 0,
                                '4': innerObj['4']|| 0,
                                '2': innerObj['2']|| 0,
                                date: transactions.added_dtm
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = transactions.added_dtm;

                            if (month_from_date === null)
                                month_from_date = transactions.added_dtm;
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
                    monthlyDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
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
computeTransactionsAvgReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsAvgReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0};
    let dayDataObj = {totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0};
    let weeklyDataObj = {totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0};
    let monthlyDataObj = {totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.avgTransactions){
                innerObj = outerObj.avgTransactions[0];

                if (innerObj.totalTransactions){
                    dataObj.totalTransactions = dataObj.totalTransactions + innerObj.totalTransactions;
                    dayDataObj.totalTransactions = dayDataObj.totalTransactions + innerObj.totalTransactions;
                    weeklyDataObj.totalTransactions = weeklyDataObj.totalTransactions + innerObj.totalTransactions;
                    monthlyDataObj.totalTransactions = monthlyDataObj.totalTransactions + innerObj.totalTransactions;
                }
                if (innerObj.uniqueSubscribers){
                    dataObj.uniqueSubscribers = dataObj.uniqueSubscribers + innerObj.uniqueSubscribers;
                    dayDataObj.uniqueSubscribers = dayDataObj.uniqueSubscribers + innerObj.uniqueSubscribers;
                    weeklyDataObj.uniqueSubscribers = weeklyDataObj.uniqueSubscribers + innerObj.uniqueSubscribers;
                    monthlyDataObj.uniqueSubscribers = monthlyDataObj.uniqueSubscribers + innerObj.uniqueSubscribers;
                }
                if (innerObj.totalPrice){
                    dataObj.totalPrice = dataObj.totalPrice + innerObj.totalPrice;
                    dayDataObj.totalPrice = dayDataObj.totalPrice + innerObj.totalPrice;
                    weeklyDataObj.totalPrice = weeklyDataObj.totalPrice + innerObj.totalPrice;
                    monthlyDataObj.totalPrice = monthlyDataObj.totalPrice + innerObj.totalPrice;
                }
                if (innerObj.avg_transactions){
                    dataObj.avg_transactions = dataObj.avg_transactions + innerObj.avg_transactions;
                    dayDataObj.avg_transactions = dayDataObj.avg_transactions + innerObj.avg_transactions;
                    weeklyDataObj.avg_transactions = weeklyDataObj.avg_transactions + innerObj.avg_transactions;
                    monthlyDataObj.avg_transactions = monthlyDataObj.avg_transactions + innerObj.avg_transactions;
                }
                if (innerObj.avg_value){
                    dataObj.avg_value = dataObj.avg_value + innerObj.avg_value;
                    dayDataObj.avg_value = dayDataObj.avg_value + innerObj.avg_value;
                    weeklyDataObj.avg_value = weeklyDataObj.avg_value + innerObj.avg_value;
                    monthlyDataObj.avg_value = monthlyDataObj.avg_value + innerObj.avg_value;
                }

                // reset start_date for both month & week so can update with latest one
                if (week_from_date === null)
                    week_from_date = innerObj.added_dtm;

                if (month_from_date === null)
                    month_from_date = innerObj.added_dtm;

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalTransactions: 0, uniqueSubscribers: 0, totalPrice: 0, avg_transactions: 0, avg_value: 0});
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
computeTransactionsRateReport = async (rawDataSet, params) =>{
    console.log('computeTransactionsRateReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { successRate: 0, failureRate: 0, netTotal: 0 };
    let dayDataObj = { successRate: 0, failureRate: 0, netTotal: 0 };
    let weeklyDataObj = { successRate: 0, failureRate: 0, netTotal: 0 };
    let monthlyDataObj = { successRate: 0, failureRate: 0, netTotal: 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.transactions) {
                        innerObj = transactions.transactions;

                        if (innerObj.successRate){
                            dataObj.successRate = dataObj.successRate + innerObj.successRate;
                            dayDataObj.successRate = dayDataObj.successRate + innerObj.successRate;
                            weeklyDataObj.successRate = weeklyDataObj.successRate + innerObj.successRate;
                            monthlyDataObj.successRate = monthlyDataObj.successRate + innerObj.successRate;
                        }
                        if (innerObj.failureRate){
                            dataObj.failureRate = dataObj.failureRate + innerObj.failureRate;
                            dayDataObj.failureRate = dayDataObj.failureRate + innerObj.failureRate;
                            weeklyDataObj.failureRate = weeklyDataObj.failureRate + innerObj.failureRate;
                            monthlyDataObj.failureRate = monthlyDataObj.failureRate + innerObj.failureRate;
                        }
                        if (innerObj.netTotal){
                            dataObj.netTotal = dataObj.netTotal + innerObj.netTotal;
                            dayDataObj.netTotal = dayDataObj.netTotal + innerObj.netTotal;
                            weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.netTotal;
                            monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.netTotal;
                        }


                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            successRate: innerObj.successRate,
                            failureRate: innerObj.failureRate,
                            netTotal: innerObj.netTotal,
                            date: transactions.added_dtm
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = transactions.added_dtm;

                        if (month_from_date === null)
                            month_from_date = transactions.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({ successRate: 0, failureRate: 0, netTotal: 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ successRate: 0, failureRate: 0, netTotal: 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ successRate: 0, failureRate: 0, netTotal: 0 });
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

// Transacting Subscribers Compute Functions
computeTransactingSubscribersSourceWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactingSubscribersPackageWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactingSubscribersPaywallWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactingSubscribersOperatorWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeTransactingSubscribersPriceWiseReport = async (rawDataSet, params) =>{
    console.log('computeTransactingSubscribersPriceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, transactions, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let dayDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let weeklyDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };
    let monthlyDataObj = { '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 };

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.transactions){
                for (let j=0; j<outerObj.transactions.length; j++) {
                    transactions = outerObj.transactions[j];
                    if (transactions.subscribers) {
                        if (transactions.subscribers.price) {
                            innerObj = transactions.subscribers.price;
                            if (innerObj['15']){
                                dataObj['15'] = dataObj['15'] + innerObj['15'];
                                dayDataObj['15'] = dayDataObj['15'] + innerObj['15'];
                                weeklyDataObj['15'] = weeklyDataObj['15'] + innerObj['15'];
                                monthlyDataObj['15'] = monthlyDataObj['15'] + innerObj['15'];
                            }
                            if (innerObj['11']){
                                dataObj['11'] = dataObj['11'] + innerObj['11'];
                                dayDataObj['11'] = dayDataObj['11'] + innerObj['11'];
                                weeklyDataObj['11'] = weeklyDataObj['11'] + innerObj['11'];
                                monthlyDataObj['11'] = monthlyDataObj['11'] + innerObj['11'];
                            }
                            if (innerObj['10']){
                                dataObj['10'] = dataObj['10'] + innerObj['10'];
                                dayDataObj['10'] = dayDataObj['10'] + innerObj['10'];
                                weeklyDataObj['10'] = weeklyDataObj['10'] + innerObj['10'];
                                monthlyDataObj['10'] = monthlyDataObj['10'] + innerObj['10'];
                            }
                            if (innerObj['7']){
                                dataObj['7'] = dataObj['7'] + innerObj['7'];
                                dayDataObj['7'] = dayDataObj['7'] + innerObj['7'];
                                weeklyDataObj['7'] = weeklyDataObj['7'] + innerObj['7'];
                                monthlyDataObj['7'] = monthlyDataObj['7'] + innerObj['7'];
                            }
                            if (innerObj['5']){
                                dataObj['5'] = dataObj['5'] + innerObj['5'];
                                dayDataObj['5'] = dayDataObj['5'] + innerObj['5'];
                                weeklyDataObj['5'] = weeklyDataObj['5'] + innerObj['5'];
                                monthlyDataObj['5'] = monthlyDataObj['5'] + innerObj['5'];
                            }
                            if (innerObj['4']){
                                dataObj['4'] = dataObj['4'] + innerObj['4'];
                                dayDataObj['4'] = dayDataObj['4'] + innerObj['4'];
                                weeklyDataObj['4'] = weeklyDataObj['4'] + innerObj['4'];
                                monthlyDataObj['4'] = monthlyDataObj['4'] + innerObj['4'];
                            }
                            if (innerObj['2']){
                                dataObj['2'] = dataObj['2'] + innerObj['2'];
                                dayDataObj['2'] = dayDataObj['2'] + innerObj['2'];
                                weeklyDataObj['2'] = weeklyDataObj['2'] + innerObj['2'];
                                monthlyDataObj['2'] = monthlyDataObj['2'] + innerObj['2'];
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                '15': innerObj['15'],
                                '11': innerObj['11'],
                                '10': innerObj['10'],
                                '7': innerObj['7'],
                                '5': innerObj['5'],
                                '4': innerObj['4'],
                                '2': innerObj['2'],
                                date: transactions.added_dtm
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = transactions.added_dtm;

                            if (month_from_date === null)
                                month_from_date = transactions.added_dtm;
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
                    monthlyDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({ '15': 0, '11': 0, '10': 0, '7': 0, '5': 0, '4': 0, '2': 0 });
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
    computeTransactionsSourceWiseReport: computeTransactionsSourceWiseReport,
    computeTransactionsPackageWiseReport: computeTransactionsPackageWiseReport,
    computeTransactionsPaywallWiseReport: computeTransactionsPaywallWiseReport,
    computeTransactionsOperatorWiseReport: computeTransactionsOperatorWiseReport,
    computeTransactionsPriceWiseWiseReport: computeTransactionsPriceWiseWiseReport,
    computeRevenueBillingStatusWiseReport: computeRevenueBillingStatusWiseReport,
    computeTransactionsAvgReport: computeTransactionsAvgReport,
    computeTransactionsRateReport: computeTransactionsRateReport,

    computeTransactingSubscribersSourceWiseReport: computeTransactingSubscribersSourceWiseReport,
    computeTransactingSubscribersPackageWiseReport: computeTransactingSubscribersPackageWiseReport,
    computeTransactingSubscribersPaywallWiseReport: computeTransactingSubscribersPaywallWiseReport,
    computeTransactingSubscribersOperatorWiseReport: computeTransactingSubscribersOperatorWiseReport,
    computeTransactingSubscribersPriceWiseReport: computeTransactingSubscribersPriceWiseReport,
};
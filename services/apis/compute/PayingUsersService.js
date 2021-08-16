const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Paying User Compute Functions
computePayingUsersCountSourceWiseReport = async (rawDataSet, params, userType, reportType) =>{
    console.log('computePayingUsersCountSourceWiseReport');

    let sourceWiseObj, monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    let dayDataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    let weeklyDataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    let monthlyDataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj[userType]){
                for (let j=0; j<outerObj[userType].length; j++) {
                    innerObj = outerObj[userType][j];
                    if (innerObj.source) {
                        sourceWiseObj = innerObj.source;
                        if (sourceWiseObj.app) {
                            dataObj.app = dataObj.app + sourceWiseObj.app[reportType];
                            dayDataObj.app = dayDataObj.app + sourceWiseObj.app[reportType];
                            weeklyDataObj.app = weeklyDataObj.app + sourceWiseObj.app[reportType];
                            monthlyDataObj.app = monthlyDataObj.app + sourceWiseObj.app[reportType];
                        }
                        if (sourceWiseObj.web) {
                            dataObj.web = dataObj.web + sourceWiseObj.web[reportType];
                            dayDataObj.web = dayDataObj.web + sourceWiseObj.web[reportType];
                            weeklyDataObj.web = weeklyDataObj.web + sourceWiseObj.web[reportType];
                            monthlyDataObj.web = monthlyDataObj.web + sourceWiseObj.web[reportType];
                        }
                        if (sourceWiseObj.he) {
                            dataObj.he = dataObj.he + sourceWiseObj.he[reportType];
                            dayDataObj.he = dayDataObj.he + sourceWiseObj.he[reportType];
                            weeklyDataObj.he = weeklyDataObj.he + sourceWiseObj.he[reportType];
                            monthlyDataObj.he = monthlyDataObj.he + sourceWiseObj.he[reportType];
                        }
                        if (sourceWiseObj.gdn2) {
                            dataObj.gdn2 = dataObj.gdn2 + sourceWiseObj.gdn2[reportType];
                            dayDataObj.gdn2 = dayDataObj.gdn2 + sourceWiseObj.gdn2[reportType];
                            weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + sourceWiseObj.gdn2[reportType];
                            monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + sourceWiseObj.gdn2[reportType];
                        }
                        if (sourceWiseObj.tp_gdn) {
                            dataObj.tp_gdn = dataObj.tp_gdn + sourceWiseObj.tp_gdn[reportType];
                            dayDataObj.tp_gdn = dayDataObj.tp_gdn + sourceWiseObj.tp_gdn[reportType];
                            weeklyDataObj.tp_gdn = weeklyDataObj.tp_gdn + sourceWiseObj.tp_gdn[reportType];
                            monthlyDataObj.tp_gdn = monthlyDataObj.tp_gdn + sourceWiseObj.tp_gdn[reportType];
                        }
                        if (sourceWiseObj.affiliate_web) {
                            dataObj.affiliate_web = dataObj.affiliate_web + sourceWiseObj.affiliate_web[reportType];
                            dayDataObj.affiliate_web = dayDataObj.affiliate_web + sourceWiseObj.affiliate_web[reportType];
                            weeklyDataObj.affiliate_web = weeklyDataObj.affiliate_web + sourceWiseObj.affiliate_web[reportType];
                            monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + sourceWiseObj.affiliate_web[reportType];
                        }
                        if (sourceWiseObj.others) {
                            dataObj.others = dataObj.others + sourceWiseObj.others[reportType];
                            dayDataObj.others = dayDataObj.others + sourceWiseObj.others[reportType];
                            weeklyDataObj.others = weeklyDataObj.others + sourceWiseObj.others[reportType];
                            monthlyDataObj.others = monthlyDataObj.others + sourceWiseObj.others[reportType];
                        }
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success, expired: innerObj.expired,
                    //     churn: innerObj.churn, date: outerObj.date
                    // });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;
                }
                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0});
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computePayingUsersCountPackageWiseReport = async (rawDataSet, params, userType, reportType) =>{
    console.log('computePayingUsersCountPackageWiseReport');

    let packageWiseObj, monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let dayDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let weeklyDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    let monthlyDataObj = {dailyLive: 0, weeklyLive: 0, dailyComedy: 0, weeklyComedy: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj[userType]){
                for (let j=0; j<outerObj[userType].length; j++) {
                    innerObj = outerObj[userType][j];
                    if (innerObj.package) {
                        packageWiseObj = innerObj.package;

                        console.log('reportType: ', reportType);
                        console.log('packageWiseObj.dailyLive[reportType]: ', packageWiseObj.dailyLive[reportType]);
                        if (packageWiseObj.dailyLive) {
                            dataObj.dailyLive = dataObj.dailyLive + packageWiseObj.dailyLive[reportType];
                            dayDataObj.dailyLive = dayDataObj.dailyLive + packageWiseObj.dailyLive[reportType];
                            weeklyDataObj.dailyLive = weeklyDataObj.dailyLive + packageWiseObj.dailyLive[reportType];
                            monthlyDataObj.dailyLive = monthlyDataObj.dailyLive + packageWiseObj.dailyLive[reportType];
                        }
                        if (packageWiseObj.weeklyLive) {
                            dataObj.weeklyLive = dataObj.weeklyLive + packageWiseObj.weeklyLive[reportType];
                            dayDataObj.weeklyLive = dayDataObj.weeklyLive + packageWiseObj.weeklyLive[reportType];
                            weeklyDataObj.weeklyLive = weeklyDataObj.weeklyLive + packageWiseObj.weeklyLive[reportType];
                            monthlyDataObj.weeklyLive = monthlyDataObj.weeklyLive + packageWiseObj.weeklyLive[reportType];
                        }
                        if (packageWiseObj.dailyComedy) {
                            dataObj.dailyComedy = dataObj.dailyComedy + packageWiseObj.dailyComedy[reportType];
                            dayDataObj.dailyComedy = dayDataObj.dailyComedy + packageWiseObj.dailyComedy[reportType];
                            weeklyDataObj.dailyComedy = weeklyDataObj.dailyComedy + packageWiseObj.dailyComedy[reportType];
                            monthlyDataObj.dailyComedy = monthlyDataObj.dailyComedy + packageWiseObj.dailyComedy[reportType];
                        }
                        if (packageWiseObj.weeklyComedy) {
                            dataObj.weeklyComedy = dataObj.weeklyComedy + packageWiseObj.weeklyComedy[reportType];
                            dayDataObj.weeklyComedy = dayDataObj.weeklyComedy + packageWiseObj.weeklyComedy[reportType];
                            weeklyDataObj.weeklyComedy = weeklyDataObj.weeklyComedy + packageWiseObj.weeklyComedy[reportType];
                            monthlyDataObj.weeklyComedy = monthlyDataObj.weeklyComedy + packageWiseObj.weeklyComedy[reportType];
                        }
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success, expired: innerObj.expired,
                    //     churn: innerObj.churn, date: outerObj.date
                    // });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;
                }
                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computePayingUsersCountPaywallWiseReport = async (rawDataSet, params, userType, reportType) =>{
    console.log('computePayingUsersCountPaywallWiseReport');

    let paywallWiseObj, monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {comedy: 0, live: 0};
    let dayDataObj = {comedy: 0, live: 0};
    let weeklyDataObj = {comedy: 0, live: 0};
    let monthlyDataObj = {comedy: 0, live: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj[userType]){
                for (let j=0; j<outerObj[userType].length; j++) {
                    innerObj = outerObj[userType][j];
                    if (innerObj.paywall) {
                        paywallWiseObj = innerObj.paywall;
                        if (paywallWiseObj.comedy) {
                            dataObj.comedy = dataObj.comedy + paywallWiseObj.comedy[reportType];
                            dayDataObj.comedy = dayDataObj.comedy + paywallWiseObj.comedy[reportType];
                            weeklyDataObj.comedy = weeklyDataObj.comedy + paywallWiseObj.comedy[reportType];
                            monthlyDataObj.comedy = monthlyDataObj.comedy + paywallWiseObj.comedy[reportType];
                        }
                        if (paywallWiseObj.live) {
                            dataObj.live = dataObj.live + paywallWiseObj.live[reportType];
                            dayDataObj.live = dayDataObj.live + paywallWiseObj.live[reportType];
                            weeklyDataObj.live = weeklyDataObj.live + paywallWiseObj.live[reportType];
                            monthlyDataObj.live = monthlyDataObj.live + paywallWiseObj.live[reportType];
                        }
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success, expired: innerObj.expired,
                    //     churn: innerObj.churn, date: outerObj.date
                    // });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;
                }
                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({comedy: 0, live: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({comedy: 0, live: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({comedy: 0, live: 0});
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computePayingUsersCountOperatorWiseWiseReport = async (rawDataSet, params, userType, reportType) =>{
    console.log('computePayingUsersCountOperatorWiseWiseReport');

    let operatorWiseObj, monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {telenor: 0, easypaisa: 0};
    let dayDataObj = {telenor: 0, easypaisa: 0};
    let weeklyDataObj = {telenor: 0, easypaisa: 0};
    let monthlyDataObj = {telenor: 0, easypaisa: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj[userType]){
                for (let j=0; j<outerObj[userType].length; j++) {
                    innerObj = outerObj[userType][j];
                    if (innerObj.operator) {
                        operatorWiseObj = innerObj.operator;
                        if (operatorWiseObj.telenor) {
                            dataObj.telenor = dataObj.telenor + operatorWiseObj.telenor[reportType];
                            dayDataObj.telenor = dayDataObj.telenor + operatorWiseObj.telenor[reportType];
                            weeklyDataObj.telenor = weeklyDataObj.telenor + operatorWiseObj.telenor[reportType];
                            monthlyDataObj.telenor = monthlyDataObj.telenor + operatorWiseObj.telenor[reportType];
                        }
                        if (operatorWiseObj.easypaisa) {
                            dataObj.easypaisa = dataObj.easypaisa + operatorWiseObj.easypaisa[reportType];
                            dayDataObj.easypaisa = dayDataObj.easypaisa + operatorWiseObj.easypaisa[reportType];
                            weeklyDataObj.easypaisa = weeklyDataObj.easypaisa + operatorWiseObj.easypaisa[reportType];
                            monthlyDataObj.easypaisa = monthlyDataObj.easypaisa + operatorWiseObj.easypaisa[reportType];
                        }
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success, expired: innerObj.expired,
                    //     churn: innerObj.churn, date: outerObj.date
                    // });

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;
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
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computePayingUsersSessionsTimeReport = async (rawDataSet, params, sessionType) =>{
    console.log('computePayingUsersSessionsTimeReport');

    let obj, monthNo, dayNo, week_from_date = null, month_from_date = null, week_days_sum = 0, month_days_sum = 0;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {session: '', sum: 0, turns: 0, average: 0};
    let dayDataObj = {session: '', sum: 0, turns: 0, average: 0};
    let weeklyDataObj = {session: '', sum: 0, turns: 0, average: 0};
    let monthlyDataObj = {session: '', sum: 0, turns: 0, average: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.userSessions){
                for (let j=0; j<outerObj.userSessions.length; j++) {
                    innerObj = outerObj.userSessions[j];
                    if (innerObj[sessionType]) {
                        obj = innerObj[sessionType];
                        dataObj.session = obj.session;
                        dataObj.sum = dataObj.sum + obj.sum;
                        dataObj.turns = dataObj.turns + obj.turn;

                        dayDataObj.session = obj.session;
                        dayDataObj.sum = dayDataObj.sum + obj.sum;
                        dayDataObj.turns = dayDataObj.turns + obj.turn;
                        dayDataObj.average = (dayDataObj.average + obj.avg).toFixed(2);

                        weeklyDataObj.session = obj.session;
                        weeklyDataObj.sum = weeklyDataObj.sum + obj.sum;
                        weeklyDataObj.turns = weeklyDataObj.turns + obj.turn;

                        monthlyDataObj.session = obj.session;
                        monthlyDataObj.sum = monthlyDataObj.sum + obj.sum;
                        monthlyDataObj.turns = monthlyDataObj.turns + obj.turn;
                    }

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;

                    week_days_sum = week_days_sum + 1;
                    month_days_sum = month_days_sum + 1;
                }
                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.average = (monthlyDataObj.sum / monthlyDataObj.turns).toFixed(2);
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
                    month_from_date = null;
                    month_days_sum = 0;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.average = (weeklyDataObj.sum / weeklyDataObj.turns).toFixed(2);
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
                    week_from_date = null;
                    week_days_sum = 0;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.average = (weeklyDataObj.sum / weeklyDataObj.turns).toFixed(2);
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.average = (monthlyDataObj.sum / monthlyDataObj.turns).toFixed(2);
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // Total Count Data
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.average = (dataObj.sum / dataObj.turns).toFixed(2);
        dataObj.from_date = params.from_date;
        dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computePayingUsersWatchTimeReport = async (rawDataSet, params, sessionType) =>{
    console.log('computePayingUsersWatchTimeReport');

    let obj, monthNo, dayNo, week_from_date = null, month_from_date = null, week_days_sum = 0, month_days_sum = 0;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {session: '', sum: 0, turns: 0, average: 0};
    let dayDataObj = {session: '', sum: 0, turns: 0, average: 0};
    let weeklyDataObj = {session: '', sum: 0, turns: 0, average: 0};
    let monthlyDataObj = {session: '', sum: 0, turns: 0, average: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.watchTime){
                for (let j=0; j<outerObj.watchTime.length; j++) {
                    innerObj = outerObj.watchTime[j];
                    if (innerObj[sessionType]) {
                        obj = innerObj[sessionType];

                        dataObj.session = obj.session;
                        dataObj.sum = dataObj.sum + obj.sum;
                        dataObj.turns = dataObj.turns + obj.turn;

                        dayDataObj.session = obj.session;
                        dayDataObj.sum = dayDataObj.sum + obj.sum;
                        dayDataObj.turns = dayDataObj.turns + obj.turn;
                        dayDataObj.average = (dayDataObj.average + obj.avg).toFixed(2);

                        weeklyDataObj.session = obj.session;
                        weeklyDataObj.sum = weeklyDataObj.sum + obj.sum;
                        weeklyDataObj.turns = weeklyDataObj.turns + obj.turn;

                        monthlyDataObj.session = obj.session;
                        monthlyDataObj.sum = monthlyDataObj.sum + obj.sum;
                        monthlyDataObj.turns = monthlyDataObj.turns + obj.turn;
                    }

                    // reset start_date for both month & week so can update with latest one
                    if (week_from_date === null)
                        week_from_date = outerObj.date;

                    if (month_from_date === null)
                        month_from_date = outerObj.date;

                    week_days_sum = week_days_sum + 1;
                    month_days_sum = month_days_sum + 1;
                }
                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.average = (monthlyDataObj.sum / monthlyDataObj.turns).toFixed(2);
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
                    month_from_date = null;
                    month_days_sum = 0;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.average = (weeklyDataObj.sum / weeklyDataObj.turns).toFixed(2);
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
                    week_from_date = null;
                    week_days_sum = 0;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({session: '', sum: 0, turns: 0, average: 0});
            }
        }

        //Insert last data in week array that is less then one week data
        if (week_from_date !== null){
            weeklyDataObj.average = (weeklyDataObj.sum / weeklyDataObj.turns).toFixed(2);
            weeklyDataObj.from_date = week_from_date;
            weeklyDataObj.to_date = outerObj.date;
            weekWiseTotalCount.push(_.clone(weeklyDataObj));
        }

        //Insert last data in month array that is less then one month data
        if (month_from_date !== null){
            monthlyDataObj.average = (monthlyDataObj.sum / monthlyDataObj.turns).toFixed(2);
            monthlyDataObj.from_date = month_from_date;
            monthlyDataObj.to_date = outerObj.date;
            monthWiseTotalCount.push(_.clone(monthlyDataObj));
        }

        // Total Count Data
        // add date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.average = (dataObj.sum / dataObj.turns).toFixed(2);
        dataObj.from_date = params.from_date;
        dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
module.exports = {
    computePayingUsersCountSourceWiseReport: computePayingUsersCountSourceWiseReport,
    computePayingUsersCountPackageWiseReport: computePayingUsersCountPackageWiseReport,
    computePayingUsersCountPaywallWiseReport: computePayingUsersCountPaywallWiseReport,
    computePayingUsersCountOperatorWiseWiseReport: computePayingUsersCountOperatorWiseWiseReport,

    computePayingUsersSessionsTimeReport: computePayingUsersSessionsTimeReport,
    computePayingUsersWatchTimeReport: computePayingUsersWatchTimeReport,
};
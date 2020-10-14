const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// User Compute Functions
activeInactiveSubscriptionReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
packageWiseSubscriptionReport = async (rawDataSet, params) =>{
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
sourceWiseSubscriptionReport = async (rawDataSet, params) =>{
    console.log('sourceWiseSubscriptionReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, subscription, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dayDataObj = {app: 0, web: 0, gdn2: 0, HE: 0, affiliate_web: 0};
    let dataObj = {app: 0, web: 0, gdn2: 0, HE: 0, affiliate_web: 0};
    let weeklyDataObj = {app: 0, web: 0, gdn2: 0, HE: 0, affiliate_web: 0};
    let monthlyDataObj = {app: 0, web: 0, gdn2: 0, HE: 0, affiliate_web: 0};

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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
paywallWiseSubscriptionReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
affliateMidWiseSubscriptionReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
computeUnSubscriptionsSourceWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
callbackSendSubscriptionReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};
successRateSubscriptionReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};

// Clone Objects to initialise the properties - Unsubscribe
function cloneUnsubscribeObjectSourceWiseObj() {
    return {
        he: 0, na: 0, cc: 0, cp: 0, pwa: 0, mta: 0, app: 0, web: 0, sms: 0, null: 0, null2: 0, gdn2: 0, system: 0,
        ccp_api: 0, CP_null: 0, emptyString: 0, systemExpire: 0, CP_telenorccd: 0, affiliate_web: 0, CP_productccd: 0,
        CP_whatsappccd: 0, CP_ideationccd1: 0, CP_ideationccd2: 0, system_after_grace_end: 0
    }
}

module.exports = {
    activeInactiveSubscriptionReport: activeInactiveSubscriptionReport,
    packageWiseSubscriptionReport: packageWiseSubscriptionReport,
    sourceWiseSubscriptionReport: sourceWiseSubscriptionReport,
    paywallWiseSubscriptionReport: paywallWiseSubscriptionReport,
    affliateMidWiseSubscriptionReport: affliateMidWiseSubscriptionReport,
    computeUnSubscriptionsSourceWiseReport: computeUnSubscriptionsSourceWiseReport,
    callbackSendSubscriptionReport: callbackSendSubscriptionReport,
    successRateSubscriptionReport: successRateSubscriptionReport,
};
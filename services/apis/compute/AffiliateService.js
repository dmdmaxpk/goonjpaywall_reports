const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// User Compute Functions
computeAffiliateReport = async (rawDataSet, params) =>{
    console.log('computeAffiliateReport', params);

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, computedData, partKey;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneAffiliateObj());
    let dayDataObj = _.clone(cloneAffiliateObj());
    let weeklyDataObj = _.clone(cloneAffiliateObj());
    let monthlyDataObj = _.clone(cloneAffiliateObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];

            //get Affiliate mids total count HE wise
            if (outerObj.helogs) {
                partKey = outerObj.helogs;
                if (partKey.helogsWise) {
                    if (partKey.helogsWise[0]) {
                        innerObj = partKey.helogsWise[0];
                        computedData = computeAffiliateHeData('HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                        dataObj = computedData.dataObj;
                        dayDataObj = computedData.dayDataObj;
                        weeklyDataObj = computedData.weeklyDataObj;
                        monthlyDataObj = computedData.monthlyDataObj;
                    }
                }
            }

            //get Affiliate mids total count Unique Success wise
            if (outerObj.uniqueSuccessHe) {
                partKey = outerObj.uniqueSuccessHe;
                if (partKey.helogsWise) {
                    innerObj = partKey.helogsWise[0];
                    computedData = computeAffiliateHeData('uniqueSuccessHe', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }
            }

            //get Affiliate mids total count Page view wise
            if (outerObj.logsPageView) {
                innerObj = outerObj.logsPageView[0];
                computedData = computeAffiliateHeData('pageViews', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            //get Affiliate mids total count Subscribe Clicks  wise
            if (outerObj.logsSubscribeClick) {
                innerObj = outerObj.logsSubscribeClick[0];
                computedData = computeAffiliateHeData('subscribeClicks', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            //get Affiliate mids total count - live daily
            if (outerObj.packageWise) {
                partKey = outerObj.packageWise[0];
                innerObj = partKey.QDfC;
                computedData = computeAffiliateHeData('liveDaily', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            //get Affiliate mids total count - live weekly
            if (outerObj.packageWise) {
                partKey = outerObj.packageWise[0];
                innerObj = partKey.QDfG;
                computedData = computeAffiliateHeData('liveWeekly', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            //get Affiliate mids total count - live trial
            if (outerObj.statusWise) {
                partKey = outerObj.statusWise[0];
                innerObj = partKey.trial;
                computedData = computeAffiliateHeData('liveTrial', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            // reset start_date for both month & week so can update with latest one
            if (week_from_date === null)
                week_from_date = outerObj.date;

            if (month_from_date === null)
                month_from_date = outerObj.date;

            monthNo = new Date(outerObj.date).getMonth() + 1;
            dayNo = new Date(outerObj.date).getDate();

            // Monthly Data Count
            if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                monthlyDataObj.from_date = month_from_date;
                monthlyDataObj.to_date = outerObj.date;
                monthWiseTotalCount.push(_.clone(monthlyDataObj));
                monthlyDataObj = _.clone(cloneAffiliateObj());
                month_from_date = null;
            }

            // Weekly Data Count
            if (Number(dayNo) % 7 === 0){
                weeklyDataObj.from_date = week_from_date;
                weeklyDataObj.to_date = outerObj.date;
                weekWiseTotalCount.push(_.clone(weeklyDataObj));
                weeklyDataObj = _.clone(cloneAffiliateObj());
                week_from_date = null;
            }

            // Day Wise Date Count
            dayDataObj.date = outerObj.date;
            dayWiseTotalCount.push(_.clone(dayDataObj));
            dayDataObj = _.clone(cloneAffiliateObj());
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
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computeHelogsDataReport = async (rawDataSet, params) =>{
    console.log('computeHelogsDataReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, helogs;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.helogs){
                helogs = outerObj.helogs;
                console.log('helogs.helogsWise: ', helogs.helogsWise);
                if (helogs.helogsWise){
                    for (let j=0; j<helogs.helogsWise.length; j++){
                        innerObj = helogs.helogsWise[j];
                        console.log('innerObj: ', innerObj);

                        if (innerObj['1']){
                            dataObj['1'] = dataObj['1'] + innerObj['1'];
                            dayDataObj['1'] = dayDataObj['1'] + innerObj['1'];
                            weeklyDataObj['1'] = weeklyDataObj['1'] + innerObj['1'];
                            monthlyDataObj['1'] = monthlyDataObj['1'] + innerObj['1'];
                        }
                        if (innerObj['1569']){
                            dataObj['1569'] = dataObj['1569'] + innerObj['1569'];
                            dayDataObj['1569'] = dayDataObj['1569'] + innerObj['1569'];
                            weeklyDataObj['1569'] = weeklyDataObj['1569'] + innerObj['1569'];
                            monthlyDataObj['1569'] = monthlyDataObj['1569'] + innerObj['1569'];
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
                        if (innerObj.goonj){
                            dataObj.goonj = dataObj.goonj + innerObj.goonj;
                            dayDataObj.goonj = dayDataObj.goonj + innerObj.goonj;
                            weeklyDataObj.goonj = weeklyDataObj.goonj + innerObj.goonj;
                            monthlyDataObj.goonj = monthlyDataObj.goonj + innerObj.goonj;
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


                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            '1': innerObj['1'],
                            '1569': innerObj['1569'],
                            aff3: innerObj.aff3,
                            aff3a: innerObj.aff3a,
                            goonj: innerObj.goonj,
                            gdn: innerObj.gdn,
                            gdn2: innerObj.gdn2,
                            date: outerObj.date
                        });

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
                        monthlyDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0){
                        weeklyDataObj.from_date = week_from_date;
                        weeklyDataObj.to_date = outerObj.date;
                        weekWiseTotalCount.push(_.clone(weeklyDataObj));
                        weeklyDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
                        week_from_date = null;
                    }

                    // Day Wise Date Count
                    dayDataObj.date = outerObj.date;
                    dayWiseTotalCount.push(_.clone(dayDataObj));
                    dayDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computeUniqueSuccessHeWiseReport = async (rawDataSet, params) => {
    console.log('computeUniqueSuccessHeWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, uniqueSuccessHe;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.uniqueSuccessHe){
                uniqueSuccessHe = outerObj.uniqueSuccessHe;
                if (uniqueSuccessHe.helogsWise){
                    for (let j=0; j<uniqueSuccessHe.helogsWise.length; j++){
                        innerObj = uniqueSuccessHe.helogsWise[j];
                        if (innerObj['1']){
                            dataObj['1'] = dataObj['1'] + innerObj['1'];
                            dayDataObj['1'] = dayDataObj['1'] + innerObj['1'];
                            weeklyDataObj['1'] = weeklyDataObj['1'] + innerObj['1'];
                            monthlyDataObj['1'] = monthlyDataObj['1'] + innerObj['1'];
                        }
                        if (innerObj['1569']){
                            dataObj['1569'] = dataObj['1569'] + innerObj['1569'];
                            dayDataObj['1569'] = dayDataObj['1569'] + innerObj['1569'];
                            weeklyDataObj['1569'] = weeklyDataObj['1569'] + innerObj['1569'];
                            monthlyDataObj['1569'] = monthlyDataObj['1569'] + innerObj['1569'];
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
                        if (innerObj.goonj){
                            dataObj.goonj = dataObj.goonj + innerObj.goonj;
                            dayDataObj.goonj = dayDataObj.goonj + innerObj.goonj;
                            weeklyDataObj.goonj = weeklyDataObj.goonj + innerObj.goonj;
                            monthlyDataObj.goonj = monthlyDataObj.goonj + innerObj.goonj;
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


                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            '1': innerObj['1'],
                            '1569': innerObj['1569'],
                            aff3: innerObj.aff3,
                            aff3a: innerObj.aff3a,
                            goonj: innerObj.goonj,
                            gdn: innerObj.gdn,
                            gdn2: innerObj.gdn2,
                            date: outerObj.date
                        });

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
                        monthlyDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
                        month_from_date = null;
                    }

                    // Weekly Data Count
                    if (Number(dayNo) % 7 === 0){
                        weeklyDataObj.from_date = week_from_date;
                        weeklyDataObj.to_date = outerObj.date;
                        weekWiseTotalCount.push(_.clone(weeklyDataObj));
                        weeklyDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
                        week_from_date = null;
                    }

                    // Day Wise Date Count
                    dayDataObj.date = outerObj.date;
                    dayWiseTotalCount.push(_.clone(dayDataObj));
                    dayDataObj = _.clone({'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0});
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computeSubscriptionsMidDataReport = async (rawDataSet, params) => {
    console.log('computeSubscriptionsMidDataReport');

};
computeAffiliateDataReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataReport');

};
computeAffiliateDataSourceWiseReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, sourceWise, computedData;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let mids = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dataObj = {HE: _.clone(mids), affiliate_web: _.clone(mids)};
    let dayDataObj = {HE: _.clone(mids), affiliate_web: _.clone(mids)};
    let weeklyDataObj = {HE: _.clone(mids), affiliate_web: _.clone(mids)};
    let monthlyDataObj = {HE: _.clone(mids), affiliate_web: _.clone(mids)};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.sourceWise){
                sourceWise = outerObj.sourceWise[0];
                if (sourceWise.HE) {
                    innerObj = sourceWise.HE;
                    computedData = computeAffiliateHeData('HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }
                if (sourceWise.affiliate_web) {
                    innerObj = sourceWise.affiliate_web;
                    computedData = computeAffiliateHeData('affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }

                // reset start_date for both month & week so can update with latest one
                if (week_from_date === null)
                    week_from_date = outerObj.date;

                if (month_from_date === null)
                    month_from_date = outerObj.date;

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({HE: _.clone(mids), affiliate_web: _.clone(mids)});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({HE: _.clone(mids), affiliate_web: _.clone(mids)});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({HE: _.clone(mids), affiliate_web: _.clone(mids)});
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
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computeAffiliateDataPackageWiseReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, packageWise, computedData;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let mids = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dataObj = {liveDaily: _.clone(mids), liveWeekly: _.clone(mids)};
    let dayDataObj = {liveDaily: _.clone(mids), liveWeekly: _.clone(mids)};
    let weeklyDataObj = {liveDaily: _.clone(mids), liveWeekly: _.clone(mids)};
    let monthlyDataObj = {liveDaily: _.clone(mids), liveWeekly: _.clone(mids)};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.packageWise){
                packageWise = outerObj.packageWise[0];
                if (packageWise.QDfC) {
                    innerObj = packageWise.QDfC;
                    computedData = computeAffiliateHeData('liveDaily', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }
                if (packageWise.QDfG) {
                    innerObj = packageWise.QDfG;
                    computedData = computeAffiliateHeData('liveWeekly', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }

                // reset start_date for both month & week so can update with latest one
                if (week_from_date === null)
                    week_from_date = outerObj.date;

                if (month_from_date === null)
                    month_from_date = outerObj.date;

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({liveDaily: _.clone(mids), liveWeekly: _.clone(mids)});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({liveDaily: _.clone(mids), liveWeekly: _.clone(mids)});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({liveDaily: _.clone(mids), liveWeekly: _.clone(mids)});
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
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeAffiliateDataStatusWiseReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataStatusWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, statusWise, computedData;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let mids = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dataObj = {success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)};
    let dayDataObj = {success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)};
    let weeklyDataObj = {success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)};
    let monthlyDataObj = {success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.statusWise){
                statusWise = outerObj.statusWise[0];
                if (statusWise.success) {
                    innerObj = statusWise.success;
                    computedData = computeAffiliateHeData('success', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }
                if (statusWise.trial) {
                    innerObj = statusWise.trial;
                    computedData = computeAffiliateHeData('trial', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }
                if (statusWise.callback_sent) {
                    innerObj = statusWise.callback_sent;
                    computedData = computeAffiliateHeData('callback_sent', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                    dataObj = computedData.dataObj;
                    dayDataObj = computedData.dayDataObj;
                    weeklyDataObj = computedData.weeklyDataObj;
                    monthlyDataObj = computedData.monthlyDataObj;
                }

                // reset start_date for both month & week so can update with latest one
                if (week_from_date === null)
                    week_from_date = outerObj.date;

                if (month_from_date === null)
                    month_from_date = outerObj.date;

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({success: _.clone(mids), trial: _.clone(mids), callback_sent: _.clone(mids)});
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
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

function computeAffiliateHeData(part, innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj) {
    if (innerObj['1']){
        dataObj[part]['1'] = dataObj[part]['1'] + innerObj['1'];
        dayDataObj[part]['1'] = dayDataObj[part]['1'] + innerObj['1'];
        weeklyDataObj[part]['1'] = weeklyDataObj[part]['1'] + innerObj['1'];
        monthlyDataObj[part]['1'] = monthlyDataObj[part]['1'] + innerObj['1'];
    }
    if (innerObj['1569']){
        dataObj[part]['1569'] = dataObj[part]['1569'] + innerObj['1569'];
        dayDataObj[part]['1569'] = dayDataObj[part]['1569'] + innerObj['1569'];
        weeklyDataObj[part]['1569'] = weeklyDataObj[part]['1569'] + innerObj['1569'];
        monthlyDataObj[part]['1569'] = monthlyDataObj[part]['1569'] + innerObj['1569'];
    }
    if (innerObj.aff3){
        dataObj[part]['aff3'] = dataObj[part]['aff3'] + innerObj.aff3;
        dayDataObj[part]['aff3'] = dayDataObj[part]['aff3'] + innerObj.aff3;
        weeklyDataObj[part]['aff3'] = weeklyDataObj[part]['aff3'] + innerObj.aff3;
        monthlyDataObj[part]['aff3'] = monthlyDataObj[part]['aff3'] + innerObj.aff3;
    }
    if (innerObj.aff3a){
        dataObj[part]['aff3a'] = dataObj[part]['aff3a'] + innerObj.aff3a;
        dayDataObj[part]['aff3a'] = dayDataObj[part]['aff3a'] + innerObj.aff3a;
        weeklyDataObj[part]['aff3a'] = weeklyDataObj[part]['aff3a'] + innerObj.aff3a;
        monthlyDataObj[part]['aff3a'] = monthlyDataObj[part]['aff3a'] + innerObj.aff3a;
    }
    if (innerObj.goonj){
        dataObj[part]['goonj'] = dataObj[part]['goonj'] + innerObj.goonj;
        dayDataObj[part]['goonj'] = dayDataObj[part]['goonj'] + innerObj.goonj;
        weeklyDataObj[part]['goonj'] = weeklyDataObj[part]['goonj'] + innerObj.goonj;
        monthlyDataObj[part]['goonj'] = monthlyDataObj[part]['goonj'] + innerObj.goonj;
    }
    if (innerObj.gdn){
        dataObj[part]['gdn'] = dataObj[part]['gdn'] + innerObj.gdn;
        dayDataObj[part]['gdn'] = dayDataObj[part]['gdn'] + innerObj.gdn;
        weeklyDataObj[part]['gdn'] = weeklyDataObj[part]['gdn'] + innerObj.gdn;
        monthlyDataObj[part]['gdn'] = monthlyDataObj[part]['gdn'] + innerObj.gdn;
    }
    if (innerObj.gdn2){
        dataObj[part]['gdn2'] = dataObj[part]['gdn2'] + innerObj.gdn2;
        dayDataObj[part]['gdn2'] = dayDataObj[part]['gdn2'] + innerObj.gdn2;
        weeklyDataObj[part]['gdn2'] = weeklyDataObj[part]['gdn2'] + innerObj.gdn2;
        monthlyDataObj[part]['gdn2'] = monthlyDataObj[part]['gdn2'] + innerObj.gdn2;
    }

    return {dataObj: dataObj, dayDataObj: dayDataObj, weeklyDataObj: weeklyDataObj, monthlyDataObj: monthlyDataObj}
}
function cloneAffiliateObj (){
    let mids = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    return {
        HE: _.clone(mids),
        uniqueSuccessHe:  _.clone(mids),
        pageViews:  _.clone(mids),
        subscribeClicks:  _.clone(mids),
        liveTrial:  _.clone(mids),
        liveDaily:  _.clone(mids),
        liveWeekly:  _.clone(mids)
    };
}

module.exports = {
    computeAffiliateReport: computeAffiliateReport,
    computeHelogsDataReport: computeHelogsDataReport,
    computeUniqueSuccessHeWiseReport: computeUniqueSuccessHeWiseReport,
    computeSubscriptionsMidDataReport: computeSubscriptionsMidDataReport,
    computeAffiliateDataReport: computeAffiliateDataReport,
    computeAffiliateDataSourceWiseReport: computeAffiliateDataSourceWiseReport,
    computeAffiliateDataPackageWiseReport: computeAffiliateDataPackageWiseReport,
    computeAffiliateDataStatusWiseReport: computeAffiliateDataStatusWiseReport
};
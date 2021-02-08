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

            console.log('outerObj');

            //get Affiliate mids total count HE wise
            if (outerObj.helogs) {
                innerObj = outerObj.helogs[0];
                computedData = computeAffiliateHeData('HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
            }

            //get Affiliate mids total count Unique Success wise
            if (outerObj.uniqueSuccessHe) {
                innerObj = outerObj.uniqueSuccessHe[0];
                computedData = computeAffiliateHeData('uniqueSuccessHe', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                dataObj = computedData.dataObj;
                dayDataObj = computedData.dayDataObj;
                weeklyDataObj = computedData.weeklyDataObj;
                monthlyDataObj = computedData.monthlyDataObj;
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

            //get Affiliate mids total count - Subscriptions Mids
            if (outerObj.subscriptions) {
                innerObj = outerObj.subscriptions[0];
                computedData = computeAffiliateHeData('subscriptons', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
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

        console.log('dataObj: ', dataObj.length);

        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computeHelogsDataReport = async (rawDataSet, params) =>{
    console.log('computeHelogsDataReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.helogs){
                innerObj = outerObj.helogs[0];

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
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.uniqueSuccessHe){
                innerObj = outerObj.uniqueSuccessHe[0];

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

computeAffiliateDataReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, statusWise, packageWise, sourceWise, computedData;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let midsObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let sourceObj = {HE: _.clone(midsObj), affiliate_web: _.clone(midsObj)};
    let packageOBj = {liveDaily: _.clone(sourceObj), liveWeekly: _.clone(sourceObj)};

    let dataObj = {success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)};
    let dayDataObj = {success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)};
    let weeklyDataObj = {success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)};
    let monthlyDataObj = {success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.affiliateWise){
                statusWise = outerObj.affiliateWise[0];
                //If billing Status is "Success" - then package to source (HE, affiliate_web)
                if (statusWise.success) {
                    packageWise = statusWise.success;
                    if (packageWise.QDfC) {
                        sourceWise = packageWise.QDfC;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('success', 'liveDaily', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('success', 'liveDaily', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
                    if (packageWise.QDfG){
                        sourceWise = packageWise.QDfG;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('success', 'liveWeekly', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('success', 'liveWeekly', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
                }

                //If billing Status is "trial" - then package to source (HE, affiliate_web)
                if (statusWise.trial){
                    packageWise = statusWise.trial;
                    if (packageWise.QDfC) {
                        sourceWise = packageWise.QDfC;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('trial', 'liveDaily', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('trial', 'liveDaily', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
                    if (packageWise.QDfG){
                        sourceWise = packageWise.QDfG;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('trial', 'liveWeekly', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('trial', 'liveWeekly', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
                }

                //If billing Status is "callback_sent" - then package to source (HE, affiliate_web)
                if (statusWise.callback_sent) {
                    packageWise = statusWise.callback_sent;
                    if (packageWise.QDfC) {
                        sourceWise = packageWise.QDfC;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('callback_sent', 'liveDaily', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('callback_sent', 'liveDaily', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
                    if (packageWise.QDfG){
                        sourceWise = packageWise.QDfG;
                        if (sourceWise.HE){
                            innerObj = sourceWise.HE;
                            computedData = computeAffiliateWiseData('callback_sent', 'liveWeekly', 'HE', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                        if (sourceWise.affiliate_web) {
                            innerObj = sourceWise.affiliate_web;
                            computedData = computeAffiliateWiseData('callback_sent', 'liveWeekly', 'affiliate_web', innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = computedData.dataObj;
                            dayDataObj = computedData.dayDataObj;
                            weeklyDataObj = computedData.weeklyDataObj;
                            monthlyDataObj = computedData.monthlyDataObj;
                        }
                    }
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
                    monthlyDataObj = _.clone({success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({success: _.clone(packageOBj), trial: _.clone(packageOBj), callback_sent: _.clone(packageOBj)});
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computePageViewDataReport = async  (rawDataSet, params) => {
    console.log('computeAffiliateDataStatusWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.logsPageView){
                innerObj = outerObj.logsPageView[0];

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

computeSubscribeClickDataReport = async  (rawDataSet, params) => {
    console.log('computeSubscribeClickDataReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.logsSubscribeClick){
                innerObj = outerObj.logsSubscribeClick[0];

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

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let dayDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let weeklyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};
    let monthlyDataObj = {'1': 0, '1569': 0, 'aff3a': 0, 'aff3': 0, 'goonj': 0, 'gdn': 0, 'gdn2': 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.subscriptions){
                innerObj = outerObj.subscriptions[0];

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
function computeAffiliateWiseData(statusWise, packageWise, sourceWise, innerObj, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj) {
    if (innerObj['1']){
        dataObj[statusWise][packageWise][sourceWise]['1'] = dataObj[statusWise][packageWise][sourceWise]['1'] + innerObj['1'];
        dayDataObj[statusWise][packageWise][sourceWise]['1'] = dayDataObj[statusWise][packageWise][sourceWise]['1'] + innerObj['1'];
        weeklyDataObj[statusWise][packageWise][sourceWise]['1'] = weeklyDataObj[statusWise][packageWise][sourceWise]['1'] + innerObj['1'];
        monthlyDataObj[statusWise][packageWise][sourceWise]['1'] = monthlyDataObj[statusWise][packageWise][sourceWise]['1'] + innerObj['1'];
    }
    if (innerObj['1569']){
        dataObj[statusWise][packageWise][sourceWise]['1569'] = dataObj[statusWise][packageWise][sourceWise]['1569'] + innerObj['1569'];
        dayDataObj[statusWise][packageWise][sourceWise]['1569'] = dayDataObj[statusWise][packageWise][sourceWise]['1569'] + innerObj['1569'];
        weeklyDataObj[statusWise][packageWise][sourceWise]['1569'] = weeklyDataObj[statusWise][packageWise][sourceWise]['1569'] + innerObj['1569'];
        monthlyDataObj[statusWise][packageWise][sourceWise]['1569'] = monthlyDataObj[statusWise][packageWise][sourceWise]['1569'] + innerObj['1569'];
    }
    if (innerObj.aff3){
        dataObj[statusWise][packageWise][sourceWise]['aff3'] = dataObj[statusWise][packageWise][sourceWise]['aff3'] + innerObj.aff3;
        dayDataObj[statusWise][packageWise][sourceWise]['aff3'] = dayDataObj[statusWise][packageWise][sourceWise]['aff3'] + innerObj.aff3;
        weeklyDataObj[statusWise][packageWise][sourceWise]['aff3'] = weeklyDataObj[statusWise][packageWise][sourceWise]['aff3'] + innerObj.aff3;
        monthlyDataObj[statusWise][packageWise][sourceWise]['aff3'] = monthlyDataObj[statusWise][packageWise][sourceWise]['aff3'] + innerObj.aff3;
    }
    if (innerObj.aff3a){
        dataObj[statusWise][packageWise][sourceWise]['aff3a'] = dataObj[statusWise][packageWise][sourceWise]['aff3a'] + innerObj.aff3a;
        dayDataObj[statusWise][packageWise][sourceWise]['aff3a'] = dayDataObj[statusWise][packageWise][sourceWise]['aff3a'] + innerObj.aff3a;
        weeklyDataObj[statusWise][packageWise][sourceWise]['aff3a'] = weeklyDataObj[statusWise][packageWise][sourceWise]['aff3a'] + innerObj.aff3a;
        monthlyDataObj[statusWise][packageWise][sourceWise]['aff3a'] = monthlyDataObj[statusWise][packageWise][sourceWise]['aff3a'] + innerObj.aff3a;
    }
    if (innerObj.goonj){
        dataObj[statusWise][packageWise][sourceWise]['goonj'] = dataObj[statusWise][packageWise][sourceWise]['goonj'] + innerObj.goonj;
        dayDataObj[statusWise][packageWise][sourceWise]['goonj'] = dayDataObj[statusWise][packageWise][sourceWise]['goonj'] + innerObj.goonj;
        weeklyDataObj[statusWise][packageWise][sourceWise]['goonj'] = weeklyDataObj[statusWise][packageWise][sourceWise]['goonj'] + innerObj.goonj;
        monthlyDataObj[statusWise][packageWise][sourceWise]['goonj'] = monthlyDataObj[statusWise][packageWise][sourceWise]['goonj'] + innerObj.goonj;
    }
    if (innerObj.gdn){
        dataObj[statusWise][packageWise][sourceWise]['gdn'] = dataObj[statusWise][packageWise][sourceWise]['gdn'] + innerObj.gdn;
        dayDataObj[statusWise][packageWise][sourceWise]['gdn'] = dayDataObj[statusWise][packageWise][sourceWise]['gdn'] + innerObj.gdn;
        weeklyDataObj[statusWise][packageWise][sourceWise]['gdn'] = weeklyDataObj[statusWise][packageWise][sourceWise]['gdn'] + innerObj.gdn;
        monthlyDataObj[statusWise][packageWise][sourceWise]['gdn'] = monthlyDataObj[statusWise][packageWise][sourceWise]['gdn'] + innerObj.gdn;
    }
    if (innerObj.gdn2){
        dataObj[statusWise][packageWise][sourceWise]['gdn2'] = dataObj[statusWise][packageWise][sourceWise]['gdn2'] + innerObj.gdn2;
        dayDataObj[statusWise][packageWise][sourceWise]['gdn2'] = dayDataObj[statusWise][packageWise][sourceWise]['gdn2'] + innerObj.gdn2;
        weeklyDataObj[statusWise][packageWise][sourceWise]['gdn2'] = weeklyDataObj[statusWise][packageWise][sourceWise]['gdn2'] + innerObj.gdn2;
        monthlyDataObj[statusWise][packageWise][sourceWise]['gdn2'] = monthlyDataObj[statusWise][packageWise][sourceWise]['gdn2'] + innerObj.gdn2;
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
        subscriptons:  _.clone(mids),
        liveTrial:  _.clone(mids),
        liveDaily:  _.clone(mids),
        liveWeekly:  _.clone(mids)
    };
}

module.exports = {
    computeAffiliateReport: computeAffiliateReport,
    computeHelogsDataReport: computeHelogsDataReport,
    computePageViewDataReport: computePageViewDataReport,
    computeAffiliateDataReport: computeAffiliateDataReport,
    computeSubscribeClickDataReport: computeSubscribeClickDataReport,
    computeUniqueSuccessHeWiseReport: computeUniqueSuccessHeWiseReport,
    computeSubscriptionsMidDataReport: computeSubscriptionsMidDataReport,
    computeAffiliateDataStatusWiseReport: computeAffiliateDataStatusWiseReport,
    computeAffiliateDataSourceWiseReport: computeAffiliateDataSourceWiseReport,
    computeAffiliateDataPackageWiseReport: computeAffiliateDataPackageWiseReport
};
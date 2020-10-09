const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Charge Details Compute Functions
computeChargeDetailsSourceWiseReport = async (rawDataSet, params) =>{
    console.log('computeChargeDetailsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectSourceWiseObj());
    let dayDataObj = _.clone(cloneObjectSourceWiseObj());
    let weeklyDataObj = _.clone(cloneObjectSourceWiseObj());
    let monthlyDataObj = _.clone(cloneObjectSourceWiseObj());

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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectSourceWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectSourceWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectSourceWiseObj());
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
};
computeChargeDetailsPackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeChargeDetailsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPackageWiseObj());
    let dayDataObj = _.clone(cloneObjectPackageWiseObj());
    let weeklyDataObj = _.clone(cloneObjectPackageWiseObj());
    let monthlyDataObj = _.clone(cloneObjectPackageWiseObj());

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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPackageWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPackageWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPackageWiseObj());
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
};
computeChargeDetailsPaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeChargeDetailsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPaywallWiseObj());
    let dayDataObj = _.clone(cloneObjectPaywallWiseObj());
    let weeklyDataObj = _.clone(cloneObjectPaywallWiseObj());
    let monthlyDataObj = _.clone(cloneObjectPaywallWiseObj());

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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectPaywallWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectPaywallWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectPaywallWiseObj());
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
};
computeChargeDetailsOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeChargeDetailsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, chargeDetails, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectOperatorWiseObj());
    let dayDataObj = _.clone(cloneObjectOperatorWiseObj());
    let weeklyDataObj = _.clone(cloneObjectOperatorWiseObj());
    let monthlyDataObj = _.clone(cloneObjectOperatorWiseObj());

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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone(cloneObjectOperatorWiseObj());
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone(cloneObjectOperatorWiseObj());
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone(cloneObjectOperatorWiseObj());
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
};
computeFullAndMicroChargeDetailsReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
};


// Clone Objects to initialise the properties - Net Addition or Charge Details
function cloneObjectSourceWiseObj() {
    let obj =  { expire: 0, system: 0, total: 0 };
    return { app: _.clone(obj), web: _.clone(obj), HE: _.clone(obj), sms: _.clone(obj), gdn2: _.clone(obj), CP: _.clone(obj), null: _.clone(obj), affiliate_web: _.clone(obj), system_after_grace_end: _.clone(obj) }
}
function cloneObjectPackageWiseObj() {
    let obj =  { expire: 0, system: 0, total: 0 };
    return { dailyLive: _.clone(obj), weeklyLive: _.clone(obj), dailyComedy: _.clone(obj), weeklyComedy: _.clone(obj) }
}
function cloneObjectOperatorWiseObj() {
    let obj =  { expire: 0, system: 0, total: 0 };
    return { telenor: _.clone(obj), easypaisa: _.clone(obj) }
}
function cloneObjectPaywallWiseObj() {
    let obj =  { expire: 0, system: 0, total: 0 };
    return { live: _.clone(obj), comedy: _.clone(obj) }
}

// Populate object's properties with data - Net Addition or Charge Details
function updateDataArrs(innerObj, type, mode, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj) {

    let subType;
    subType = (mode === 'charge_details') ? 'full' : 'expire';
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

module.exports = {
    computeChargeDetailsSourceWiseReport: computeChargeDetailsSourceWiseReport,
    computeChargeDetailsPackageWiseReport: computeChargeDetailsPackageWiseReport,
    computeChargeDetailsPaywallWiseReport: computeChargeDetailsPaywallWiseReport,
    computeChargeDetailsOperatorWiseReport: computeChargeDetailsOperatorWiseReport,
    computeFullAndMicroChargeDetailsReport: computeFullAndMicroChargeDetailsReport,
};
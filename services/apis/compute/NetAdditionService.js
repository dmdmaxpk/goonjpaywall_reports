const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Net Additions Revenue Compute Functions
computeNetAdditionsSourceWiseReport = async (rawDataSet, params) =>{
    console.log('computeNetAdditionsSourceWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectSourceWiseObj());
    let dayDataObj = _.clone(cloneObjectSourceWiseObj());
    let weeklyDataObj = _.clone(cloneObjectSourceWiseObj());
    let monthlyDataObj = _.clone(cloneObjectSourceWiseObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.source) {
                        innerObj = netAddition.source;
                        if (innerObj.app){
                            returnData = updateDataArrs(innerObj, 'app', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.web){
                            returnData = updateDataArrs(innerObj, 'web', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.HE){
                            returnData = updateDataArrs(innerObj, 'HE', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.sms){
                            returnData = updateDataArrs(innerObj, 'sms', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.gdn2){
                            returnData = updateDataArrs(innerObj, 'gdn2', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.CP){
                            returnData = updateDataArrs(innerObj, 'CP', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.null){
                            returnData = updateDataArrs(innerObj, 'null', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.affiliate_web){
                            returnData = updateDataArrs(innerObj, 'affiliate_web', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.system_after_grace_end){
                            returnData = updateDataArrs(innerObj, 'system_after_grace_end', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeNetAdditionsPackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeNetAdditionsPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPackageWiseObj());
    let dayDataObj = _.clone(cloneObjectPackageWiseObj());
    let weeklyDataObj = _.clone(cloneObjectPackageWiseObj());
    let monthlyDataObj = _.clone(cloneObjectPackageWiseObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.package) {
                        innerObj = netAddition.package;
                        if (innerObj.dailyLive){
                            returnData = updateDataArrs(innerObj, 'dailyLive', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyLive){
                            returnData = updateDataArrs(innerObj, 'weeklyLive', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.dailyComedy){
                            returnData = updateDataArrs(innerObj, 'dailyComedy', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.weeklyComedy){
                            returnData = updateDataArrs(innerObj, 'weeklyComedy', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeNetAdditionsPaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeNetAdditionsPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectPaywallWiseObj());
    let dayDataObj = _.clone(cloneObjectPaywallWiseObj());
    let weeklyDataObj = _.clone(cloneObjectPaywallWiseObj());
    let monthlyDataObj = _.clone(cloneObjectPaywallWiseObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.paywall) {
                        innerObj = netAddition.paywall;
                        if (innerObj.comedy){
                            returnData = updateDataArrs(innerObj, 'comedy', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.live){
                            returnData = updateDataArrs(innerObj, 'live', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeNetAdditionsOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeNetAdditionsOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, returnData;
    let outerObj, innerObj, netAddition, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = _.clone(cloneObjectOperatorWiseObj());
    let dayDataObj = _.clone(cloneObjectOperatorWiseObj());
    let weeklyDataObj = _.clone(cloneObjectOperatorWiseObj());
    let monthlyDataObj = _.clone(cloneObjectOperatorWiseObj());

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.netAdditions){
                for (let j=0; j<outerObj.netAdditions.length; j++) {
                    netAddition = outerObj.netAdditions[j];
                    if (netAddition.operator) {
                        innerObj = netAddition.operator;
                        if (innerObj.telenor){
                            returnData = updateDataArrs(innerObj, 'telenor', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
                            dataObj = returnData.dataObj;
                            dayDataObj = returnData.dayDataObj;
                            weeklyDataObj = returnData.weeklyDataObj;
                            monthlyDataObj = returnData.monthlyDataObj;
                        }
                        if (innerObj.easypaisa){
                            returnData = updateDataArrs(innerObj, 'easypaisa', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
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
        return reportsTransformer.transformTheData(2, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeNetAdditionsReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};


// Clone Objects to initialise the properties - Net Addition or Charge Details
function cloneObjectSourceWiseObj() {
    let obj =  { expire: 0, system: 0, total: 0 };
    //app, web, ccp_api, CP_whatsappccd, dmdmax, system, CP_telenorccd, CP_productccd, CP_ideationccd1, system_after_grace_end
    return { app: _.clone(obj), web: _.clone(obj), ccp_api: _.clone(obj), CP_whatsappccd: _.clone(obj), dmdmax: _.clone(obj),
        system: _.clone(obj), CP_telenorccd: _.clone(obj), CP_productccd: _.clone(obj), CP_ideationccd1: _.clone(obj), system_after_grace_end: _.clone(obj) }
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
// updateDataArrs(innerObj, 'dailyLive', dataObj, dayDataObj, weeklyDataObj, monthlyDataObj);
function updateDataArrs(innerObj, type, dataObj, dayDataObj, weeklyDataObj, monthlyDataObj) {
    if (innerObj[type]['expire']){
        dataObj[type]['expire'] = dataObj[type]['expire'] + innerObj[type]['expire'];
        dayDataObj[type]['expire'] = dayDataObj[type]['expire'] + innerObj[type]['expire'];
        weeklyDataObj[type]['expire'] = weeklyDataObj[type]['expire'] + innerObj[type]['expire'];
        monthlyDataObj[type]['expire'] = monthlyDataObj[type]['expire'] + innerObj[type]['expire'];
    }

    if(innerObj[type]['system']){
        dataObj[type]['system'] = dataObj[type]['system'] + innerObj[type]['system'];
        dayDataObj[type]['system'] = dayDataObj[type]['system'] + innerObj[type]['system'];
        weeklyDataObj[type]['system'] = weeklyDataObj[type]['system'] + innerObj[type]['system'];
        monthlyDataObj[type]['system'] = monthlyDataObj[type]['system'] + innerObj[type]['system'];
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
    computeNetAdditionsSourceWiseReport: computeNetAdditionsSourceWiseReport,
    computeNetAdditionsPackageWiseReport: computeNetAdditionsPackageWiseReport,
    computeNetAdditionsPaywallWiseReport: computeNetAdditionsPaywallWiseReport,
    computeNetAdditionsOperatorWiseReport: computeNetAdditionsOperatorWiseReport,
    computeNetAdditionsReport: computeNetAdditionsReport,
};
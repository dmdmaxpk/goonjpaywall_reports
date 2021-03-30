const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

computeRequestCountReport = async (rawDataSet, params) =>{
    console.log('computeRequestCountReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {successful: 0, graced: 0, total: 0};
    let dayDataObj = {successful: 0, graced: 0, total: 0};
    let weeklyDataObj = {successful: 0, graced: 0, total: 0};
    let monthlyDataObj = {successful: 0, graced: 0, total: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.requestCount){
                for (let j=0; j<outerObj.requestCount.length; j++) {
                    innerObj = outerObj.requestCount[j];
                    if (innerObj.success) {
                        dataObj.successful = dataObj.successful + innerObj.success;
                        dayDataObj.successful = dayDataObj.successful + innerObj.success;
                        weeklyDataObj.successful = weeklyDataObj.successful + innerObj.success;
                        monthlyDataObj.successful = monthlyDataObj.successful + innerObj.success;
                    }
                    if (innerObj.graced) {
                        dataObj.graced = dataObj.graced + innerObj.graced;
                        dayDataObj.graced = dayDataObj.graced + innerObj.graced;
                        weeklyDataObj.graced = weeklyDataObj.graced + innerObj.graced;
                        monthlyDataObj.graced = monthlyDataObj.graced + innerObj.graced;
                    }
                    if (innerObj.total) {
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success, graced: innerObj.graced,
                    //     total: innerObj.total, date: outerObj.date
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
                    monthlyDataObj = _.clone({successful: 0, graced: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({successful: 0, graced: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({successful: 0, graced: 0, total: 0});
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

computeSuccessfulChargeReport = async (rawDataSet, params) =>{
    console.log('computeSuccessfulChargeReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {successful: 0};
    let dayDataObj = {successful: 0};
    let weeklyDataObj = {successful: 0};
    let monthlyDataObj = {successful: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.churn){
                for (let j=0; j<outerObj.churn.length; j++) {
                    innerObj = outerObj.churn[j];
                    if (innerObj.success) {
                        dataObj.successful = dataObj.successful + innerObj.success;
                        dayDataObj.successful = dayDataObj.successful + innerObj.success;
                        weeklyDataObj.successful = weeklyDataObj.successful + innerObj.success;
                        monthlyDataObj.successful = monthlyDataObj.successful + innerObj.success;
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     successful: innerObj.success
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
                    monthlyDataObj = _.clone({successful: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({successful: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({successful: 0});
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

computeUnsubscribedReport = async (rawDataSet, params) =>{
    console.log('computeUnsubscribedReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {expired: 0};
    let dayDataObj = {expired: 0};
    let weeklyDataObj = {expired: 0};
    let monthlyDataObj = {expired: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.churn){
                for (let j=0; j<outerObj.churn.length; j++) {
                    innerObj = outerObj.churn[j];
                    if (innerObj.success) {
                        dataObj.expired = dataObj.expired + innerObj.success;
                        dayDataObj.expired = dayDataObj.expired + innerObj.success;
                        weeklyDataObj.expired = weeklyDataObj.expired + innerObj.success;
                        monthlyDataObj.expired = monthlyDataObj.expired + innerObj.success;
                    }

                    // Hourly Bases Data
                    // hourlyBasisTotalCount.push({
                    //     expired: innerObj.success
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
                    monthlyDataObj = _.clone({expired: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({expired: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({expired: 0});
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

module.exports = {
    computeRequestCountReport: computeRequestCountReport,
    computeSuccessfulChargeReport: computeSuccessfulChargeReport,
    computeUnsubscribedReport: computeUnsubscribedReport,
};
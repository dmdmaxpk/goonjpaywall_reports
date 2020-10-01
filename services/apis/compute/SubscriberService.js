const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// User Compute Functions
computeTotalSubscribersReport = async (rawDataSet, params) =>{
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
                    if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
};
computeActiveSubscribersReport = async (rawDataSet, params) =>{
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
};

module.exports = {
    computeTotalSubscribersReport: computeTotalSubscribersReport,
    computeActiveSubscribersReport: computeActiveSubscribersReport,
};
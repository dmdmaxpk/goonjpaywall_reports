const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Trial Compute Functions
computeTrialSourceWiseReport = async (rawDataSet, params) =>{
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
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
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
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
    }
};

module.exports = {
    computeTrialSourceWiseReport: computeTrialSourceWiseReport,
};
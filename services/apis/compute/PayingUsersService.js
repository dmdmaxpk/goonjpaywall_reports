const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Paying User Compute Functions
computePayingUsersCountSourceWiseReport = async (rawDataSet, params, userType) =>{
    console.log('computePayingUsersCountSourceWiseReport: ', userType);

    let sourceWiseObj, monthNo, dayNo, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    let monthlyDataObj = {app: 0, web: 0, he: 0, gdn2: 0, tp_gdn: 0, affiliate_web: 0, others: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj[userType]){
                for (let j=0; j<outerObj[userType].length; j++) {
                    innerObj = outerObj[userType][j];
                    console.log('innerObj: ', innerObj);
                    if (innerObj.source) {
                        sourceWiseObj = innerObj.source;
                        if (sourceWiseObj.app) {
                            dataObj.app = dataObj.app + sourceWiseObj.app.count;
                            monthlyDataObj.app = monthlyDataObj.app + sourceWiseObj.app.count;
                        }
                        if (sourceWiseObj.web) {
                            dataObj.web = dataObj.web + sourceWiseObj.web.count;
                            monthlyDataObj.web = monthlyDataObj.web + sourceWiseObj.web.count;
                        }
                        if (sourceWiseObj.he) {
                            dataObj.he = dataObj.he + sourceWiseObj.he.count;
                            monthlyDataObj.he = monthlyDataObj.he + sourceWiseObj.he.count;
                        }
                        if (sourceWiseObj.gdn2) {
                            dataObj.gdn2 = dataObj.gdn2 + sourceWiseObj.gdn2.count;
                            monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + sourceWiseObj.gdn2.count;
                        }
                        if (sourceWiseObj.tp_gdn) {
                            dataObj.tp_gdn = dataObj.tp_gdn + sourceWiseObj.tp_gdn.count;
                            monthlyDataObj.tp_gdn = monthlyDataObj.tp_gdn + sourceWiseObj.tp_gdn.count;
                        }
                        if (sourceWiseObj.affiliate_web) {
                            dataObj.affiliate_web = dataObj.affiliate_web + sourceWiseObj.affiliate_web.count;
                            monthlyDataObj.affiliate_web = monthlyDataObj.affiliate_web + sourceWiseObj.affiliate_web.count;
                        }
                        if (sourceWiseObj.others) {
                            dataObj.others = dataObj.others + sourceWiseObj.others.count;
                            monthlyDataObj.others = monthlyDataObj.others + sourceWiseObj.others.count;
                        }
                    }

                    // reset start_date for month so can update with latest one
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
            }
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

computePayingUsersSessionsTimeReport = async (rawDataSet, params, sessionType) =>{
    console.log('computePayingUsersSessionsTimeReport', sessionType);

    let obj, monthNo, dayNo, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {session: '', sum: 0, turns: 0, average: 0};
    let monthlyDataObj = {session: '', sum: 0, turns: 0, average: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.userSessions){
                for (let j=0; j<outerObj.userSessions.length; j++) {
                    innerObj = outerObj.userSessions[j];
                    console.log('innerObj: ', innerObj);

                    if (innerObj[sessionType]) {
                        obj = innerObj[sessionType];
                        console.log('obj: ', obj);
                        dataObj.session = obj.session;
                        dataObj.sum = dataObj.sum + obj.sum;
                        dataObj.turns = dataObj.turns + obj.turn;

                        monthlyDataObj.session = obj.session;
                        monthlyDataObj.sum = monthlyDataObj.sum + obj.sum;
                        monthlyDataObj.turns = monthlyDataObj.turns + obj.turn;
                    }

                    // reset start_date for month so can update with latest one
                    if (month_from_date === null)
                        month_from_date = outerObj.date;
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
                }
            }
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
        dataObj.average = (dataObj.sum / dataObj.turns).toFixed(2);
        dataObj.from_date = params.from_date;
        dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

computePayingUsersWatchTimeReport = async (rawDataSet, params, sessionType) =>{
    console.log('computePayingUsersWatchTimeReport');

    let obj, monthNo, dayNo, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {session: '', sum: 0, turns: 0, average: 0};
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

                        monthlyDataObj.session = obj.session;
                        monthlyDataObj.sum = monthlyDataObj.sum + obj.sum;
                        monthlyDataObj.turns = monthlyDataObj.turns + obj.turn;
                    }

                    // reset start_date for month so can update with latest one
                    if (month_from_date === null)
                        month_from_date = outerObj.date;
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
                }
            }
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
        dataObj.average = (dataObj.sum / dataObj.turns).toFixed(2);
        dataObj.from_date = params.from_date;
        dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

module.exports = {
    computePayingUsersCountSourceWiseReport: computePayingUsersCountSourceWiseReport,
    computePayingUsersSessionsTimeReport: computePayingUsersSessionsTimeReport,
    computePayingUsersWatchTimeReport: computePayingUsersWatchTimeReport,
};
const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// User Compute Functions
computeAffiliateReport = async (rawDataSet, params) =>{
    console.log('computeAffiliateReport');

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
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
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
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
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
        return reportsTransformer.transformTheData(false, params, 'Data not exist.');
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

};
computeAffiliateDataPackageWiseReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataPackageWiseReport');

};
computeAffiliateDataStatusWiseReport = async (rawDataSet, params) => {
    console.log('computeAffiliateDataStatusWiseReport');

};

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
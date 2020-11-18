const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Revenue Compute Functions
computeRevenuePackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null, billing_dtm_hours;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let dayDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let weeklyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};
    let monthlyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        billing_dtm_hours = new Date(billingHistory.revenue.billing_dtm_hours);
                        console.log('billing_dtm_hours: ', billing_dtm_hours);
                        console.log('params.from_date: ', new Date(params.from_date));
                        console.log('params.to_date: ', new Date(params.to_date));

                        if (billing_dtm_hours >= new Date(params.from_date) && billing_dtm_hours <= new Date(params.to_date)){
                            console.log('===============================: ', billing_dtm_hours);

                        }
                        if (billingHistory.revenue.package){
                            innerObj = billingHistory.revenue.package;
                            if (innerObj.liveDaily){
                                dataObj.totalLiveDaily = dataObj.totalLiveDaily + innerObj.liveDaily;
                                dataObj.netTotal = dataObj.netTotal + innerObj.liveDaily;

                                dayDataObj.totalLiveDaily = dayDataObj.totalLiveDaily + innerObj.liveDaily;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.liveDaily;

                                weeklyDataObj.totalLiveDaily = weeklyDataObj.totalLiveDaily + innerObj.liveDaily;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.liveDaily;

                                monthlyDataObj.totalLiveDaily = monthlyDataObj.totalLiveDaily + innerObj.liveDaily;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.liveDaily;
                            }
                            if (innerObj.liveWeekly){
                                dataObj.totalLiveWeekly = dataObj.totalLiveWeekly + innerObj.liveWeekly;
                                dataObj.netTotal = dataObj.netTotal + innerObj.liveWeekly;

                                dayDataObj.totalLiveWeekly = dayDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.liveWeekly;

                                weeklyDataObj.totalLiveWeekly = weeklyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.liveWeekly;

                                monthlyDataObj.totalLiveWeekly = monthlyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.liveWeekly;

                            }
                            if (innerObj.comedyDaily){
                                dataObj.totalComedyDaily = dataObj.totalComedyDaily + innerObj.comedyDaily;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedyDaily;

                                dayDataObj.totalComedyDaily = dayDataObj.totalComedyDaily + innerObj.comedyDaily;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedyDaily;

                                weeklyDataObj.totalComedyDaily = weeklyDataObj.totalComedyDaily + innerObj.comedyDaily;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedyDaily;

                                monthlyDataObj.totalComedyDaily = monthlyDataObj.totalComedyDaily + innerObj.comedyDaily;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedyDaily;
                            }
                            if (innerObj.comedyWeekly){
                                dataObj.totalComedyWeekly = dataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedyWeekly;

                                dayDataObj.totalComedyWeekly = dayDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedyWeekly;

                                weeklyDataObj.totalComedyWeekly = weeklyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedyWeekly;

                                monthlyDataObj.totalComedyWeekly = monthlyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedyWeekly;
                            }

                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                totalLiveDaily: innerObj.liveDaily, totalLiveWeekly: innerObj.liveWeekly,
                                totalComedyDaily: innerObj.comedyDaily, totalComedyWeekly: innerObj.comedyWeekly,
                                netTotal: innerObj.liveDaily + innerObj.liveWeekly + innerObj.comedyDaily + innerObj.comedyWeekly,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, netTotal: 0});

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

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeRevenuePaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {live: 0, comedy: 0, netTotal: 0};
    let dayDataObj = {live: 0, comedy: 0, netTotal: 0};
    let weeklyDataObj = {live: 0, comedy: 0, netTotal: 0};
    let monthlyDataObj = {live: 0, comedy: 0, netTotal: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        if (billingHistory.revenue.paywall){
                            innerObj = billingHistory.revenue.paywall;
                            if (innerObj.live){
                                dataObj.live = dataObj.live + innerObj.live;
                                dataObj.netTotal = dataObj.netTotal + innerObj.live;

                                dayDataObj.live = dayDataObj.live + innerObj.live;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.live;

                                weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.live;

                                monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.live;
                            }
                            if (innerObj.comedy){
                                dataObj.comedy = dataObj.comedy + innerObj.comedy;
                                dataObj.netTotal = dataObj.netTotal + innerObj.comedy;

                                dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.comedy;

                                weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.comedy;

                                monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.comedy;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.live, comedy: innerObj.comedy,
                                netTotal: innerObj.live + innerObj.comedy,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({live: 0, comedy: 0, netTotal: 0});

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

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};
computeRevenueOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let dayDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let weeklyDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};
    let monthlyDataObj = {telenor: 0, easypaisa: 0, netTotal: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.revenue) {
                        if (billingHistory.revenue.operator){
                            innerObj = billingHistory.revenue.operator;
                            if (innerObj.telenor){
                                dataObj.telenor = dataObj.telenor + innerObj.telenor;
                                dataObj.netTotal = dataObj.netTotal + innerObj.telenor;

                                dayDataObj.telenor = dayDataObj.telenor + innerObj.telenor;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.telenor;

                                weeklyDataObj.telenor = weeklyDataObj.telenor + innerObj.telenor;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.telenor;

                                monthlyDataObj.telenor = monthlyDataObj.telenor + innerObj.telenor;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.telenor;
                            }
                            if (innerObj.easypaisa){
                                dataObj.easypaisa = dataObj.easypaisa + innerObj.easypaisa;
                                dataObj.netTotal = dataObj.netTotal + innerObj.easypaisa;

                                dayDataObj.easypaisa = dayDataObj.easypaisa + innerObj.easypaisa;
                                dayDataObj.netTotal = dayDataObj.netTotal + innerObj.easypaisa;

                                weeklyDataObj.easypaisa = weeklyDataObj.easypaisa + innerObj.easypaisa;
                                weeklyDataObj.netTotal = weeklyDataObj.netTotal + innerObj.easypaisa;

                                monthlyDataObj.easypaisa = monthlyDataObj.easypaisa + innerObj.easypaisa;
                                monthlyDataObj.netTotal = monthlyDataObj.netTotal + innerObj.easypaisa;
                            }


                            // Hourly Bases Data
                            hourlyBasisTotalCount.push({
                                live: innerObj.telenor, comedy: innerObj.easypaisa,
                                netTotal: innerObj.telenor + innerObj.easypaisa,
                                date: billingHistory.added_dtm_hours
                            });

                            // reset start_date for both month & week so can update with latest one
                            if (week_from_date === null)
                                week_from_date = billingHistory.added_dtm;

                            if (month_from_date === null)
                                month_from_date = billingHistory.added_dtm;
                        }
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});
                    week_from_date = null;
                }

                // Total Count Data
                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({telenor: 0, easypaisa: 0, netTotal: 0});

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

        // date range (start-date, end-date)
        dataObj = _.clone(dataObj);
        dataObj.from_date = params.from_date; dataObj.to_date = params.to_date;
        return reportsTransformer.transformTheData(1, true, dataObj, hourlyBasisTotalCount, dayWiseTotalCount, weekWiseTotalCount, monthWiseTotalCount, params, 'Successfully process the data.');
    }
    else {
        return reportsTransformer.transformErrorCatchData(false, 'Data not exist.');
    }
};

module.exports = {
    computeRevenuePackageWiseReport: computeRevenuePackageWiseReport,
    computeRevenuePaywallWiseReport: computeRevenuePaywallWiseReport,
    computeRevenueOperatorWiseReport: computeRevenueOperatorWiseReport
};
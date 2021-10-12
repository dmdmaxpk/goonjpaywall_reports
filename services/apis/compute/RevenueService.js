const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// Revenue Compute Functions
computeRevenuePackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenuePackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
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
computeRevenueAffiliateWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueAffiliateWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0};
    let dayDataObj = {aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0};
    let weeklyDataObj = {aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0};
    let monthlyDataObj = {aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];

            if (outerObj.affiliate) {
                innerObj = outerObj.affiliate;
                if (innerObj.aff3a){
                    dataObj.aff3a = dataObj.aff3a + innerObj.aff3a;
                    dayDataObj.aff3a = dayDataObj.aff3a + innerObj.aff3a;
                    weeklyDataObj.aff3a = weeklyDataObj.aff3a + innerObj.aff3a;
                    monthlyDataObj.aff3a = monthlyDataObj.aff3a + innerObj.aff3a;
                }
                if (innerObj.tp_gdn_daily){
                    dataObj.tp_gdn_daily = dataObj.tp_gdn_daily + innerObj.tp_gdn_daily;
                    dayDataObj.tp_gdn_daily = dayDataObj.tp_gdn_daily + innerObj.tp_gdn_daily;
                    weeklyDataObj.tp_gdn_daily = weeklyDataObj.tp_gdn_daily + innerObj.tp_gdn_daily;
                    monthlyDataObj.tp_gdn_daily = monthlyDataObj.tp_gdn_daily + innerObj.tp_gdn_daily;
                }
                if (innerObj.gdn2){
                    dataObj.gdn2 = dataObj.gdn2 + innerObj.gdn2;
                    dayDataObj.gdn2 = dayDataObj.gdn2 + innerObj.gdn2;
                    weeklyDataObj.gdn2 = weeklyDataObj.gdn2 + innerObj.gdn2;
                    monthlyDataObj.gdn2 = monthlyDataObj.gdn2 + innerObj.gdn2;
                }
                if (innerObj.goonj){
                    dataObj.goonj = dataObj.goonj + innerObj.goonj;
                    dayDataObj.goonj = dayDataObj.goonj + innerObj.goonj;
                    weeklyDataObj.goonj = weeklyDataObj.goonj + innerObj.goonj;
                    monthlyDataObj.goonj = monthlyDataObj.goonj + innerObj.goonj;
                }
                if (innerObj.gdn3){
                    dataObj.gdn3 = dataObj.gdn3 + innerObj.gdn3;
                    dayDataObj.gdn3 = dayDataObj.gdn3 + innerObj.gdn3;
                    weeklyDataObj.gdn3 = weeklyDataObj.gdn3 + innerObj.gdn3;
                    monthlyDataObj.gdn3 = monthlyDataObj.gdn3 + innerObj.gdn3;
                }
                if (innerObj.null){
                    dataObj.null = dataObj.null + innerObj.null;
                    dayDataObj.null = dayDataObj.null + innerObj.null;
                    weeklyDataObj.null = weeklyDataObj.null + innerObj.null;
                    monthlyDataObj.null = monthlyDataObj.null + innerObj.null;
                }
                if (innerObj.tp_fb_campaign){
                    dataObj.tp_fb_campaign = dataObj.tp_fb_campaign + innerObj.tp_fb_campaign;
                    dayDataObj.tp_fb_campaign = dayDataObj.tp_fb_campaign + innerObj.tp_fb_campaign;
                    weeklyDataObj.tp_fb_campaign = weeklyDataObj.tp_fb_campaign + innerObj.tp_fb_campaign;
                    monthlyDataObj.tp_fb_campaign = monthlyDataObj.tp_fb_campaign + innerObj.tp_fb_campaign;
                }

                // Hourly Bases Data
                // hourlyBasisTotalCount.push();

                // reset start_date for both month & week so can update with latest one
                if (week_from_date === null)
                    week_from_date = innerObj.billing_dtm;

                if (month_from_date === null)
                    month_from_date = innerObj.billing_dtm;
            }

            monthNo = new Date(outerObj.date).getMonth() + 1;
            dayNo = new Date(outerObj.date).getDate();

            // Monthly Data Count
            if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                monthlyDataObj.from_date = month_from_date;
                monthlyDataObj.to_date = outerObj.date;
                monthWiseTotalCount.push(_.clone(monthlyDataObj));
                monthlyDataObj = _.clone({aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0});
                month_from_date = null;
            }

            // Weekly Data Count
            if (Number(dayNo) % 7 === 0){
                weeklyDataObj.from_date = week_from_date;
                weeklyDataObj.to_date = outerObj.date;
                weekWiseTotalCount.push(_.clone(weeklyDataObj));
                weeklyDataObj = _.clone({aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0});
                week_from_date = null;
            }

            // Total Count Data
            // Day Wise Date Count
            dayDataObj.date = outerObj.date;
            dayWiseTotalCount.push(_.clone(dayDataObj));
            dayDataObj = _.clone({aff3a: 0, tp_gdn_daily: 0, gdn2: 0, goonj: 0, gdn3: 0, null: 0, tp_fb_campaign: 0});
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
computeRevenueTPAffiliateWiseReport = async (rawDataSet, params) =>{
    console.log('computeRevenueTPAffiliateWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0};
    let dayDataObj = {tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0};
    let weeklyDataObj = {tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0};
    let monthlyDataObj = {tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];

            console.log('outerObj: ', outerObj)
            if (outerObj.tp_source) {
                innerObj = outerObj.tp_source;
                if (innerObj.tp_geo_ent){
                    dataObj.tp_geo_ent = dataObj.tp_geo_ent + innerObj.tp_geo_ent;
                    dayDataObj.tp_geo_ent = dayDataObj.tp_geo_ent + innerObj.tp_geo_ent;
                    weeklyDataObj.tp_geo_ent = weeklyDataObj.tp_geo_ent + innerObj.tp_geo_ent;
                    monthlyDataObj.tp_geo_ent = monthlyDataObj.tp_geo_ent + innerObj.tp_geo_ent;
                }
                if (innerObj.tp_discover_pak){
                    dataObj.tp_discover_pak = dataObj.tp_discover_pak + innerObj.tp_discover_pak;
                    dayDataObj.tp_discover_pak = dayDataObj.tp_discover_pak + innerObj.tp_discover_pak;
                    weeklyDataObj.tp_discover_pak = weeklyDataObj.tp_discover_pak + innerObj.tp_discover_pak;
                    monthlyDataObj.tp_discover_pak = monthlyDataObj.tp_discover_pak + innerObj.tp_discover_pak;
                }
                if (innerObj.tp_dw_eng){
                    dataObj.tp_dw_eng = dataObj.tp_dw_eng + innerObj.tp_dw_eng;
                    dayDataObj.tp_dw_eng = dayDataObj.tp_dw_eng + innerObj.tp_dw_eng;
                    weeklyDataObj.tp_dw_eng = weeklyDataObj.tp_dw_eng + innerObj.tp_dw_eng;
                    monthlyDataObj.tp_dw_eng = monthlyDataObj.tp_dw_eng + innerObj.tp_dw_eng;
                }
                if (innerObj.youtube){
                    dataObj.youtube = dataObj.youtube + innerObj.youtube;
                    dayDataObj.youtube = dayDataObj.youtube + innerObj.youtube;
                    weeklyDataObj.youtube = weeklyDataObj.youtube + innerObj.youtube;
                    monthlyDataObj.youtube = monthlyDataObj.youtube + innerObj.youtube;
                }

                // Hourly Bases Data
                // hourlyBasisTotalCount.push();

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
                monthlyDataObj = _.clone({tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0});
                month_from_date = null;
            }

            // Weekly Data Count
            if (Number(dayNo) % 7 === 0){
                weeklyDataObj.from_date = week_from_date;
                weeklyDataObj.to_date = outerObj.date;
                weekWiseTotalCount.push(_.clone(weeklyDataObj));
                weeklyDataObj = _.clone({tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0});
                week_from_date = null;
            }

            // Total Count Data
            // Day Wise Date Count
            dayDataObj.date = outerObj.date;
            dayWiseTotalCount.push(_.clone(dayDataObj));
            dayDataObj = _.clone({tp_geo_ent: 0, tp_discover_pak: 0, tp_dw_eng: 0, youtube: 0});
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
    computeRevenueOperatorWiseReport: computeRevenueOperatorWiseReport,
    computeRevenueAffiliateWiseReport: computeRevenueAffiliateWiseReport,
    computeRevenueTPAffiliateWiseReport: computeRevenueTPAffiliateWiseReport,
};
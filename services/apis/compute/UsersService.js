const container = require("../../../configurations/container");
const reportsTransformer = container.resolve('reportsTransformer');
const helper = require('../../../helper/helper');
const  _ = require('lodash');

// User Compute Functions
computeVerifiedUserReport = async (rawDataSet, params) =>{
    console.log('computeVerifiedUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let dayDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let weeklyDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    let monthlyDataObj = {totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.users){
                for (let j=0; j<outerObj.users.length; j++){
                    innerObj = outerObj.users[j];
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
                    if (innerObj.verified){
                        dataObj.totalVerified = dataObj.totalVerified + innerObj.verified;
                        dayDataObj.totalVerified = dayDataObj.totalVerified + innerObj.verified;
                        weeklyDataObj.totalVerified = weeklyDataObj.totalVerified + innerObj.verified;
                        monthlyDataObj.totalVerified = monthlyDataObj.totalVerified + innerObj.verified;
                    }
                    if (innerObj.nonVerified){
                        dataObj.totalNonVerified = dataObj.totalNonVerified + innerObj.nonVerified;
                        dayDataObj.totalNonVerified = dayDataObj.totalNonVerified + innerObj.nonVerified;
                        weeklyDataObj.totalNonVerified = weeklyDataObj.totalNonVerified + innerObj.nonVerified;
                        monthlyDataObj.totalNonVerified = monthlyDataObj.totalNonVerified + innerObj.nonVerified;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        totalActive: innerObj.active, totalInactive: innerObj.nonActive,
                        totalVerified: innerObj.verified, totalNonVerified: innerObj.nonVerified,
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
                    monthlyDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalActive: 0, totalInactive: 0, totalVerified: 0, totalNonVerified: 0});
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
computeAccessingServiceUserReport = async (rawDataSet, params) =>{
    console.log('computeAccessingServiceUserReport');
};
computeUniquePayingUserReport = async (rawDataSet, params) =>{
    console.log('computeUniquePayingUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj;
    let hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {total: 0};
    let dayDataObj = {total: 0};
    let weeklyDataObj = {total: 0};
    let monthlyDataObj = {total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.uniquePayingUsers){
                for (let j=0; j<outerObj.uniquePayingUsers.length; j++){
                    innerObj = outerObj.uniquePayingUsers[j];
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
computeFullPartialChargedUserReport = async (rawDataSet, params) =>{
    console.log('computeFullPartialChargedUserReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let dayDataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let weeklyDataObj = {fullCharged: 0, partialCharged: 0, total: 0};
    let monthlyDataObj = {fullCharged: 0, partialCharged: 0, total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.fullAndPartialChargeUser){
                for (let j=0; j<outerObj.fullAndPartialChargeUser.length; j++){
                    innerObj = outerObj.fullAndPartialChargeUser[j];
                    if (innerObj.fullCharge){
                        dataObj.fullCharged = dataObj.fullCharged + innerObj.fullCharge;
                        dayDataObj.fullCharged = dayDataObj.fullCharged + innerObj.fullCharge;
                        weeklyDataObj.fullCharged = weeklyDataObj.fullCharged + innerObj.fullCharge;
                        monthlyDataObj.fullCharged = monthlyDataObj.fullCharged + innerObj.fullCharge;
                    }
                    if (innerObj.partialCharge){
                        dataObj.partialCharged = dataObj.partialCharged + innerObj.partialCharge;
                        dayDataObj.partialCharged = dayDataObj.partialCharged + innerObj.partialCharge;
                        weeklyDataObj.partialCharge = weeklyDataObj.partialCharge + innerObj.partialCharge;
                        monthlyDataObj.partialCharge = monthlyDataObj.partialCharge + innerObj.partialCharge;
                    }
                    if (innerObj.total){
                        dataObj.total = dataObj.total + innerObj.total;
                        dayDataObj.total = dayDataObj.total + innerObj.total;
                        weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                        monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                    }

                    // Hourly Bases Data
                    hourlyBasisTotalCount.push({
                        fullCharged: innerObj.fullCharge,
                        partialCharged: innerObj.partialCharge,
                        total: innerObj.total, date: innerObj.added_dtm_hours
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
                    monthlyDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({fullCharged: 0, partialCharged: 0, total: 0});
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
computeReturningUserReport = async (rawDataSet, params) =>{
    console.log('computeReturningUserReport');
    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {total: 0};
    let dayDataObj = {total: 0};
    let weeklyDataObj = {total: 0};
    let monthlyDataObj = {total: 0};
    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.returningUsers){
                for (let j=0; j<outerObj.returningUsers.length; j++){
                    innerObj = outerObj.returningUsers[j];
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
computeUserBilledPackageWiseReport = async (rawDataSet, params) =>{
    console.log('computeUserBilledPackageWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let dayDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let weeklyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};
    let monthlyDataObj = {totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.userBilled.package){
                        innerObj = billingHistory.userBilled.package;
                        if (innerObj.liveDaily){
                            dataObj.totalLiveDaily = dataObj.totalLiveDaily + innerObj.liveDaily;
                            dayDataObj.totalLiveDaily = dayDataObj.totalLiveDaily + innerObj.liveDaily;
                            weeklyDataObj.totalLiveDaily = weeklyDataObj.totalLiveDaily + innerObj.liveDaily;
                            monthlyDataObj.totalLiveDaily = monthlyDataObj.totalLiveDaily + innerObj.liveDaily;
                        }
                        if (innerObj.liveWeekly){
                            dataObj.totalLiveWeekly = dataObj.totalLiveWeekly + innerObj.liveWeekly;
                            dayDataObj.totalLiveWeekly = dayDataObj.totalLiveWeekly + innerObj.liveWeekly;
                            weeklyDataObj.totalLiveWeekly = weeklyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                            monthlyDataObj.totalLiveWeekly = monthlyDataObj.totalLiveWeekly + innerObj.liveWeekly;
                        }
                        if (innerObj.comedyDaily){
                            dataObj.totalComedyDaily = dataObj.totalComedyDaily + innerObj.comedyDaily;
                            dayDataObj.totalComedyDaily = dayDataObj.totalComedyDaily + innerObj.comedyDaily;
                            weeklyDataObj.totalComedyDaily = weeklyDataObj.totalComedyDaily + innerObj.comedyDaily;
                            monthlyDataObj.totalComedyDaily = monthlyDataObj.totalComedyDaily + innerObj.comedyDaily;
                        }
                        if (innerObj.comedyWeekly){
                            dataObj.totalComedyWeekly = dataObj.totalComedyWeekly + innerObj.comedyWeekly;
                            dayDataObj.totalComedyWeekly = dayDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                            weeklyDataObj.totalComedyWeekly = weeklyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                            monthlyDataObj.totalComedyWeekly = monthlyDataObj.totalComedyWeekly + innerObj.comedyWeekly;
                        }
                        if (innerObj.total){
                            dataObj.total = dataObj.total + innerObj.total;
                            dayDataObj.total = dayDataObj.total + innerObj.total;
                            weeklyDataObj.total = weeklyDataObj.total + innerObj.total;
                            monthlyDataObj.total = monthlyDataObj.total + innerObj.total;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            totalLiveDaily: innerObj.liveDaily, totalLiveWeekly: innerObj.liveWeekly,
                            totalComedyDaily: innerObj.comedyDaily, totalComedyWeekly: innerObj.comedyWeekly,
                            total: innerObj.total, date: billingHistory.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = billingHistory.added_dtm;

                        if (month_from_date === null)
                            month_from_date = billingHistory.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({totalLiveDaily: 0, totalLiveWeekly: 0, totalComedyDaily: 0, totalComedyWeekly: 0, total: 0});
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
computeUserBilledPaywallWiseReport = async (rawDataSet, params) =>{
    console.log('computeUserBilledPaywallWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {live: 0, comedy: 0};
    let dayDataObj = {live: 0, comedy: 0};
    let weeklyDataObj = {live: 0, comedy: 0};
    let monthlyDataObj = {live: 0, comedy: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.userBilled.paywall){
                        innerObj = billingHistory.userBilled.paywall;
                        if (innerObj.live){
                            dataObj.live = dataObj.live + innerObj.live;
                            dayDataObj.live = dayDataObj.live + innerObj.live;
                            weeklyDataObj.live = weeklyDataObj.live + innerObj.live;
                            monthlyDataObj.live = monthlyDataObj.live + innerObj.live;
                        }
                        if (innerObj.comedy){
                            dataObj.comedy = dataObj.comedy + innerObj.comedy;
                            dayDataObj.comedy = dayDataObj.comedy + innerObj.comedy;
                            weeklyDataObj.comedy = weeklyDataObj.comedy + innerObj.comedy;
                            monthlyDataObj.comedy = monthlyDataObj.comedy + innerObj.comedy;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            live: innerObj.live, comedy: innerObj.comedy,
                            date: billingHistory.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = billingHistory.added_dtm;

                        if (month_from_date === null)
                            month_from_date = billingHistory.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({live: 0, comedy: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({live: 0, comedy: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({live: 0, comedy: 0});
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
computeUserBilledOperatorWiseReport = async (rawDataSet, params) =>{
    console.log('computeUserBilledOperatorWiseReport');

    let monthNo, dayNo, week_from_date = null, month_from_date = null;
    let outerObj, innerObj, billingHistory, hourlyBasisTotalCount = [], dayWiseTotalCount = [], weekWiseTotalCount = [], monthWiseTotalCount = [];
    let dataObj = {telenor: 0, easypaisa: 0};
    let dayDataObj = {telenor: 0, easypaisa: 0};
    let weeklyDataObj = {telenor: 0, easypaisa: 0};
    let monthlyDataObj = {telenor: 0, easypaisa: 0};

    if (rawDataSet.length > 0){
        for (let i=0; i<rawDataSet.length; i++){
            outerObj = rawDataSet[i];
            if (outerObj.billingHistory){
                for (let j=0; j<outerObj.billingHistory.length; j++){
                    billingHistory = outerObj.billingHistory[j];
                    if (billingHistory.userBilled.operator){
                        innerObj = billingHistory.userBilled.operator;
                        if (innerObj.telenor){
                            dataObj.telenor = dataObj.telenor + innerObj.telenor;
                            dayDataObj.telenor = dayDataObj.telenor + innerObj.telenor;
                            weeklyDataObj.telenor = weeklyDataObj.telenor + innerObj.telenor;
                            monthlyDataObj.telenor = monthlyDataObj.telenor + innerObj.telenor;
                        }
                        if (innerObj.easypaisa){
                            dataObj.easypaisa = dataObj.easypaisa + innerObj.easypaisa;
                            dayDataObj.easypaisa = dayDataObj.easypaisa + innerObj.easypaisa;
                            weeklyDataObj.easypaisa = weeklyDataObj.easypaisa + innerObj.easypaisa;
                            monthlyDataObj.easypaisa = monthlyDataObj.easypaisa + innerObj.easypaisa;
                        }

                        // Hourly Bases Data
                        hourlyBasisTotalCount.push({
                            telenor: innerObj.telenor, easypaisa: innerObj.easypaisa,
                            date: billingHistory.added_dtm_hours
                        });

                        // reset start_date for both month & week so can update with latest one
                        if (week_from_date === null)
                            week_from_date = billingHistory.added_dtm;

                        if (month_from_date === null)
                            month_from_date = billingHistory.added_dtm;
                    }
                }

                monthNo = new Date(outerObj.date).getMonth() + 1;
                dayNo = new Date(outerObj.date).getDate();

                // Monthly Data Count
                if(Number(dayNo) === Number(helper.getDaysInMonth(monthNo))){
                    monthlyDataObj.from_date = month_from_date;
                    monthlyDataObj.to_date = outerObj.date;
                    monthWiseTotalCount.push(_.clone(monthlyDataObj));
                    monthlyDataObj = _.clone({telenor: 0, easypaisa: 0});
                    month_from_date = null;
                }

                // Weekly Data Count
                if (Number(dayNo) % 7 === 0){
                    weeklyDataObj.from_date = week_from_date;
                    weeklyDataObj.to_date = outerObj.date;
                    weekWiseTotalCount.push(_.clone(weeklyDataObj));
                    weeklyDataObj = _.clone({telenor: 0, easypaisa: 0});
                    week_from_date = null;
                }

                // Day Wise Date Count
                dayDataObj.date = outerObj.date;
                dayWiseTotalCount.push(_.clone(dayDataObj));
                dayDataObj = _.clone({telenor: 0, easypaisa: 0});
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

module.exports = {
    computeVerifiedUserReport: computeVerifiedUserReport,
    computeAccessingServiceUserReport: computeAccessingServiceUserReport,
    computeUniquePayingUserReport: computeUniquePayingUserReport,
    computeFullPartialChargedUserReport: computeFullPartialChargedUserReport,
    computeReturningUserReport: computeReturningUserReport,
    computeUserBilledPackageWiseReport: computeUserBilledPackageWiseReport,
    computeUserBilledPaywallWiseReport: computeUserBilledPaywallWiseReport,
    computeUserBilledOperatorWiseReport: computeUserBilledOperatorWiseReport,
};
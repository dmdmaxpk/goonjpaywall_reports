const container = require("../../configurations/container");
const reportsRepo = require('../../repos/ReportsRepo');

const billingHistoryRepo = container.resolve('billingHistoryRepository');
const  _ = require('lodash');

computeRevenueNetAdditionReports = async(req, res) => {
    console.log('computeRevenueNetAdditionReports');

    let fromDate, toDate, day, month, finalData, finalList = [];
    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    day = req.day ? req.day : 1;
    day = day > 9 ? day : '0'+Number(day);
    req.day = day;

    month = req.month ? req.month : 2;
    month = month > 9 ? month : '0'+Number(month);
    req.month = month;

    console.log('day : ', day, req.day);
    console.log('month : ', month, req.month);

    fromDate  = new Date('2020-'+month+'-'+day+'T00:00:00.000Z');
    toDate  = _.clone(fromDate);
    toDate.setHours(23);
    toDate.setMinutes(59);
    toDate.setSeconds(59);

    console.log('computeRevenueNetAdditionReports: ', fromDate, toDate);
    billingHistoryRepo.getnetAdditionByDateRange(req, fromDate, toDate).then(function (netAdditions) {
        console.log('netAdditions: ', netAdditions.length);

        if (netAdditions.length > 0){
            finalData = computeNetAdditionRevenueData(netAdditions);
            finalList = finalData.finalList;
            console.log('finalList.length : ', finalList.length, finalList);
            if (finalList.length > 0)
                insertNewRecord(finalList, new Date(setDate(fromDate, 0, 0, 0, 0)));
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeRevenueNetAdditionReports -> day : ', day, req.day, getDaysInMonth(month));

        if (req.day <= getDaysInMonth(month))
            computeRevenueNetAdditionReports(req, res);
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeRevenueNetAdditionReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= new Date().getMonth())
                computeRevenueNetAdditionReports(req, res);
        }
    });
};

function computeNetAdditionRevenueData(netAdditions) {

    let dateInMili, outer_added_dtm, inner_added_dtm, expire_type, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < netAdditions.length; j++) {

        outerObj = netAdditions[j];

        newObj = _.clone(cloneInfoObj());
        outer_added_dtm = setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < netAdditions.length; k++) {

                innerObj = netAdditions[k];
                inner_added_dtm = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.billing_status === 'system-after-grace-end')
                        expire_type = 'system';
                    else
                        expire_type = 'expire';

                    //Source wise Net Addition
                    if (innerObj.source === 'app'){
                        if(expire_type === 'expire')
                            newObj.source.app.expire = newObj.source.app.expire + 1;
                        else
                            newObj.source.app.system = newObj.source.app.system + 1;

                        newObj.source.app.total = newObj.source.app.total + 1;
                    }
                    else if (innerObj.source === 'web'){
                        if(expire_type === 'expire')
                            newObj.source.web.expire = newObj.source.web.expire + 1;
                        else
                            newObj.source.web.system = newObj.source.web.system + 1;

                        newObj.source.web.total = newObj.source.web.total + 1;
                    }
                    else if (innerObj.source === 'HE'){
                        if(expire_type === 'expire')
                            newObj.source.HE.expire = newObj.source.HE.expire + 1;
                        else
                            newObj.source.HE.system = newObj.source.HE.system + 1;

                        newObj.source.HE.total = newObj.source.HE.total + 1;
                    }
                    else if (innerObj.source === 'sms'){
                        if(expire_type === 'expire')
                            newObj.source.sms.expire = newObj.source.sms.expire + 1;
                        else
                            newObj.source.sms.system = newObj.source.sms.system + 1;

                        newObj.source.sms.total = newObj.source.sms.total + 1;
                    }
                    else if (innerObj.source === 'gdn2'){
                        if(expire_type === 'expire')
                            newObj.source.gdn2.expire = newObj.source.gdn2.expire + 1;
                        else
                            newObj.source.gdn2.system = newObj.source.gdn2.system + 1;

                        newObj.source.gdn2.total = newObj.source.gdn2.total + 1;
                    }
                    else if (innerObj.source === 'CP'){
                        if(expire_type === 'expire')
                            newObj.source.CP.expire = newObj.source.CP.expire + 1;
                        else
                            newObj.source.CP.system = newObj.source.CP.system + 1;

                        newObj.source.CP.total = newObj.source.CP.total + 1;
                    }
                    else if (innerObj.source === 'null'){
                        if(expire_type === 'expire')
                            newObj.source.null.expire = newObj.source.null.expire + 1;
                        else
                            newObj.source.null.system = newObj.source.null.system + 1;

                        newObj.source.null.total = newObj.source.null.total + 1;
                    }
                    else if (innerObj.source === 'affiliate_web'){
                        if(expire_type === 'expire')
                            newObj.source.affiliate_web.expire = newObj.source.affiliate_web.expire + 1;
                        else
                            newObj.source.affiliate_web.system = newObj.source.affiliate_web.system + 1;

                        newObj.source.affiliate_web.total = newObj.source.affiliate_web.total + 1;
                    }
                    else if (innerObj.source === 'system_after_grace_end'){
                        if(expire_type === 'expire')
                            newObj.source.system_after_grace_end.expire = newObj.source.system_after_grace_end.expire + 1;
                        else
                            newObj.source.system_after_grace_end.system = newObj.source.system_after_grace_end.system + 1;

                        newObj.source.system_after_grace_end.total = newObj.source.system_after_grace_end.total + 1;
                    }

                    //Package wise Net Addition
                    if(innerObj.package === 'QDfC'){
                        if(expire_type === 'expire')
                            newObj.package.dailyLive.expire = newObj.package.dailyLive.expire + 1;
                        else
                            newObj.package.dailyLive.system = newObj.package.dailyLive.system + 1;

                        newObj.package.dailyLive.total = newObj.package.dailyLive.total + 1;
                    }
                    else if(innerObj.package === 'QDfG'){
                        if(expire_type === 'expire')
                            newObj.package.weeklyLive.expire = newObj.package.weeklyLive.expire + 1;
                        else
                            newObj.package.weeklyLive.system = newObj.package.weeklyLive.system + 1;

                        newObj.package.weeklyLive.total = newObj.package.weeklyLive.total + 1;
                    }
                    else if(innerObj.package === 'QDfH'){
                        if(expire_type === 'expire')
                            newObj.package.dailyComedy.expire = newObj.package.dailyComedy.expire + 1;
                        else
                            newObj.package.dailyComedy.system = newObj.package.dailyComedy.system + 1;

                        newObj.package.dailyComedy.total = newObj.package.dailyComedy.total + 1;
                    }
                    else if(innerObj.package === 'QDfI'){
                        if(expire_type === 'expire')
                            newObj.package.weeklyComedy.expire = newObj.package.weeklyComedy.expire + 1;
                        else
                            newObj.package.weeklyComedy.system = newObj.package.weeklyComedy.system + 1;

                        newObj.package.weeklyComedy.total = newObj.package.weeklyComedy.total + 1;
                    }

                    //Paywall wise Net Addition
                    if(innerObj.paywall === 'Dt6Gp70c'){
                        if(expire_type === 'expire')
                            newObj.paywall.comedy.expire = newObj.paywall.comedy.expire + 1;
                        else
                            newObj.paywall.comedy.system = newObj.paywall.comedy.system + 1;

                        newObj.paywall.comedy.total = newObj.paywall.comedy.total + 1;
                    }
                    else if(innerObj.paywall === 'ghRtjhT7'){
                        if(expire_type === 'expire')
                            newObj.paywall.live.expire = newObj.paywall.live.expire + 1;
                        else
                            newObj.paywall.live.system = newObj.paywall.live.system + 1;

                        newObj.paywall.live.total = newObj.paywall.live.total + 1;
                    }


                    //Operator wise Net Addition
                    if(innerObj.operator === 'easypaisa'){
                        if(expire_type === 'expire')
                            newObj.operator.easypaisa.expire = newObj.operator.easypaisa.expire + 1;
                        else
                            newObj.operator.easypaisa.system = newObj.operator.easypaisa.system + 1;

                        newObj.operator.easypaisa.total = newObj.operator.easypaisa.total + 1;
                    }
                    else if(innerObj.operator === 'telenor' || !innerObj.hasOwnProperty('operator')){
                        if(expire_type === 'expire')
                            newObj.operator.telenor.expire = newObj.operator.telenor.expire + 1;
                        else
                            newObj.operator.telenor.system = newObj.operator.telenor.system + 1;

                        newObj.operator.telenor.total = newObj.operator.telenor.total + 1;
                    }

                    // Expire by unsubscribe or by system - total count by date range
                    if(!expire_type)
                        newObj.netAdditionType.expire = newObj.netAdditionType.expire + 1;
                    else
                        newObj.netAdditionType.system = newObj.netAdditionType.system + 1;

                    newObj.added_dtm = outerObj.added_dtm;
                    newObj.added_dtm_hours = setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return {finalList: finalList};
}

function insertNewRecord(finalList, dateString) {
    console.log('=>=>=>=>=>=>=> insertNewRecord', dateString, finalList.length);
    reportsRepo.getReportByDateString(dateString.toString()).then(function (result) {
        console.log('result: ', result);
        if (result.length > 0){
            result = result[0];
            result.netAdditions = finalList;

            console.log('result: ', result);
            reportsRepo.updateReport(result, result._id);
        }
        else{
            reportsRepo.createReport({netAdditions: finalList, date: dateString});
        }
    });
}

function setDate(date, h=null,m, s, mi){
    if (h !== null)
        date.setHours(h);

    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(mi);
    return date;
}

function getDaysInMonth(month) {
    return new Date(2020, month, 0).getDate();
}

function cloneInfoObj() {
    return {
        source: {
            app: { expire: 0, system: 0, total: 0 },
            web: { expire: 0, system: 0, total: 0 },
            HE: { expire: 0, system: 0, total: 0 },
            sms: { expire: 0, system: 0, total: 0 },
            gdn2: { expire: 0, system: 0, total: 0 },
            CP: { expire: 0, system: 0, total: 0 },
            null: { expire: 0, system: 0, total: 0 },
            affiliate_web: { expire: 0, system: 0, total: 0 },
            system_after_grace_end: { expire: 0, system: 0, total: 0 }
        },
        package: {
            dailyLive: { expire: 0, system: 0, total: 0 },
            weeklyLive: { expire: 0, system: 0, total: 0 },
            dailyComedy: { expire: 0, system: 0, total: 0 },
            weeklyComedy: { expire: 0, system: 0, total: 0 }
        },
        operator: {
            telenor: { expire: 0, system: 0, total: 0 },
            easypaisa: { expire: 0, system: 0, total: 0 }
        },
        paywall: {
            comedy: { expire: 0, system: 0, total: 0 },
            live: { expire: 0, system: 0, total: 0 }
        },
        netAdditionType: { expire: 0, system: 0 },
        added_dtm: '',
        added_dtm_hours: ''
    };
}

module.exports = {
    computeRevenueNetAdditionReports: computeRevenueNetAdditionReports,
};
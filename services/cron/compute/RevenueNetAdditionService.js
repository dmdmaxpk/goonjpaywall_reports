const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalData, finalList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeRevenueNetAdditionReports = async(req, res) => {
    console.log('computeRevenueNetAdditionReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDateWithLocalTime(req, 16, 10);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('fromDate: ', fromDate, toDate);
    query = countQuery(fromDate, toDate);

    await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
        console.log('totalCount: ', totalCount);

        if (totalCount > 0){
            computeChunks = helper.getChunks(totalCount);
            totalChunks = computeChunks.chunks;
            lastLimit = computeChunks.lastChunkCount;
            let skip = 0;

            //Loop over no.of chunks
            for (i = 0 ; i < totalChunks; i++){
                await  billingHistoryRepo.getNetAdditionByDateRange(req, fromDate, toDate, skip, limit).then(async function (netAdditions) {
                    console.log('netAdditions : ', netAdditions.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (netAdditions.length > 0){
                        finalData = computeNetAdditionRevenueData(netAdditions);
                        finalList = finalData.finalList;
                        console.log('finalList.length : ', finalList.length);
                        if (finalList.length > 0)
                            await insertNewRecord(finalList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await  billingHistoryRepo.getNetAdditionByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (netAdditions) {
                    console.log('netAdditions: ', netAdditions.length);

                    // Now compute and store data in DB
                    if (netAdditions.length > 0){
                        finalData = computeNetAdditionRevenueData(netAdditions);
                        finalList = finalData.finalList;
                        console.log('finalList.length : ', finalList.length);
                        if (finalList.length > 0)
                            await insertNewRecord(finalList, fromDate, 1);
                    }
                });
            }
        }

        // Get compute data for next time slot
        req.day = Number(req.day) + 1;
        console.log('computeRevenueNetAdditionReports -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            console.log('IF');
            if (month < helper.getTodayMonthNo())
                computeRevenueNetAdditionReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeRevenueNetAdditionReports(req, res);
        }
        else{
            console.log('ELSE');
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('computeRevenueNetAdditionReports -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeRevenueNetAdditionReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('computeRevenueNetAdditionReports - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeRevenueNetAdditionReports = async(req, res) => {
    console.log('promiseBasedComputeRevenueNetAdditionReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data as per day
        * */
        dateData = helper.computeTodayDateWithLocalTime(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('fromDate: ', fromDate, toDate);
        query = countQuery(fromDate, toDate);

        await helper.getTotalCount(req, fromDate, toDate, 'billinghistories', query).then(async function (totalCount) {
            console.log('totalCount: ', totalCount);

            if (totalCount > 0){
                computeChunks = helper.getChunks(totalCount);
                totalChunks = computeChunks.chunks;
                lastLimit = computeChunks.lastChunkCount;
                let skip = 0;

                //Loop over no.of chunks
                for (i = 0 ; i < totalChunks; i++){
                    await  billingHistoryRepo.getNetAdditionByDateRange(req, fromDate, toDate, skip, limit).then(async function (netAdditions) {
                        console.log('netAdditions : ', netAdditions.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (netAdditions.length > 0){
                            finalData = computeNetAdditionRevenueData(netAdditions);
                            finalList = finalData.finalList;
                            console.log('finalList.length : ', finalList.length);
                            if (finalList.length > 0)
                                await insertNewRecord(finalList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await  billingHistoryRepo.getNetAdditionByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (netAdditions) {
                        console.log('netAdditions: ', netAdditions.length);

                        // Now compute and store data in DB
                        if (netAdditions.length > 0){
                            finalData = computeNetAdditionRevenueData(netAdditions);
                            finalList = finalData.finalList;
                            console.log('finalList.length : ', finalList.length);
                            if (finalList.length > 0)
                                await insertNewRecord(finalList, fromDate, 1);
                        }
                    });
                }
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeRevenueNetAdditionReports - data compute - done');
            delete req.day;
            delete req.month;
        }

        resolve(0);
    });
};

function computeNetAdditionRevenueData(netAdditions) {
    console.log('==>', JSON.stringify(netAdditions));
    let dateInMili, outer_billing_dtm, inner_billing_dtm, expire_type, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < netAdditions.length; j++) {

        outerObj = netAdditions[j];

        newObj = _.cloneDeep(cloneInfoObj());
        outer_billing_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_billing_dtm){
            for (let k=0; k < netAdditions.length; k++) {

                innerObj = netAdditions[k];
                inner_billing_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();

                if (outer_billing_dtm === inner_billing_dtm){
                    dateInMili = inner_billing_dtm;
                    if (innerObj.billing_source === 'system-after-grace-end' || innerObj.billing_source === 'system' || innerObj.billing_source === 'dmdmax'){
                        expire_type = 'system';
                        newObj.netAdditionType.system = newObj.netAdditionType.system + 1;
                    }
                    else{
                        expire_type = 'expire';
                        newObj.netAdditionType.expire = newObj.netAdditionType.expire + 1;
                    }

                    //Source wise Net Addition
                    if (innerObj.billing_source === 'app'){
                        if(expire_type === 'expire')
                            newObj.source.app.expire = newObj.source.app.expire + 1;
                        else
                            newObj.source.app.system = newObj.source.app.system + 1;

                        newObj.source.app.total = newObj.source.app.total + 1;
                    }
                    else if (innerObj.billing_source === 'web'){
                        if(expire_type === 'expire')
                            newObj.source.web.expire = newObj.source.web.expire + 1;
                        else
                            newObj.source.web.system = newObj.source.web.system + 1;

                        newObj.source.web.total = newObj.source.web.total + 1;
                    }
                    else if (innerObj.billing_source === 'CP_whatsappccd'){
                        if(expire_type === 'expire')
                            newObj.source.CP_whatsappccd.expire = newObj.source.CP_whatsappccd.expire + 1;
                        else
                            newObj.source.CP_whatsappccd.system = newObj.source.CP_whatsappccd.system + 1;

                        newObj.source.CP_whatsappccd.total = newObj.source.CP_whatsappccd.total + 1;
                    }
                    else if (innerObj.billing_source === 'ccp_api'){
                        if(expire_type === 'expire')
                            newObj.source.ccp_api.expire = newObj.source.ccp_api.expire + 1;
                        else
                            newObj.source.ccp_api.system = newObj.source.ccp_api.system + 1;

                        newObj.source.ccp_api.total = newObj.source.ccp_api.total + 1;
                    }
                    else if (innerObj.billing_source === 'dmdmax'){
                        if(expire_type === 'expire')
                            newObj.source.dmdmax.expire = newObj.source.dmdmax.expire + 1;
                        else
                            newObj.source.dmdmax.system = newObj.source.dmdmax.system + 1;

                        newObj.source.dmdmax.total = newObj.source.dmdmax.total + 1;
                    }
                    else if (innerObj.billing_source === 'system'){
                        if(expire_type === 'expire')
                            newObj.source.system.expire = newObj.source.system.expire + 1;
                        else
                            newObj.source.system.system = newObj.source.system.system + 1;

                        newObj.source.system.total = newObj.source.system.total + 1;
                    }
                    else if (innerObj.billing_source === 'CP_telenorccd'){
                        if(expire_type === 'expire')
                            newObj.source.CP_telenorccd.expire = newObj.source.CP_telenorccd.expire + 1;
                        else
                            newObj.source.CP_telenorccd.system = newObj.source.CP_telenorccd.system + 1;

                        newObj.source.CP_telenorccd.total = newObj.source.CP_telenorccd.total + 1;
                    }
                    else if (innerObj.billing_source === 'CP_productccd'){
                        if(expire_type === 'expire')
                            newObj.source.CP_productccd.expire = newObj.source.CP_productccd.expire + 1;
                        else
                            newObj.source.CP_productccd.system = newObj.source.CP_productccd.system + 1;

                        newObj.source.CP_productccd.total = newObj.source.CP_productccd.total + 1;
                    }
                    else if (innerObj.billing_source === 'CP_ideationccd1'){
                        if(expire_type === 'expire')
                            newObj.source.CP_ideationccd1.expire = newObj.source.CP_ideationccd1.expire + 1;
                        else
                            newObj.source.CP_ideationccd1.system = newObj.source.CP_ideationccd1.system + 1;

                        newObj.source.CP_ideationccd1.total = newObj.source.CP_ideationccd1.total + 1;
                    }
                    else if (innerObj.billing_source === 'CP_ideationccd2'){
                        if(expire_type === 'expire')
                            newObj.source.CP_ideationccd2.expire = newObj.source.CP_ideationccd2.expire + 1;
                        else
                            newObj.source.CP_ideationccd2.system = newObj.source.CP_ideationccd2.system + 1;

                        newObj.source.CP_ideationccd2.total = newObj.source.CP_ideationccd2.total + 1;
                    }
                    else if (innerObj.billing_source === 'system-after-grace-end'){
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

                    newObj.billing_dtm = innerObj.billing_dtm;
                    newObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return {finalList: finalList};
}

async function insertNewRecord(finalList, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];
            if (mode === 0)
                result.netAdditions = finalList;
            else
                result.netAdditions = result.netAdditions.concat(finalList);

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({netAdditions: finalList, date: dateString});
    });
}

function cloneInfoObj() {
    let expireObj = { expire: 0, system: 0, total: 0 };

    return {
        source: {
            app: _.cloneDeep(expireObj),
            web: _.cloneDeep(expireObj),
            ccp_api: _.cloneDeep(expireObj),
            CP_whatsappccd: _.cloneDeep(expireObj),
            dmdmax: _.cloneDeep(expireObj),
            system: _.cloneDeep(expireObj),
            CP_telenorccd: _.cloneDeep(expireObj),
            CP_productccd: _.cloneDeep(expireObj),
            CP_ideationccd1: _.cloneDeep(expireObj),
            CP_ideationccd2: _.cloneDeep(expireObj),
            system_after_grace_end: _.cloneDeep(expireObj)
        },
        package: {
            dailyLive: _.cloneDeep(expireObj),
            weeklyLive: _.cloneDeep(expireObj),
            dailyComedy: _.cloneDeep(expireObj),
            weeklyComedy: _.cloneDeep(expireObj)
        },
        operator: {
            telenor: _.cloneDeep(expireObj),
            easypaisa: _.cloneDeep(expireObj)
        },
        paywall: {
            comedy: _.cloneDeep(expireObj),
            live: _.cloneDeep(expireObj)
        },
        netAdditionType: { expire: 0, system: 0 },
        billing_dtm: '',
        billing_dtm_hours: ''
    };
}

function countQuery(from, to){
    return [
        {$match : {
                $or:[{billing_status: "expired"}, {billing_status: "unsubscribe-request-received-and-expired"}],
                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lt:new Date(to)}}]
            }},
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeRevenueNetAdditionReports: computeRevenueNetAdditionReports,
    promiseBasedComputeRevenueNetAdditionReports: promiseBasedComputeRevenueNetAdditionReports
};
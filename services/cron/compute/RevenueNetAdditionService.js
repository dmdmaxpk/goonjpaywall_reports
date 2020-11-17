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
    dateData = helper.computeNextDate(req, 10, 11);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    console.log('fromDate: ', fromDate, toDate);
    query = countQuery(fromDate, toDate);

    await helper.getTotalCount(req, fromDate, toDate, 'subscriptions', query).then(async function (totalCount) {
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
        dateData = helper.computeTodayDate(req);
        req = dateData.req;
        day = dateData.day;
        month = dateData.month;
        fromDate = dateData.fromDate;
        toDate = dateData.toDate;

        console.log('fromDate: ', fromDate, toDate);
        query = countQuery(fromDate, toDate);

        await helper.getTotalCount(req, fromDate, toDate, 'subscriptions', query).then(async function (totalCount) {
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

    let dateInMili, outer_added_dtm, inner_added_dtm, expire_type, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < netAdditions.length; j++) {

        outerObj = netAdditions[j];

        newObj = _.clone(cloneInfoObj());
        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < netAdditions.length; k++) {

                innerObj = netAdditions[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;
                    if (innerObj.billing_source === 'system-after-grace-end' || innerObj.billing_source === 'system' || innerObj.billing_source === 'dmdmax'){
                        expire_type = 'system';
                        newObj.netAdditionType.system = newObj.netAdditionType.system + 1;
                    }
                    else{
                        expire_type = 'expire';
                        newObj.netAdditionType.expire = newObj.netAdditionType.expire + 1;
                    }

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

                    newObj.added_dtm = innerObj.added_dtm;
                    newObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
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

function countQuery(from, to){
    return [
        {$match : {
                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
            }},
        {$lookup:{
                from: "billinghistories",
                localField: "subscriber_id",
                foreignField: "subscriber_id",
                as: "histories"}
        },
        { $project: {
                source:"$source",
                added_dtm:"$added_dtm",
                subscription_status:"$subscription_status",
                bill_status: { $filter: {
                        input: "$histories",
                        as: "history",
                        cond: { $or: [
                                { $eq: ['$$history.billing_status',"expired"] },
                                { $eq: ['$$history.billing_status',"unsubscribe-request-recieved"] },
                                { $eq: ['$$history.billing_status',"unsubscribe-request-received-and-expired"] }
                            ]}
                    }} }
        },
        {$project: {
                source:"$source",
                added_dtm:"$added_dtm",
                numOfFailed: { $size:"$bill_status" },
                subscription_status:"$subscription_status",
                billing_status: {"$arrayElemAt": ["$bill_status.billing_status",0]},
                package: {"$arrayElemAt": ["$bill_status.package_id",0]},
                paywall: {"$arrayElemAt": ["$bill_status.paywall_id",0]},
                operator: {"$arrayElemAt": ["$bill_status.operator",0]},
                billing_dtm: {"$arrayElemAt": ["$bill_status.billing_dtm",0]}
            }
        },
        {$match: { numOfFailed: {$gte: 1}  }},
        {$project: {
                _id: 0,
                added_dtm:"$added_dtm",
                source:"$source",
                subscription_status:"$subscription_status",
                billing_status:"$billing_status",
                package: "$package",
                paywall: "$paywall",
                operator: "$operator",
                billing_dtm: "$billing_dtm",
            }
        },
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeRevenueNetAdditionReports: computeRevenueNetAdditionReports,
    promiseBasedComputeRevenueNetAdditionReports: promiseBasedComputeRevenueNetAdditionReports
};
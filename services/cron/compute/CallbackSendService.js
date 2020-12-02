const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const billingHistoryRepo = container.resolve('billingHistoryRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let dateData, fromDate, toDate, day, month, finalList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeCallbackSendReports = async(req, res) => {
    console.log('computeCallbackSendReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 8, 11);
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
                await billingHistoryRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, limit).then(async function (histories) {
                    console.log('histories 1: ', histories.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (histories.length > 0){
                        finalList = computeUserData(histories);
                        await insertNewRecord(finalList, fromDate, i);
                    }
                });
            }

            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await billingHistoryRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (histories) {
                    console.log('histories 2: ', histories.length);

                    // Now compute and store data in DB
                    if (histories.length > 0){
                        finalList = computeUserData(histories);
                        await insertNewRecord(finalList, fromDate, 1);
                    }
                });
            }
        }

    });

    // Get compute data for next time slot
    req.day = Number(req.day) + 1;
    console.log('computeCallbackSendReports -> day : ', day, req.day, helper.getDaysInMonth(month));

    if (req.day <= helper.getDaysInMonth(month)){
        console.log('IF');
        if (month < helper.getTodayMonthNo())
            computeCallbackSendReports(req, res);
        else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
            computeCallbackSendReports(req, res);
    }
    else{
        console.log('ELSE');
        req.day = 1;
        req.month = Number(req.month) + 1;
        console.log('computeCallbackSendReports -> month : ', month, req.month, new Date().getMonth());

        if (req.month <= helper.getTodayMonthNo())
            computeCallbackSendReports(req, res);
    }

    if (helper.isToday(fromDate)){
        console.log('computeCallbackSendReports - data compute - done');
        delete req.day;
        delete req.month;
    }
};

promiseBasedComputeCallbackSendReports = async(req, res) => {
    console.log('promiseBasedComputeCallbackSendReports');
    return new Promise(async (resolve, reject) => {

        /*
        * Compute date and time for data fetching from db
        * Script will execute to fetch data for today
        * */
        dateData = helper.computeTodayDate(req);
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
                    await billingHistoryRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, limit).then(async function (histories) {
                        console.log('histories 1: ', histories.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (histories.length > 0){
                            finalList = computeUserData(histories);
                            await insertNewRecord(finalList, fromDate, i);
                        }
                    });
                }

                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await billingHistoryRepo.getCallbackSendByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (histories) {
                        console.log('histories 2: ', histories.length);

                        // Now compute and store data in DB
                        if (histories.length > 0){
                            finalList = computeUserData(histories);
                            await insertNewRecord(finalList, fromDate, 1);
                        }
                    });
                }
            }

        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeCallbackSendReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeUserData(histories) {

    let dateInMili, outer_added_dtm, inner_added_dtm, newObj, outerObj, innerObj, finalList = [];
    for (let j=0; j < histories.length; j++) {

        outerObj = histories[j];
        newObj = {callbackSent : 0, billing_dtm: '', added_dtm_hours: ''};
        outer_added_dtm = helper.setDate(new Date(outerObj.billing_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < histories.length; k++) {

                innerObj = histories[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    dateInMili = inner_added_dtm;

                    newObj.callbackSent = newObj.callbackSent + 1;

                    newObj.billing_dtm = outerObj.billing_dtm;
                    newObj.billing_dtm_hours = helper.setDate(new Date(innerObj.billing_dtm), null, 0, 0, 0);
                }
            }
            finalList.push(newObj);
        }
    }

    return finalList;
}

async function insertNewRecord(data, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0){
            result = result[0];
            if (mode === 0)
                result.callbackSend = data;
            else
                result.callbackSend = result.callbackSend.concat(data);

            await reportsRepo.updateReport(result, result._id);
        }
        else
            await reportsRepo.createReport({callbackSend: data, date: dateString});
    });
}

function countQuery(from, to){
    return [
        { $match:{
            billing_status: "Affiliate callback sent",
            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
        }},
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeCallbackSendReports: computeCallbackSendReports,
    promiseBasedComputeCallbackSendReports: promiseBasedComputeCallbackSendReports,
};
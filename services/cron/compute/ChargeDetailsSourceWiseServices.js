const container = require("../../../configurations/container");
const reportsRepo = require('../../../repos/apis/ReportsRepo');
const subscriptionRepo = container.resolve('subscriptionRepository');
const helper = require('../../../helper/helper');
const config = require('../../../config');
const  _ = require('lodash');

let fromDate, toDate, day, month, finalData, chargeDetailSourceWiseList = [], transactionsSourceWiseList = [];
let query, computeChunks, totalChunks = 0, lastLimit = 0, limit = config.cron_db_query_data_limit;
computeChargeDetailsSourceWiseReports = async(req, res) => {
    console.log('computeChargeDetailsSourceWiseReports');

    /*
    * Compute date and time for data fetching from db
    * Script will execute to fetch data as per day
    * */
    dateData = helper.computeNextDate(req, 1, 2);
    req = dateData.req;
    day = dateData.day;
    month = dateData.month;
    fromDate = dateData.fromDate;
    toDate = dateData.toDate;

    /*
    * Get total count from db
    * */
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
                await subscriptionRepo.getChargeDetailsSourceWiseByDateRange(req, fromDate, toDate, skip, limit).then(async function (chargeDetails) {
                    console.log('chargeDetails: ', chargeDetails.length);

                    //set skip variable to limit data
                    skip = skip + limit;

                    // Now compute and store data in DB
                    if (chargeDetails.length > 0){
                        finalData = computeChargeDetailSourceWiseData(chargeDetails);
                        chargeDetailSourceWiseList = finalData.chargeDetailSourceWiseList;
                        transactionsSourceWiseList = finalData.transactionsSourceWiseList;
                        await insertNewRecord(chargeDetailSourceWiseList, transactionsSourceWiseList, fromDate, i);
                    }
                });
            }


            // fetch last chunk Data from DB
            if (lastLimit > 0){
                await subscriptionRepo.getChargeDetailsSourceWiseByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (chargeDetails) {
                    console.log('chargeDetails: ', chargeDetails.length);

                    if (chargeDetails.length > 0){
                        finalData = computeChargeDetailSourceWiseData(chargeDetails);
                        chargeDetailSourceWiseList = finalData.chargeDetailSourceWiseList;
                        transactionsSourceWiseList = finalData.transactionsSourceWiseList;
                        await insertNewRecord(chargeDetailSourceWiseList, transactionsSourceWiseList, fromDate, 1);
                    }
                });
            }
        }


        // Recurring - get and compute data for next day - time slot
        req.day = Number(req.day) + 1;
        console.log('getChargeDetailsSourceWiseByDateRange -> day : ', day, req.day, helper.getDaysInMonth(month));

        if (req.day <= helper.getDaysInMonth(month)){
            if (month < helper.getTodayMonthNo())
                computeChargeDetailsSourceWiseReports(req, res);
            else if (month === helper.getTodayMonthNo() && req.day <= helper.getTodayDayNo())
                computeChargeDetailsSourceWiseReports(req, res);
        }
        else{
            req.day = 1;
            req.month = Number(req.month) + 1;
            console.log('getChargeDetailsSourceWiseByDateRange -> month : ', month, req.month, new Date().getMonth());

            if (req.month <= helper.getTodayMonthNo())
                computeChargeDetailsSourceWiseReports(req, res);
        }

        if (helper.isToday(fromDate)){
            console.log('getChargeDetailsSourceWiseByDateRange - data compute - done');
            delete req.day;
            delete req.month;
        }
    });
};

promiseBasedComputeChargeDetailsReports = async(req, res) => {
    console.log('promiseBasedComputeChargeDetailsReports');
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

        /*
        * Get total count from db
        * */
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
                    await subscriptionRepo.getChargeDetailsSourceWiseByDateRange(req, fromDate, toDate, skip, limit).then(async function (chargeDetails) {
                        console.log('chargeDetails: ', chargeDetails.length);

                        //set skip variable to limit data
                        skip = skip + limit;

                        // Now compute and store data in DB
                        if (chargeDetails.length > 0){
                            finalData = computeChargeDetailSourceWiseData(chargeDetails);
                            chargeDetailSourceWiseList = finalData.chargeDetailSourceWiseList;
                            transactionsSourceWiseList = finalData.transactionsSourceWiseList;
                            await insertNewRecord(chargeDetailSourceWiseList, transactionsSourceWiseList, fromDate, i);
                        }
                    });
                }


                // fetch last chunk Data from DB
                if (lastLimit > 0){
                    await subscriptionRepo.getChargeDetailsSourceWiseByDateRange(req, fromDate, toDate, skip, lastLimit).then(async function (chargeDetails) {
                        console.log('chargeDetails: ', chargeDetails.length);

                        if (chargeDetails.length > 0){
                            finalData = computeChargeDetailSourceWiseData(chargeDetails);
                            chargeDetailSourceWiseList = finalData.chargeDetailSourceWiseList;
                            transactionsSourceWiseList = finalData.transactionsSourceWiseList;
                            await insertNewRecord(chargeDetailSourceWiseList, transactionsSourceWiseList, fromDate, 1);
                        }
                    });
                }
            }
        });

        if (helper.isToday(fromDate)){
            console.log('promiseBasedComputeChargeDetailsReports - data compute - done');
            delete req.day;
            delete req.month;
        }
        resolve(0);
    });
};

function computeChargeDetailSourceWiseData(chargeDetails) {

    let dateInMili, outer_added_dtm, inner_added_dtm, outerObj, innerObj, price, micro_charge;
    let chargeDetailSourceWiseObj, transactionsSourceWiseObj;
    let chargeDetailSourceWiseList = [], transactionsSourceWiseList = [];

    for (let j=0; j < chargeDetails.length; j++) {

        outerObj = chargeDetails[j];

        chargeDetailSourceWiseObj = _.clone(cloneChargeDetailSourceWiseObj());
        transactionsSourceWiseObj = _.clone(cloneTransactionSourceWiseObj());

        outer_added_dtm = helper.setDate(new Date(outerObj.added_dtm), null, 0, 0, 0).getTime();

        if (dateInMili !== outer_added_dtm){
            for (let k=0; k < chargeDetails.length; k++) {

                innerObj = chargeDetails[k];
                inner_added_dtm = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0).getTime();

                if (outer_added_dtm === inner_added_dtm){
                    micro_charge = innerObj.micro_charge === false ? false : true;
                    price = innerObj.price - (innerObj.discount ? innerObj.discount : 0);
                    dateInMili = inner_added_dtm;

                    //Source wise Charge Details
                    if (innerObj.source === 'app'){
                        transactionsSourceWiseObj.source.app = transactionsSourceWiseObj.source.app + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.app.full = chargeDetailSourceWiseObj.source.app.full + price;
                        else
                            chargeDetailSourceWiseObj.source.app.micro = chargeDetailSourceWiseObj.source.app.micro + price;

                        chargeDetailSourceWiseObj.source.app.total = chargeDetailSourceWiseObj.source.app.total + price;
                    }
                    else if (innerObj.source === 'web'){
                        transactionsSourceWiseObj.source.web = transactionsSourceWiseObj.source.web + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.web.full = chargeDetailSourceWiseObj.source.web.full + price;
                        else
                            chargeDetailSourceWiseObj.source.web.micro = chargeDetailSourceWiseObj.source.web.micro + price;

                        chargeDetailSourceWiseObj.source.web.total = chargeDetailSourceWiseObj.source.web.total + price;
                    }
                    else if (innerObj.source === 'HE'){
                        transactionsSourceWiseObj.source.HE = transactionsSourceWiseObj.source.HE + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.HE.full = chargeDetailSourceWiseObj.source.HE.full + price;
                        else
                            chargeDetailSourceWiseObj.source.HE.micro = chargeDetailSourceWiseObj.source.HE.micro + price;

                        chargeDetailSourceWiseObj.source.HE.total = chargeDetailSourceWiseObj.source.HE.total + price;
                    }
                    else if (innerObj.source === 'sms'){
                        transactionsSourceWiseObj.source.sms = transactionsSourceWiseObj.source.sms + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.sms.full = chargeDetailSourceWiseObj.source.sms.full + price;
                        else
                            chargeDetailSourceWiseObj.source.sms.micro = chargeDetailSourceWiseObj.source.sms.micro + price;

                        chargeDetailSourceWiseObj.source.sms.total = chargeDetailSourceWiseObj.source.sms.total + price;
                    }
                    else if (innerObj.source === 'gdn2'){
                        transactionsSourceWiseObj.source.gdn2 = transactionsSourceWiseObj.source.gdn2 + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.gdn2.full = chargeDetailSourceWiseObj.source.gdn2.full + price;
                        else
                            chargeDetailSourceWiseObj.source.gdn2.micro = chargeDetailSourceWiseObj.source.gdn2.micro + price;

                        chargeDetailSourceWiseObj.source.gdn2.total = chargeDetailSourceWiseObj.source.gdn2.total + price;
                    }
                    else if (innerObj.source === 'CP'){
                        transactionsSourceWiseObj.source.CP = transactionsSourceWiseObj.source.CP + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.CP.full = chargeDetailSourceWiseObj.source.CP.full + price;
                        else
                            chargeDetailSourceWiseObj.source.CP.micro = chargeDetailSourceWiseObj.source.CP.micro + price;

                        chargeDetailSourceWiseObj.source.CP.total = chargeDetailSourceWiseObj.source.CP.total + price;
                    }
                    else if (innerObj.source === 'null'){
                        transactionsSourceWiseObj.source.null = transactionsSourceWiseObj.source.null + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.null.full = chargeDetailSourceWiseObj.source.null.full + price;
                        else
                            chargeDetailSourceWiseObj.source.null.micro = chargeDetailSourceWiseObj.source.null.micro + price;

                        chargeDetailSourceWiseObj.source.null.total = chargeDetailSourceWiseObj.source.null.total + price;
                    }
                    else if (innerObj.source === 'affiliate_web'){
                        transactionsSourceWiseObj.source.affiliate_web = transactionsSourceWiseObj.source.affiliate_web + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.affiliate_web.full = chargeDetailSourceWiseObj.source.affiliate_web.full + price;
                        else
                            chargeDetailSourceWiseObj.source.affiliate_web.micro = chargeDetailSourceWiseObj.source.affiliate_web.micro + price;

                        chargeDetailSourceWiseObj.source.affiliate_web.total = chargeDetailSourceWiseObj.source.affiliate_web.total + price;
                    }
                    else if (innerObj.source === 'system_after_grace_end'){
                        transactionsSourceWiseObj.source.system_after_grace_end = transactionsSourceWiseObj.source.system_after_grace_end + 1;

                        if(!micro_charge)
                            chargeDetailSourceWiseObj.source.system_after_grace_end.full = chargeDetailSourceWiseObj.source.system_after_grace_end.full + price;
                        else
                            chargeDetailSourceWiseObj.source.system_after_grace_end.micro = chargeDetailSourceWiseObj.source.system_after_grace_end.micro + price;

                        chargeDetailSourceWiseObj.source.system_after_grace_end.total = chargeDetailSourceWiseObj.source.system_after_grace_end.total + price;
                    }

                    // Add Timestemps
                    // Charge details Source Wise - timestemp
                    chargeDetailSourceWiseObj.added_dtm = outerObj.added_dtm;
                    chargeDetailSourceWiseObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);

                    // Transactions Source Wise - timestemp
                    chargeDetailSourceWiseObj.added_dtm = outerObj.added_dtm;
                    chargeDetailSourceWiseObj.added_dtm_hours = helper.setDate(new Date(innerObj.added_dtm), null, 0, 0, 0);
                }
            }

            chargeDetailSourceWiseList.push(chargeDetailSourceWiseObj);
            transactionsSourceWiseList.push(transactionsSourceWiseObj);
        }
    }

    return {
        chargeDetailSourceWiseList: chargeDetailSourceWiseList,
        transactionsSourceWiseList: transactionsSourceWiseList,
    };
}

async function insertNewRecord(chargeDetailSourceWiseList, transactionsSourceWiseList, dateString, mode) {
    console.log('insertNewRecord - dateString', dateString);
    dateString = helper.setDateWithTimezone(new Date(dateString), 'out');
    dateString = new Date(helper.setDate(dateString, 0, 0, 0, 0));
    console.log('insertNewRecord - dateString', dateString);

    await reportsRepo.getReportByDateString(dateString.toString()).then(async function (result) {
        if (result.length > 0) {
            result = result[0];
            if (mode === 0) {
                console.log('mode = 0');

                //charge details
                if (result.chargeDetails)
                    result.chargeDetails.sourceWise = chargeDetailSourceWiseList;
                else{
                    result.chargeDetails = {sourceWise: ''};
                    result.chargeDetails.sourceWise = chargeDetailSourceWiseList;
                }

                //transactions
                if (result.transactions)
                    result.transactions.sourceWise = transactionsSourceWiseList;
                else{
                    result.transactions = {sourceWise: ''};
                    result.transactions.sourceWise = transactionsSourceWiseList;
                }
            }else{
                console.log('mode > 0');

                //charge details
                if (result.chargeDetails)
                    if (result.chargeDetails.sourceWise)
                        result.chargeDetails.sourceWise = result.chargeDetails.sourceWise.concat(chargeDetailSourceWiseList);
                    else
                        result.chargeDetails.sourceWise = chargeDetailSourceWiseList;
                else{
                    result.chargeDetails = {sourceWise: ''};
                    result.chargeDetails.sourceWise = chargeDetailSourceWiseList;
                }

                //transactions
                if (result.transactions)
                    if (result.transactions.sourceWise)
                        result.transactions.sourceWise = result.transactions.sourceWise.concat(transactionsSourceWiseList);
                    else
                        result.transactions.sourceWise = transactionsSourceWiseList;
                else{
                    result.transactions = {sourceWise: ''};
                    result.transactions.sourceWise = transactionsSourceWiseList;
                }
            }

            console.log('IF - result.chargeDetails.sourceWise: ', result.chargeDetails.sourceWise);
            console.log('IF - result.transactions.sourceWise: ', result.transactions.sourceWise);
            await reportsRepo.updateReport(result, result._id);
        }
        else{
            //charge details
            let chargeDetails = {sourceWise: ''};
            chargeDetails.sourceWise = chargeDetailSourceWiseList;

            //transactions
            let transactions = {sourceWise: ''};
            transactions.sourceWise = transactionsSourceWiseList;

            console.log('ELSE - result.chargeDetails.sourceWise: ', result.chargeDetails.sourceWise) ;
            console.log('ELSE - result.transactions.sourceWise: ', result.transactions.sourceWise) ;

            await reportsRepo.createReport({chargeDetails: chargeDetails, transactions: transactions, date: dateString});
        }
    });
}

function cloneChargeDetailSourceWiseObj() {
    return {
        source: {
            app: { full: 0, micro: 0, total: 0 },
            web: { full: 0, micro: 0, total: 0 },
            HE: { full: 0, micro: 0, total: 0 },
            sms: { full: 0, micro: 0, total: 0 },
            gdn2: { full: 0, micro: 0, total: 0 },
            CP: { full: 0, micro: 0, total: 0 },
            null: { full: 0, micro: 0, total: 0 },
            affiliate_web: { full: 0, micro: 0, total: 0 },
            system_after_grace_end: { full: 0, micro: 0, total: 0 }
        },
        added_dtm: '',
        added_dtm_hours: ''
    }
}
function cloneTransactionSourceWiseObj() {
    return {
        source: {
            app: 0,
            web: 0,
            HE: 0,
            sms: 0,
            gdn2: 0,
            CP: 0,
            null: 0,
            affiliate_web: 0,
            system_after_grace_end: 0
        },
        added_dtm: '',
        added_dtm_hours: ''
    }
}

function countQuery(from, to){
    return [
        {
            $match: {
                $or:[{"subscription_status": "billed"}, {"subscription_status": "graced"}],
                $and: [{added_dtm: {$gte: new Date(from)}}, {added_dtm: {$lte: new Date(to)}}]
            }
        },
        {
            $lookup: {
                from: "billinghistories",
                localField: "subscriber_id",
                foreignField: "subscriber_id",
                as: "histories"
            }
        },
        {
            $project: {
                source: "$source",
                added_dtm: "$added_dtm",
                subscription_status: "$subscription_status",
                succeses: {
                    $filter: {
                        input: "$histories",
                        as: "history",
                        cond: {
                            $or: [
                                {$eq: ['$$history.billing_status', "Success"]},
                                {$eq: ['$$history.billing_status', "billed"]},
                                {$eq: ['$$history.billing_status', "graced"]},
                            ]
                        }
                    }
                }
            }
        },
        {
            $project: {
                source: "$source",
                added_dtm: "$added_dtm",
                numOfSucc: {$size: "$succeses"},
                price: {"$arrayElemAt": ["$succeses.price", 0]},
                discount: {"$arrayElemAt": ["$succeses.discount", 0]},
                billing_dtm: {"$arrayElemAt": ["$succeses.billing_dtm", 0]}
            }
        },
        {$match: {numOfSucc: {$gte: 1}}},
        {
            $project: {
                _id: 0,
                added_dtm: "$added_dtm",
                source: "$source",
                price: "$price",
                discount: "$discount",
                billing_dtm: "$billing_dtm",
            }
        },
        {
            $count: "count"
        }
    ];
}

module.exports = {
    computeChargeDetailsSourceWiseReports: computeChargeDetailsSourceWiseReports,
    promiseBasedComputeChargeDetailsReports: promiseBasedComputeChargeDetailsReports
};
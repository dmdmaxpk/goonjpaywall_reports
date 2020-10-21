const config = require('../../config');

class BillingHistoryRepository {
    async getBillingHistoryByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.find({
                        $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                    }, { allowDiskUse: true })
                    .sort({billing_dtm: 1})
                    .limit(config.cron_db_query_data_limit)
                    .toArray(function(err, items) {
                        if(err){
                            console.log('getBillingHistoryByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getnetAdditionByDateRange(req, from, to, skip, limit){
        return new Promise((resolve, reject) => {
            console.log('getnetAdditionByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {

                if (!err) {
                    collection.aggregate( [
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
                        }
                    ]).skip(skip).limit(limit).toArray(function(err, items) {
                        if(err){
                            console.log('getnetAdditionByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getSubscriberTransactionsByDateRange(req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getSubscriberTransactionsByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        { $group: {
                            _id: "$subscriber_id",
                            data: { $push:  {
                                price: "$price",
                                paywall_id: "$paywall_id",
                                package_id: "$package_id",
                                operator: "$operator",
                                billing_status: "$billing_status",
                                billing_dtm: "$billing_dtm"
                            }}
                        }},
                        { $project: {
                            subscriber_id: "$_id",
                            transactions: "$data",
                        }},
                    ], { allowDiskUse: true })
                    .toArray(function(err, items) {
                        if(err){
                            console.log('getSubscriberTransactionsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = BillingHistoryRepository;
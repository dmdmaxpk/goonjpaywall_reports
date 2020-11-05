
class BillingHistoryRepository {
    async getBillingHistoryByDateRange (req, from, to, skip, limit) {
        console.log('getBillingHistoryByDateRange - ', from, to);
        return new Promise((resolve, reject) => {
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        {$project: {
                            billing_status: "$billing_status",
                            package_id: "$package_id",
                            paywall_id: "$paywall_id",
                            operator: "$operator",
                            micro_charge: "$micro_charge",
                            user_id: "$user_id",
                            source: "$source",
                            price: "$price",
                            operator_response: "$operator_response",
                            billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } }
                        }},
                        { $skip: skip },
                        { $limit: limit }
                    ], { allowDiskUse: true }).toArray(function(err, items) {
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

    async getCallbackSendByDateRange(req, from, to, skip, limit) {
        return new Promise((resolve, reject) => {
            console.log('getCallbackSendByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                billing_status: "Affiliate callback sent",
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                            }},
                        { $project:{
                                billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } }
                            }},
                        { $skip: skip },
                        { $limit: limit }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getCallbackSendByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getChargeDetailsByDateRange (req, from, to, skip, limit){
        return new Promise((resolve, reject) => {
            console.log('getChargeDetailsByDateRange: ', from, to, skip, limit);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                                $or:[{"billing_status": "Success"}, {"billing_status": "billed"}],
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                            }},
                        {$project: {
                                _id: 0,
                                price: "$price",
                                discount: "$discount",
                                package: "$package_id",
                                paywall: "$paywall_id",
                                operator: "$operator",
                                micro_charge: "$micro_charge",
                                billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } }
                            }
                        },
                        { $skip: skip },
                        { $limit: limit }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getChargeDetailsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            })
        });
    }

    async getNetAdditionByDateRange(req, from, to, skip, limit){
        return new Promise((resolve, reject) => {
            console.log('getNetAdditionByDateRange: ', from, to);
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
                                added_dtm: "$added_dtm",
                                subscription_status:"$subscription_status",
                                bill_status: { $filter: {
                                        input: "$histories",
                                        as: "history",
                                        cond: { $or: [
                                                { $eq: ['$$history.billing_status',"expired"] },
                                                { $eq: ['$$history.billing_status',"system-after-grace-end"] },
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
                                billing_source: {"$arrayElemAt": ["$bill_status.source",0]},
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
                                source:"$source",
                                subscription_status:"$subscription_status",
                                billing_status:"$billing_status",
                                billing_source:"$billing_source",
                                package: "$package",
                                paywall: "$paywall",
                                operator: "$operator",
                                billing_dtm: "$billing_dtm",
                                added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } }
                            }
                        },
                        { $skip: skip },
                        { $limit: limit }
                    ], { allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getNetAdditionByDateRange - err: ', err.message);
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
                    ], { allowDiskUse: true }).toArray(function(err, items) {
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
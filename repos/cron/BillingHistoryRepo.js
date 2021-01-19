
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

    async getBillingHistorySuccessfulByDateRange (req, from, to, skip, limit) {
        console.log('getBillingHistorySuccessfulByDateRange - ', from, to);
        return new Promise((resolve, reject) => {
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                            $or: [{billing_status: "Success"}, {billing_status: "billed"}],
                            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        {$project:{
                            price: "$price",
                            source: {$ifNull: ['$source', 'app'] },
                            paywall_id: {$ifNull: ['$paywall_id', 'Dt6Gp70c'] },
                            package_id: {$ifNull: ['$package_id', 'QDfC'] },
                            operator: {$ifNull: ['$operator', 'telenor'] },
                            billing_status: {$ifNull: ['$billing_status', 'expire'] },
                            transaction_id: "$transaction_id",
                            operator_response: "$operator_response",
                            billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } },
                        }},
                        { $skip: skip },
                        { $limit: limit }
                    ], { allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getBillingHistorySuccessfulByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async computeSubscriptionsFromBillingHistoryByDateRange (req, from, to, skip, limit) {
        return new Promise((resolve, reject) => {
            console.log('computeSubscriptionsFromBillingHistoryByDateRange: ', from, to, skip, limit);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                $or:[
                                    {billing_status: "trial"},
                                    {billing_status: "Success"},
                                    {billing_status: "expired"},
                                    {billing_status: "Affiliate callback sent"},
                                    {billing_status: "unsubscribe-request-received-and-expired"}
                                ],
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                            }
                        },{
                            $sort: {billing_dtm:-1}
                        },
                        {$project:{
                            source: {$ifNull: ['$source', 'app'] },
                            micro_charge: {$ifNull: ['$micro_charge', 'false'] },
                            paywall_id: {$ifNull: ['$paywall_id', 'Dt6Gp70c'] },
                            package_id: {$ifNull: ['$package_id', 'QDfC'] },
                            operator: {$ifNull: ['$operator', 'telenor'] },
                            billing_status: {$ifNull: ['$billing_status', 'expire'] },
                            transaction_id: "$transaction_id",
                            user_id: "$user_id",
                            billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } },
                        }},
                        {$group: {
                            _id: { "user_id": "$user_id", "package_id": "$package_id"},
                            history: { $push:  {
                                source: "$source",
                                micro_charge: "$micro_charge",
                                paywall_id: "$paywall_id",
                                package_id: "$package_id",
                                operator: "$operator",
                                transaction_id: "$transaction_id",
                                billing_status: "$billing_status",
                                billing_dtm: "$billing_dtm"
                            }}
                        }},
                        {$project:{
                            _id: 0,
                            user_id: "$_id.user_id",
                            history: {$arrayElemAt:["$history", 0]}
                        }},
                        { $skip: skip },
                        { $limit: limit }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('computeSubscriptionsFromBillingHistoryByDateRange - err: ', err.message);
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

    async getInsufficientBalanceByDateRange(req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getInsufficientBalanceByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            "operator_response.errorMessage": "The account balance is insufficient.",
                            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        { $count: "count"}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getInsufficientBalanceByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getExcessiveBillingCountByDateRange(req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getExcessiveBillingCountByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            billing_status: "billing_exceeded",
                            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        { $count: "count"}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getExcessiveBillingCountByDateRange - err: ', err.message);
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
            req.db.collection('billinghistories', function (err, collection) {

                if (!err) {
                    collection.aggregate( [
                        {$match : {
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lt:new Date(to)}}],
                                $or:[{billing_status: "expired"}, {billing_status: "unsubscribe-request-received-and-expired"}],
                            }},

                        {$project: {
                                billing_source:"$source",
                                billing_status: "$billing_status",
                                package: "$package_id",
                                paywall: "$paywall_id",
                                operator: "$operator",
                                billing_dtm: "$billing_dtm"
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
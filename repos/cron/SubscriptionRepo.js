
class SubscriptionRepository {
    async getSubscriptionsByDateRange (req, from, to, skip, limit) {
        return new Promise((resolve, reject) => {
            console.log('getSubscriptionsByDateRange: ', from, to, skip, limit);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                                $and: [{added_dtm: {$gte: new Date(from)}}, {added_dtm: {$lte: new Date(to)}}]
                            }},
                        {$project: {
                            subscribed_package_id: "$subscribed_package_id",
                            paywall_id: "$paywall_id",
                            source: "$source",
                            affiliate_mid: "$affiliate_mid",
                            subscription_status: "$subscription_status",
                            added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } },
                        }},
                        { $skip: skip },
                        { $limit: limit }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getSubscriptionsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getChargeDetailsSourceWiseByDateRange (req, from, to, skip, limit) {
        return new Promise((resolve, reject) => {
            console.log('getChargeDetailsSourceWiseByDateRange: ', from, to, skip, limit);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match: {
                                subscription_status: "billed",
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
                                                {$eq: ['$$history.billing_status', "billed"]}
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
                                micro_charge: {"$arrayElemAt": ["$succeses.micro_charge", 0]},
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
                                micro_charge: "$micro_charge",
                                billing_dtm: "$billing_dtm",
                            }
                        },
                        { $skip: skip },
                        { $limit: limit }
                    ], {allowDiskUse: true}).toArray(function (err, items) {
                        if (err) {
                            console.log('getChargeDetailsSourceWiseByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getSubscriberSubscriptionsByDateRange (req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getSubscriberSubscriptionsByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate( [
                        {$match : {
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }},
                        { $group: {
                                _id: "$subscriber_id",
                                data: { $push:  {
                                        price: "$price",
                                        source: "$source",
                                        paywall_id: "$paywall_id",
                                        affiliate_mid: "$affiliate_mid",
                                        payment_source: "$payment_source",
                                        subscribed_package_id: "$subscribed_package_id",
                                        subscription_status: "$subscription_status",
                                        added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } }
                                }}
                            }},
                        { $project: {
                                subscriber_id: "$_id",
                                subscriptions: "$data",
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getSubscriberSubscriptionsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            })
        });
    }

    async getSubscriptionSourceWiseSuccessfulByDateRange (req, from, to, skip, limit){
        return new Promise((resolve, reject) => {
            console.log('getSubscriptionSourceWiseSuccessfulByDateRange: ', from, to, skip, limit);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                billing_status: "Success",
                                $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        {
                            $lookup:{
                                from: "subscriptions",
                                let: {subscriber_id: "$subscriber_id"},
                                pipeline:[
                                    {
                                        $match: {
                                            $expr: {
                                                $and:[
                                                    {$eq: ["$subscriber_id", "$$subscriber_id"]},
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "subs"
                            }
                        },
                        {
                            $project: {
                                source: {$ifNull: ['$subs.source', 'app'] },
                                billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } },
                            }
                        },
                        {
                            $project: {
                                source: {"$arrayElemAt": ["$source",0]},
                                billing_dtm: "$billing_dtm"
                            }
                        },
                        { $skip: skip },
                        { $limit: limit }
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getSubscriptionSourceWiseSuccessfulByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            })
        });
    }

    async getAffiliateDataByDateRange (req, from, to, BHFrom, BHTo){
        return new Promise((resolve, reject) => {
            console.log('getAffiliateDataByDateRange: ', from, to, BHFrom, BHTo);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                source: {$in: ["HE","affiliate_web"]},
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        {
                            $lookup: {
                                from: "billinghistories",
                                let: {subscriber_id: "$subscriber_id", package_id: "$subscribed_package_id"},
                                pipeline:[
                                    { $match:
                                        { $expr:
                                            { $and:[
                                                {$eq: ["$subscriber_id", "$$subscriber_id" ]},
                                                {$eq: ["$package_id", "$$package_id" ]},
                                                {$in: ["$billing_status",
                                                    [ "Success", "trial", "Affiliate callback sent" ]
                                                ]},
                                                {$gt: ["$billing_dtm", new Date(BHFrom)]},
                                                {$lt: ["$billing_dtm", new Date(BHTo)]}
                                            ]}
                                        }
                                    }],
                                as: "history"
                            }
                        },
                        { $unwind: "$history" },
                        { $project:{
                            affiliate: "$source",
                            affiliate_mid: "$affiliate_mid",
                            status: "$history.billing_status",
                            package_id: "$history.package_id",
                            billing_dtm: "$history.billing_dtm"
                        }},
                        { $project:{
                            affiliate: "$affiliate",
                            affiliate_mid: "$affiliate_mid",
                            status: "$status",
                            package_id: "$package_id",
                            day: { "$dayOfMonth" : "$billing_dtm"},
                            month: { "$month" : "$billing_dtm" },
                            year:{ "$year": "$billing_dtm" }
                        }},
                        { $project:{
                            billing_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            status: "$status",
                            package_id: "$package_id",
                            affiliate: "$affiliate",
                            affiliate_mid: "$affiliate_mid"
                        }},
                        { $group:{
                            _id: {billing_dtm: "$billing_dtm", status: "$status", package_id: "$package_id", affiliate: "$affiliate", affiliate_mid : "$affiliate_mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {billing_dtm: "$_id.billing_dtm"},
                            history: { $push:  { status: "$_id.status", package_id: "$_id.package_id", affiliate: "$_id.affiliate", affiliate_mid: "$_id.affiliate_mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            billing_dtm: { '$dateToString' : { date: "$_id.billing_dtm", 'timezone' : "Asia/Karachi" } },
                            history: "$history"
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getAffiliateDataByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            })
        });
    }

    async getAffiliateMidFromSubscriptionsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getAffiliateMidFromSubscriptionsByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                source: {$in: ["HE","affiliate_web"]},
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        { $project:{
                                affiliate_mid: "$affiliate_mid",
                                added_dtm: "$added_dtm"
                            }},
                        { $project:{
                                affiliate_mid: "$affiliate_mid",
                                day: { "$dayOfMonth" : "$added_dtm"},
                                month: { "$month" : "$added_dtm" },
                                year:{ "$year": "$added_dtm" }
                            }},
                        { $project:{
                                added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                                affiliate_mid: "$affiliate_mid"
                            }},
                        { $group:{
                                _id: {added_dtm: "$added_dtm", affiliate_mid: "$affiliate_mid"},
                                count: {$sum: 1}
                            }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            affiliate_mids: { $push:  {affiliate_mid: "$_id.affiliate_mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: { '$dateToString' : { date: "$_id.added_dtm", 'timezone' : "Asia/Karachi" } },
                            affiliate_mids: "$affiliate_mids"
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getAffiliateMidFromSubscriptionsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = SubscriptionRepository;
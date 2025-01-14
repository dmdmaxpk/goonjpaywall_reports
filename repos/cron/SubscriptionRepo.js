
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
                                localField: "user_id",
                                foreignField: "user_id",
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
                                _id: "$user_id",
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
                            $project: {
                                source: {$ifNull: ['$source', 'app'] },
                                billing_dtm: { '$dateToString' : { date: "$billing_dtm", 'timezone' : "Asia/Karachi" } },
                            }
                        },
                        {
                            $project: {
                                source: "$source",
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

    async getAffiliateDataByDateRange (req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getAffiliateDataByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                source: {$in: ["HE","affiliate_web", "tp_geo_ent", "tp_discover_pak", "tp_dw_eng", "youtube"]},
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        {
                            $lookup: {
                                from: "billinghistories",
                                let: {user_id: "$user_id", package_id: "$subscribed_package_id"},
                                pipeline:[
                                    { $match:
                                        { $expr:
                                            { $and:[
                                                {$eq: ["$user_id", "$$user_id" ]},
                                                {$eq: ["$package_id", "$$package_id" ]},
                                                {$in: ["$billing_status",
                                                    [ "Success", "trial", "expired", "unsubscribe-request-recieved", "unsubscribe-request-received-and-expired", "Affiliate callback sent" ]
                                                ]},
                                                {$gte: ["$billing_dtm", new Date(from)]},
                                                {$lte: ["$billing_dtm", new Date(to)]}
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
                                source: {$in: ["HE","affiliate_web", "tp_geo_ent", "tp_discover_pak", "tp_dw_eng", "youtube"]},
                                $and: [{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        { $project:{
                                affiliate: "$source",
                                affiliate_mid: "$affiliate_mid",
                                added_dtm: "$added_dtm"
                            }},
                        { $project:{
                                affiliate: "$affiliate",
                                affiliate_mid: "$affiliate_mid",
                                day: { "$dayOfMonth" : "$added_dtm"},
                                month: { "$month" : "$added_dtm" },
                                year:{ "$year": "$added_dtm" }
                            }},
                        { $project:{
                                added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                                affiliate_mid: "$affiliate_mid",
                                affiliate: "$affiliate",
                            }},
                        { $group:{
                                _id: {added_dtm: "$added_dtm", affiliate_mid: "$affiliate_mid", affiliate: "$affiliate"},
                                count: {$sum: 1}
                            }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            affiliate_mids: { $push:  {affiliate_mid: "$_id.affiliate_mid", affiliate: "$_id.affiliate", count: "$count" }}
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



    async getNewPayingUserRevenueByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getNewPayingUserRevenueByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lt:new Date(to)}}]
                            }
                        },
                        {$project:{
                            source: "$source",
                            user_id: "$user_id"
                        }},
                        { $lookup:{
                            from: "billinghistories",
                            let: {user_id: "$user_id"},
                            pipeline:[
                                { $match: {
                                    $expr: {
                                        $and:[
                                            {$eq: ["$user_id", "$$user_id" ]},
                                            {$eq: ["$billing_status", "Success"]},
                                            {$and: [
                                                    {$gte: ["$billing_dtm", new Date(from)]},
                                                    {$lte: ["$billing_dtm", new Date(to)]}
                                                ]
                                            }
                                        ]
                                    }
                                }},
                                { $project:{
                                    _id: 0,
                                    price: "$price"
                                }}
                            ],
                            as: "billing"
                        }},
                        {
                            $unwind: "$billing"
                        },
                        { $group:{
                            _id: "$source",
                            price: {$sum: "$billing.price"}
                        }},
                        { $project:{
                            source: "$_id",
                            price: "$price"
                        }},
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getNewPayingUserRevenueByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getNewPayingUsersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getNewPayingUsersByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            $and:[
                                {"added_dtm":{$gte: new Date(from)}},
                                {"added_dtm":{$lt: new Date(to)}}
                            ]
                        }},
                        {$project:{
                            source: "$source",
                            user_id: "$user_id",
                        }},
                        { $lookup:{
                            from: "billinghistories",
                            let: {user_id: "$user_id"},
                            pipeline:[
                                { $match: {
                                        $expr: {
                                            $and:[
                                                {$eq: ["$user_id", "$$user_id"]},
                                                {$eq: ["$billing_status", "Success"]},
                                            ]
                                        }
                                    }},
                            ],
                            as: "billing"
                        }},
                        {$project: {
                            _id: 0,
                            source: "$source",
                            billing_size: {$size: "$billing"}
                        }},
                        {$match: {
                            billing_size: {$gt: 0}
                        }},
                        {$group: {
                            _id: "$source",
                            count: {$sum: 1}
                        }},
                        {$project: {
                            source: "$_id",
                            count: "$count"
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getNewPayingUsersByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getTotalPayingUsersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getTotalPayingUsersByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                                "billing_status": "Success",
                                $and:[
                                    {"billing_dtm":{$gte: new Date(from)}},
                                    {"billing_dtm":{$lte: new Date(to)}}
                                ]
                            }},
                        {$group:{
                                _id: "$user_id",
                            }},
                        { $lookup:{
                                from: "subscriptions",
                                let: {user_id: "$_id"},
                                pipeline:[
                                    { $match: {
                                            $expr: {
                                                $and:[
                                                    {$eq: ["$user_id", "$$user_id"]}
                                                ]
                                            }
                                        }},
                                    { $project:{
                                            _id: 0,
                                            source: "$source",
                                        }}
                                ],
                                as: "subscriptions"
                            }},
                        {
                            $unwind: "$subscriptions"
                        },
                        {$group:{
                            _id: "$subscriptions.source",
                            count: {$sum: 1}
                        }},
                        { $project:{
                            source: "$_id",
                            count: "$count",
                            _id: 0
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getTotalPayingUsersByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getPayingUserSessionsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getPayingUserSessionsByDateRange: ', from, to);
            console.time('find')
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {$match: {
                            billing_status: "Success",
                            $and:[
                                {"billing_dtm":{$gte: new Date(from)}},
                                {"billing_dtm":{$lte: new Date(to)}}
                            ]
                        }},
                        {$group: {_id: "$user_id" }},
                        {$project: {user_id: "$_id"}},
                        { $lookup:{
                            from: "viewlogs",
                            let: {user_id: "$user_id"},
                            pipeline:[
                                {$match: {
                                    $expr: {
                                        $and:[
                                            {$eq: ["$user_id", "$$user_id"]},
                                            {$and: [
                                                    {$gte: ["$added_dtm", new Date(from)]},
                                                    {$lte: ["$added_dtm", new Date(to)]}
                                                ]
                                            }
                                        ]
                                    }
                                }}
                            ],
                            as: "views"
                        }},
                        {$project:{
                            sessions: {$size: "$views"}
                        }},
                        {$match: {sessions: {$gt: 0}}},
                        {$group:{
                            _id: "$sessions",
                            sessionSum: { $sum: "$sessions" },
                            sessionTurns: { $sum: 1 },
                        }},
                        {$project: {
                            session: "$_id",
                            sessionSum: "$sessionSum",
                            sessionTurns: "$sessionTurns",
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {

                        console.log('err: ', err);
                        console.timeEnd('find');
                        if(err){
                            console.log('getPayingUserSessionsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getPayingUserWatchTimeByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getPayingUserWatchTimeByDateRange: ', from, to);
            req.db.collection('msisdnstreamlogs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {$match: {
                            insertTime: {$gte: new Date(from), $lt: new Date(to)}
                        }},
                        {$group: {
                            _id: "$msisdn",
                            minutes: {$first: "$minutes"}
                        }},
                        {$project: {
                            _id: 1,
                            minutes: {$size: "$minutes"}
                        }},
                        {$group: {
                            _id: "$minutes",
                            sessionSum: { $sum: "$minutes" },
                            sessionTurns: { $sum: 1 },
                        }},
                        {$project: {
                            session: "$_id",
                            sessionSum: "$sessionSum",
                            sessionTurns: "$sessionTurns",
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getPayingUserWatchTimeByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getPayingUserEngagementByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getPayingUserEngagementByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            "billing_status": "Success",
                            $and:[
                                {billing_dtm:{$gte: new Date(from)}},
                                {billing_dtm:{$lte: new Date(to)}}
                            ]
                        }},
                        { $group:{
                            _id: {user_id: "$user_id", source: "$source"}
                        }},
                        { $lookup:{
                            from: "viewlogs",
                            let: {user_id: "$_id.user_id", source: "$_id.source"},
                            pipeline:[
                                { $match: {
                                    $expr: {
                                        $and:[
                                            {$eq: ["$user_id", "$$user_id"]},
                                            {$and: [
                                                    {$gte: ["$added_dtm", new Date(from)]},
                                                    {$lte: ["$added_dtm", new Date(to)]}
                                                ]
                                            }
                                        ]
                                    }
                                }},
                                {$limit: 1},
                                {$project:{
                                    source: "$$source",
                                }}
                            ],
                            as: "user_data"
                        }},
                        {
                            $unwind: "$user_data"
                        },
                        { $project:{
                            "_id": 0,
                            "source": "$user_data.source"
                        }},
                        {$group: {
                            _id: "$source",
                            count: {$sum: 1}
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getPayingUserEngagementByDateRange - err: ', err.message);
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
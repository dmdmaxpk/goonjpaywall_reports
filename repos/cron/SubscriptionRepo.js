
class SubscriptionRepository {
    async getSubscriptionsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getSubscriptionsByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.find({
                        $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                    }).toArray(function(err, items) {
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

    async getCallbackSendByDateRange(req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getCallbackSendByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    console.log('collection: ', collection);
                    collection.aggregate([
                        {
                            $match: {
                                $or:[{source: "HE"},{source: "affiliate_web"}],
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },
                        {
                            $lookup:
                                {
                                    from: "billinghistories",
                                    localField: "_id",
                                    foreignField: "subscription_id",
                                    as: "histories"
                                }
                        },
                        {
                            $project: {
                                tid: "$affiliate_unique_transaction_id",
                                mid: "$affiliate_mid",
                                added_dtm: "$added_dtm",
                                active: "$active",
                                callbackhistory: {
                                    $filter: {
                                        input: "$histories",
                                        as: "histor",
                                        cond: {$eq: ["$$histor.billing_status", "Affiliate callback sent" ] }
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                tid: "$tid",
                                mid: "$mid",
                                isValidUser: {$cond: {if: {$eq:["$active",true]}, then: true, else: false } },
                                added_dtm: "$added_dtm",
                                callbackhistorySize: {"$size": "$callbackhistory" },
                                callbackObj: {$arrayElemAt: ["$callbackhistory",0]},
                                added_dm: { '$dateToString' : { date: "$added_dtm",'format':'%Y-%m-%d-%H:%M:%S','timezone' : "Asia/Karachi" } },
                            }
                        },
                        {
                            $project: {
                                tid: "$tid",
                                mid: "$mid",
                                isValidUser: "$isValidUser",
                                callbackhistorySize: "$callbackhistorySize",
                                added_dtm: "$added_dtm",
                                added_dm: { '$dateToString' : { date: "$added_dtm",'format':'%Y-%m-%d-%H:%M:%S','timezone' : "Asia/Karachi" } },
                                billing_dm: { '$dateToString' : { date: "$callbackObj.billing_dtm",'format':'%Y-%m-%d-%H:%M:%S','timezone' : "Asia/Karachi" } }
                            }
                        },
                        {
                            $project: {
                                tid: "$tid",
                                mid: "$mid",
                                isValidUser: "$isValidUser",
                                added_dtm:  {$cond: {if: "$isValidUser", then: "$added_dm" , else: "" } },
                                subscription_dtm: "$added_dtm",
                                isCallbAckSent: {$cond: { if: { $and: [{$gte: ["$callbackhistorySize",1]},{$eq: [ "$isValidUser",true ]} ] } ,then:"yes",else:"no" }} ,
                                callBackSentTime: {$cond: {if: "$isValidUser", then: "$billing_dm" , else: "" } }
                            }
                        }
                    ])
                    .toArray(function(err, items) {
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

    async getChargeDetailsByDateRange (req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getChargeDetailsByDateRange: ', from, to);
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
                                succeses: { $filter: {
                                        input: "$histories",
                                        as: "history",
                                        cond: { $or: [
                                                { $eq: ['$$history.billing_status',"Success"] },
                                                { $eq: ['$$history.billing_status',"graced"] },
                                            ]}
                                    }} }
                        },
                        {$project: {
                                source:"$source",
                                added_dtm:"$added_dtm",
                                numOfSucc: { $size:"$succeses" },
                                subscription_status:"$subscription_status",
                                billing_status: {"$arrayElemAt": ["$succeses.billing_status",0]},
                                price: {"$arrayElemAt": ["$succeses.price",0]},
                                discount: {"$arrayElemAt": ["$succeses.discount",0]},
                                package: {"$arrayElemAt": ["$succeses.package_id",0]},
                                paywall: {"$arrayElemAt": ["$succeses.paywall_id",0]},
                                operator: {"$arrayElemAt": ["$succeses.operator",0]},
                                micro_charge: {"$arrayElemAt": ["$succeses.micro_charge",0]},
                                billing_dtm: {"$arrayElemAt": ["$succeses.billing_dtm",0]}
                            }
                        },
                        {$match: { numOfSucc: {$gte: 1}  }},
                        {$project: {
                                _id: 0,
                                added_dtm:"$added_dtm",
                                source:"$source",
                                subscription_status:"$subscription_status",
                                billing_status:"$billing_status",
                                price: "$price",
                                discount: "$discount",
                                package: "$package",
                                paywall: "$paywall",
                                operator: "$operator",
                                micro_charge: "$micro_charge",
                                billing_dtm: "$billing_dtm",
                            }
                        },
                    ]).toArray(function(err, items) {
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
                                        added_dtm: "$added_dtm"
                                }}
                            }},
                        { $project: {
                                subscriber_id: "$_id",
                                subscriptions: "$data",
                        }}
                    ]).toArray(function(err, items) {
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

    async getAffiliateDataByDateRange (req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getAffiliateDataByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        {
                            $match:{
                                source: {$in: ["HE","affiliate_web"]},
                                $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                            }
                        },{
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
                                                {$gt: ["$billing_dtm", new Date(from)]},
                                                {$lt: ["$billing_dtm", new Date(to)]}
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
                            day: { "$dayOfMonth" : "$history.billing_dtm"},
                            month: { "$month" : "$history.billing_dtm" },
                            year:{ "$year": "$history.billing_dtm" }
                        }},
                        { $project:{
                            billing_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            status: "$status",
                            package_id: "$package_id",
                            affiliate: "$affiliate",
                            affiliate_mid: "$affiliate_mid"
                        }},
                        { $group:{
                            _id: {billing_dtm: "$billing_dtm", status: "$status", package_id: "$package_id", affiliate: "$affiliate", affiliate_mid: "$affiliate_mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {billing_dtm: "$_id.billing_dtm"},
                            history: { $push:  { status: "$_id.status", package_id: "$_id.package_id", affiliate: "$_id.affiliate", affiliate_mid: "$_id.affiliate_mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            billing_dtm: "$_id.billing_dtm",
                            history: "$history"
                        }}
                    ]).toArray(function(err, items) {
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
                                $and:[{added_dtm:{$gte:new Date("2020-07-17T00:00:00.000Z")}}, {added_dtm:{$lte:new Date("2020-07-17T23:59:59.000Z")}}]
                            }
                        },
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
                                added_dtm: "$_id.added_dtm",
                                affiliate_mids: "$affiliate_mids"
                            }}
                    ]).toArray(function(err, items) {
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
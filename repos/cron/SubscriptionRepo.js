
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

    async getAffiliateDataDateRange (req, from, to){
        return new Promise((resolve, reject) => {
            console.log('getAffiliateDataDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            mid: {$in: ["1", "1569", "aff3", "aff3a", "goonj", "gdn", "gdn2"]},
                            "req_body.response_msisdn":{$ne:null},
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $project:{
                            mid: "$mid",
                            msisdn: "$req_body.response_msisdn",
                            day: { "$dayOfMonth" : "$added_dtm"},
                            month: { "$month" : "$added_dtm" },
                            year:{ "$year": "$added_dtm" },
                        }},
                        { $project:{
                            added_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                            mid: "$mid",
                            msisdn: "$msisdn"
                        }},
                        { $group:{
                            _id: {added_dtm: "$added_dtm", msisdn: "$msisdn"}, mid: {$first: "$mid"}
                        }},
                        { $group:{
                            _id:  {added_dtm: "$_id.added_dtm", mid: "$mid"},
                            count: {$sum: 1}
                        }},
                        { $group:{
                            _id: {added_dtm: "$_id.added_dtm"},
                            helogs: { $push:  { mid: "$_id.mid", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            added_dtm: "$_id.added_dtm",
                            helogs: "$helogs"
                        }}
                    ], {allowDiskUse: true}).toArray(function(err, items) {
                        if(err){
                            console.log('getAffiliateDataDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            })
        });
    }
}

module.exports = SubscriptionRepository;
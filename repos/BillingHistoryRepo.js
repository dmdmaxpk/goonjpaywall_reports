const mongoose = require('mongoose');

class BillingHistoryRepository {
    async getBillingHistoryByDateRange (from, to) {
        console.log('getBillingHistoryByDateRange: ', from, to);

        let BillingHistory;
        return BillingHistory.find({
            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
        }).sort({billing_dtm: 1}).limit(50000);
    }

    async getnetAdditionByDateRange(from, to){
        console.log('getnetAdditionByDateRange: ', from, to);

        let Subscription;
        return await Subscription.aggregate( [
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
        ]);
    }
}





module.exports = BillingHistoryRepository;
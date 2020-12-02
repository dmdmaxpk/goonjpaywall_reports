
class TransactionsRepo {
    async getTransactionsAvgByDateRange (req, from, to, skip, limit) {
        return new Promise((resolve, reject) => {
            console.log('getTransactionsAvgByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match: {
                            $and: [
                                {'billing_status': 'Success'},
                                {billing_dtm:{$gte:new Date(from)}},
                                {billing_dtm:{$lte:new Date(to)}}
                            ]
                        }},
                        { $project: {
                            subscriber_id: "$subscriber_id",
                            day: { "$dayOfMonth" : "$billing_dtm"},
                            month: { "$month" : "$billing_dtm" },
                            year:{ "$year": "$billing_dtm" }
                        }},
                        { $project: {
                            subscriber_id: "$subscriber_id",
                            billing_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                        }},
                        { $group: {
                            _id: {billing_dtm: "$billing_dtm", subscriber_id: "$subscriber_id"},
                            count: {$sum: 1}
                        }},
                        { $group: {
                            _id: {billing_dtm: "$_id.billing_dtm"},
                            transactions: { $push:  { subscriber_id: "$_id.subscriber_id", count: "$count" }}
                        }},
                        { $project: {
                            _id: 0,
                            billing_dtm: { '$dateToString' : { date: "$_id.billing_dtm", 'timezone' : "Asia/Karachi" } },
                            transactions: "$transactions"
                        }},
                        { $skip: skip },
                        { $limit: limit }
                    ], { allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getTransactionsAvgByDateRange - err 2: ', err.message);
                            resolve([]);
                        }

                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = TransactionsRepo;
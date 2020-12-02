
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
                            price: "$price",
                            user_id: "$user_id",
                            day: { "$dayOfMonth" : "$billing_dtm"},
                            month: { "$month" : "$billing_dtm" },
                            year:{ "$year": "$billing_dtm" }
                        }},
                        { $project: {
                            user_id: "$user_id",
                            price: "$price",
                            billing_dtm: {"$dateFromParts": { year: "$year", month: "$month", day: "$day" }},
                        }},
                        { $group: {
                            _id: { user_id: "$user_id", billing_dtm: "$billing_dtm"}, "count":{$sum: "$price"}
                        }},
                        {$group: {
                            _id: "$_id.billing_dtm", avg: {$avg: "$count"}
                        }},
                        { $project: {
                            billing_dtm: "$_id",
                            avg: "$total",
                            _id: 0
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
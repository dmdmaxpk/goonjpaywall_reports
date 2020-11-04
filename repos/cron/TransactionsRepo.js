
class TransactionsRepo {
    async getTransactionsAvgByDateRange (req, from, to) {
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
                            price: "$price",
                            billing_dtm: "$billing_dtm"
                        }},
                        { $group: {
                            _id: "$subscriber_id",
                            data: { $push:  { price: "$price", billing_dtm: "$billing_dtm" }}
                        }},
                        { $project: {
                            subscriber_id: "$_id",
                            transactions: "$data",
                            size: { $size:"$data" },
                        }},
                        {$match: { size: {$gt: 0}  }},
                        {$project: {
                            _id: 0,
                            subscriber_id: 1,
                            transactions: 1,
                            size: 1,
                        }}
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
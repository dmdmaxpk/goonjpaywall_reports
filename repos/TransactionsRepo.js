
class TransactionsRepo {
    async getTransactionsAvgByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getTransactionsAvgByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    console.log('getTransactionsAvgByDateRange: ', from, to);
                    collection.aggregate([
                        { $match: {
                                $and: [
                                    {'billing_status': 'Success'},
                                    {billing_dtm:{$gte:new Date('2020-02-12T00:00:00.000Z')}},
                                    {billing_dtm:{$lte:new Date('2020-02-12T23:59:59.000Z')}}
                                ]
                            }
                        },
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
                            subscriber_id: "$_id",
                            transactions: "$transactions",
                            size: "$size",
                        }}
                    ]).
                    toArray(function(err, items) {
                        if(err){
                            console.log('getTransactionsAvgByDateRange - err: ', err.message);
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
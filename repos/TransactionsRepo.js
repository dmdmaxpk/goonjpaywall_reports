
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
                                    {billing_dtm:{$gte:new Date(from)}},
                                    {billing_dtm:{$lte:new Date(to)}}
                                ]
                            }
                        },
                        { $group: {
                            _id: "$subscriber_id",
                            data: { $push:  { price: "$price" }}
                        }},
                        { $project: {
                            _id: 0,
                            subscriber_id: "$_id",
                            transactions: "$data",
                            size: { $size:"$data" },
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

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
                            user_id: "$user_id",
                            price: "$price",
                            package_id: "$package_id"
                        }},
                        { $group: {
                            _id: { user_id: "$user_id", package_id: "$package_id"}, "count":{$sum: "$price"}
                        }},
                        {$group: {
                            _id: {package_id: "$_id.package_id"},
                            count:{$avg: "$count"},
                        }},
                        { $project: {
                            package_id: "$_id.package_id",
                            avg:"$count",
                            _id: 0
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

    async getTransactionsAvgPerCustomerByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getTransactionsAvgPerCustomerByDateRange: ', from, to);
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
                            user_id: "$user_id",
                            price: "$price",
                            package_id: "$package_id"
                        }},
                        { $group: {
                            _id: { user_id: "$user_id", package_id: "$package_id"}, "count":{$sum: 1}
                        }},
                        {$group: {
                            _id: {package_id: "$_id.package_id"},
                            count:{$avg: "$count"},
                        }},
                        { $project: {
                            package_id: "$_id.package_id",
                            avg:"$count",
                            _id: 0
                        }}
                    ], { allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getTransactionsAvgPerCustomerByDateRange - err 2: ', err.message);
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
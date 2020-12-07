
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
                        {	$group:{
                                _id: "$package_id", avg: {$avg: "$price"}
                            }
                        },
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
                        {   $group: {_id: "$user_id" }},
                        {	$count: "total"	}
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
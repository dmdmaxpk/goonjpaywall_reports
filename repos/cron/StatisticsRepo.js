
class StatisticsRepository {
    async getRequestCountByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getRequestCountByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            $or:[{billing_status: "Success"}, {billing_status: "graced"}],
                            $and:[{billing_dtm:{$gt: new Date(from)}}, {billing_dtm:{$lte: new Date(to)}}]
                        }},
                        {$group: {
                            _id: "$billing_status",
                            count:{$sum: 1},
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getRequestCountByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }

    async getDailyBaseChargeByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getDailyBaseChargeByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            $or:[{billing_status: "Success"}, {billing_status: "graced"}],
                            $and:[{billing_dtm:{$gt: new Date(from)}}, {billing_dtm:{$lte: new Date(to)}}]
                        }},
                        {$group: {
                            _id: "$subscriber_id",
                            count:{$sum: 1}
                        }},
                        {$group: {
                            _id: "null",
                            count:{$sum: 1}
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getDailyBaseChargeByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = StatisticsRepository;






























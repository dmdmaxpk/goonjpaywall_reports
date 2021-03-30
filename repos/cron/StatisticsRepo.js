
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
}

module.exports = StatisticsRepository;






























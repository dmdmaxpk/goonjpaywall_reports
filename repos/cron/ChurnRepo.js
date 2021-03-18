
class ChurnRepository {
    async getChurnByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getChurnByDateRange: ', from, to);
            req.db.collection('billinghistories', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            billing_status: {$in: ['Success', 'expired']},
                            $and:[{billing_dtm:{$gte:new Date(from)}}, {billing_dtm:{$lte:new Date(to)}}]
                        }},
                        {$group: {
                            _id: "$billing_status",
                            count:{$sum: 1},
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getUsersByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = ChurnRepository;






























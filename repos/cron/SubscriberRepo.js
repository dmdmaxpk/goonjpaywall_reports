
class SubscriberRepository {
    async getSubscribersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getSubscribersByDateRange: ', from, to);
            req.db.collection('subscribers', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match: {
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        {$project: {
                            user_id: "$user_id",
                            added_dtm: "$added_dtm",
                        }}
                    ],{ allowDiskUse: true }).toArray(function(err, items) {
                        if(err){
                            console.log('getSubscribersByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = SubscriberRepository;

class SubscriberRepository {
    async getSubscribersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getSubscribersByDateRange: ', from, to);
            req.db.collection('users', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match: {
                            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        {$project: {
                            user_id: "$_id",
                            added_dtm: { '$dateToString' : { date: "$added_dtm", 'timezone' : "Asia/Karachi" } },
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
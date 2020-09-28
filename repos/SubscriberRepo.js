
class SubscriberRepository {
    async getSubscribersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getSubscribersByDateRange: ', from, to);
            req.db.collection('subscribers', function (err, collection) {
                if (!err) {
                    return collection.find({
                        $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                    }).toArray(function(err, items) {
                        if(err){
                            console.log('getSubscribersByDateRange - err: ', err.message);
                            return resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = SubscriberRepository;
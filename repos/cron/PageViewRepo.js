
class PageViewRepo {
    async getPageViewsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getPageViewsByDateRange: ', from, to);
            req.db.collection('subscriptions', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            method:'pageview', $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                        }},
                        { $limit: 10 },
                    ]).toArray(function(err, items) {
                        if(err){
                            console.log('getPageViewsByDateRange - err: ', err.message);
                            resolve([]);
                        }
                        resolve(items);
                    });
                }
            });
        });
    }
}

module.exports = PageViewRepo;

class PageViewRepo {
    async getPageViewsByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getPageViewsByDateRange: ', from, to);
            req.db.collection('logs', function (err, collection) {
                if (!err) {
                    collection.aggregate([
                        { $match:{
                            $and:[
                                {method:'pageview'},
                                {added_dtm:{$gte:new Date("2020-09-01T00:00:00.000Z")}},
                                {added_dtm:{$lte:new Date("2020-09-02T00:00:00.000Z")}}
                            ]
                        }}
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
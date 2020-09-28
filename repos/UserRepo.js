
class UserRepository {
    async getUsersByDateRange (req, from, to) {
        return new Promise((resolve, reject) => {
            console.log('getUsersByDateRange: ', from, to);
            req.db.collection('users', function (err, collection) {
                if (!err) {
                    collection.find({
                        $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                    }).toArray(function(err, items) {
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

module.exports = UserRepository;






























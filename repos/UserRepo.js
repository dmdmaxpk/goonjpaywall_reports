
class UserRepository {
    async getUsersByDateRange (req, from, to) {
        console.log('getUsersByDateRange: ', from, to);
        req.db.collection('users', function (err, collection) {

            if (!err) {
                console.log('yes: ');
                return collection.find({
                    $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                }).toArray(function(err, items) {
                    if(err){
                        console.log('------------------------', err);
                        return []
                    }
                    return items;
                });
            }
        });
    }
}

module.exports = UserRepository;






























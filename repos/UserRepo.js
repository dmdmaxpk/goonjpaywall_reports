
class UserRepository {
    async getUsersByDateRange (req, from, to) {
        console.log('getUsersByDateRange: ', from, to);
        req.db.collection('users', function (err, collection) {
            console.log('collection====================================: ', collection);

            if (!err) {
                console.log('yes: ');
                return collection.find({}).toArray(function(err, items) {
                    if(err){
                        console.log(err);
                    }
                    console.log(items);
                });
            }
        });
    }
}

module.exports = UserRepository;






























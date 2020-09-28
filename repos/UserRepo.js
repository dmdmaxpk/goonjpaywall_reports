
class UserRepository {
    async getUsersByDateRange (req, from, to) {
        console.log('getUsersByDateRange: ', req.db, from, to);
        await req.db.collection('users', async function (err, collection) {
            console.log('collection====================================: ', collection);

            if (!err) {
                console.log('yes: ');
                return collection.find({
                    $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
                }).sort({added_dtm: 1});
            }
        });
    }
}

module.exports = UserRepository;






























const mongoose = require('mongoose');

class SubscriberRepository {
    async getSubscribersByDateRange (from, to) {
        console.log('getSubscribersByDateRange: ', from, to);
        let Subscriber;
        return Subscriber.find({
            $and:[{added_dtm:{$gte:new Date(from)}}, {added_dtm:{$lte:new Date(to)}}]
        }).sort({added_dtm: 1});
    }
}

module.exports = SubscriberRepository;
const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const subscriberReport = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    subscribers: {type: Object, default: undefined},
    subscriptions: {type: Object, default: undefined},
    transactions: {type: Object, default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('SubscriberReport', subscriberReport);
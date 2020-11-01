const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const report = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    users: {type: Object , default: undefined},
    subscribers: {type: Object, default: undefined},
    subscriptions: {type: Object, default: undefined},
    billingHistory: {type: Object, default: undefined},
    callbackSend: {type: Object, default: undefined},
    returningUsers: {type: Object, default: undefined},
    fullAndPartialChargeUser: {type: Object, default: undefined},
    sourceWiseUnSub: {type: Object, default: undefined},
    sourceWiseTrail: {type: Object, default: undefined},
    chargeDetails: {type: Object, default: undefined},
    chargeDetailsSourceWise: {type: Object, default: undefined},
    uniquePayingUsers: {type: Object, default: undefined},
    successRate: {type: Object, default: undefined},
    netAdditions: {type: Object, default: undefined},
    transactionsSourceWise: {type: Object, default: undefined},
    avgTransactions: {type: Object, default: undefined},
    pageViews: {type: Object, default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('Report', report);
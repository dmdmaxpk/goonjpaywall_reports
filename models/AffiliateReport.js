const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const affiliateReport = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    subscriptions: {type: Object, default: undefined},
    subscriptionsStatusWise: {type: Object, default: undefined},
    subscriptionsPackageWise: {type: Object, default: undefined},
    trialStatusWise: {type: Object, default: undefined},
    trialPackageWise: {type: Object, default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('AffiliateReport', affiliateReport);
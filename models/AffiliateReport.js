const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const affiliateReport = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    subscriptions: {type: Object, default: undefined},
    affiliateWise: {type: Object, default: undefined},
    statusWise: {type: Object, default: undefined},
    packageWise: {type: Object, default: undefined},
    sourceWise: {type: Object, default: undefined},
    helogs: {type: Object, default: undefined},
    uniqueSuccessHe: {type: Object, default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('AffiliateReport', affiliateReport);
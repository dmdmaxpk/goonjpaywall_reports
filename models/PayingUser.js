const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const payingUser = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    newPaying: {type: Object , default: undefined},
    totalPaying: {type: Object , default: undefined},
    totalPayingMonthly: {type: Object , default: undefined},
    userEngagement: {type: Object , default: undefined},
    userSessions: {type: Object , default: undefined},
    watchTime: {type: Object , default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('PayingUser', payingUser);
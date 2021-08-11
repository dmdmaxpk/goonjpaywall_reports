const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const payingUser = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    paying: {type: Object , default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('PayingUser', payingUser);
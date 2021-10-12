const mongoose = require('mongoose');
const ShortId = require('mongoose-shortid-nodeps');
const {Schema} = mongoose;

const revenue = new Schema({
    _id: { type: ShortId, len: 4, retries: 4 },
    affiliate: {type: Object , default: undefined},
    tp_source: {type: Object , default: undefined},
    date: { type: Date, default: Date.now }
}, { strict: true });

module.exports = mongoose.model('Revenue', revenue);
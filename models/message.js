'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MessageSchema = Schema({
    emmitter: {type: Schema.ObjectId, ref: 'User'},
    receiver: {type: Schema.ObjectId, ref: 'User'},
    text: String,
    created_at: String
});

module.exports = mongoose.model('Message', MessageSchema);
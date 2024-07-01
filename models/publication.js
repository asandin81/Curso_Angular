'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PublicationSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    text: String,
    file: String,
    created_at: String
});

module.exports = mongoose.model('Publication', PublicationSchema);
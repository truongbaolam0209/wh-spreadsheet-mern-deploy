const mongoose = require('mongoose')

const schema = require('./schema')
const MODEL_NAME = 'RowHistory'
const COLLECTION_NAME = 'row_histories'

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME)

module.exports = model

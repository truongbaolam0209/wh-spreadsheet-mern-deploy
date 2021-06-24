const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-rfam';
const COLLECTION_NAME = 'dms_table_rfam';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-mm';
const COLLECTION_NAME = 'dms_table_mm';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

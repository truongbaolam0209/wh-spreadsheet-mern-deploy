const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-dt';
const COLLECTION_NAME = 'dms_table_dt';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

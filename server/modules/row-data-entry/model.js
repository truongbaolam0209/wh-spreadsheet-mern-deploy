const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-data-entry';
const COLLECTION_NAME = 'rows-data-entry';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

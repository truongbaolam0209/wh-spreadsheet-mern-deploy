const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-cvi';
const COLLECTION_NAME = 'rows-cvi';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

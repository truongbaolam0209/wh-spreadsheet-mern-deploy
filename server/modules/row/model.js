const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row';
const COLLECTION_NAME = 'rows';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

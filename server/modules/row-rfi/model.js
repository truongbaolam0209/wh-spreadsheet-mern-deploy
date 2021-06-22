const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Row-rfi';
const COLLECTION_NAME = 'rows-rfi';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

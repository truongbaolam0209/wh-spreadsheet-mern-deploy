const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Sheet';
const COLLECTION_NAME = 'sheets';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

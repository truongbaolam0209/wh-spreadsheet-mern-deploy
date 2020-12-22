const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'CellHistory';
const COLLECTION_NAME = 'cell_histories';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

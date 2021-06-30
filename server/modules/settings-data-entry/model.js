const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'Setting-data-entry';
const COLLECTION_NAME = 'settings-data-entry';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

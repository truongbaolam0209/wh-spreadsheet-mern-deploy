const mongoose = require('mongoose');

const schema = require('./schema');
const MODEL_NAME = 'User';
const COLLECTION_NAME = 'users';

const model = mongoose.model(MODEL_NAME, schema, COLLECTION_NAME);

module.exports = model;

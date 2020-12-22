const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');

const handlers = genCRUDHandlers(model);

module.exports = {
   schema,
   model,
   ...handlers
};
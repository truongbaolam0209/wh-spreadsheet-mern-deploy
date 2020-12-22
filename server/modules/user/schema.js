const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TITLES = ['admin', 'guest'];

const schema = new Schema({
   title: {
      type: String,
      required: true,
      enum: TITLES
   },

}, {
   timestamps: true
});

module.exports = schema;

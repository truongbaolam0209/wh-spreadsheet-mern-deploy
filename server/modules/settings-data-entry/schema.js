const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { SHEET_PUBLIC_FIELDS_MAP, SHEET_USER_FIELDS_MAP } = require('./config');


const schema = new Schema({
   sheet: {
      type: String,
      required: true,
      ref: 'Sheet'
   },
   ...SHEET_PUBLIC_FIELDS_MAP,
   ...SHEET_USER_FIELDS_MAP
}, {
   timestamps: true,
   minimize: false
});

module.exports = schema;

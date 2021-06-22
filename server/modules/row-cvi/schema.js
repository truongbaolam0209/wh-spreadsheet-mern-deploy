const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
   data: {
      type: Object,
      default: () => ({})
   },
   sheet: {
      type: String,
      required: true,
      ref: 'Sheet'
   },
   cviRef: {
      type: String,
      required: true,
   },
   revision: String,
   trade: {
      type: String,
      required: true
   },
}, {
   timestamps: true
});

module.exports = schema;






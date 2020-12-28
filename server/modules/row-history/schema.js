const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new Schema({
   sheet: {
      type: String,
      required: true,
   },
   username: {
      type: String,
      required: true,
   },
   row: {
      type: ObjectId,
      required: true,
      ref: 'Row'
   },
   history: {
      type: Object,
      default: () => ({})
   }
}, {
   timestamps: true
});

module.exports = schema;

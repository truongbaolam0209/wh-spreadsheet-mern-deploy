const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
  sheet: {
    required: true,
    ref: 'Sheet'
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
})

module.exports = schema

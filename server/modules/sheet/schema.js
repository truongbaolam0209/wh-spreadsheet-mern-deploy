const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const schema = new Schema({
   name: {
      type: String,
      default: "document"
   },
   createdBy: {
      type: String,
      ref: 'User',
      required: true
   }
}, {
   timestamps: true
});

module.exports = schema;

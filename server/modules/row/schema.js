const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const { toObjectId } = require('../utils');


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
   level: {
      type: Number,
      required: true,
      default: 0
   },
   parentRow: {
      type: ObjectId,
      default: () => null, // first level row parentRow = null, sub row save parent row id
      ref: 'Row'
   },
   preRow: {
      type: ObjectId,
      validate: {
         validator: (v) => {
            if (v === null) {
               return true
            }
            let preRowId = toObjectId(v, false)
            if (!preRowId) {
               return "'preRow' must be row id!"
            }
            return true
         }
      },
      default: () => null, // preRow null means first row of sheet
      ref: 'Row'
   }
}, {
   timestamps: true
});

module.exports = schema;

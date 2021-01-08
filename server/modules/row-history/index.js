
const schema = require('./schema');
const model = require('./model');
const { HTTP } = require('../errors');
const { toObjectId } = require('../utils');
const HISTORY_LIMIT = 10;


const findHistoriesForSheet = async (req, res, next) => {
   try {
      let { sheetId } = req.params;

      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');

      let histories = await model.find({ sheet: sheetId })
         .sort([['row', 1]])
         .exec();

      return res.json(histories);

   } catch (error) {
      next(error);
   };
};


const findHistoryForOneRow = async (req, res, next) => {
   try {
      let { sheetId, rowId: qRowId } = req.params;

      let rowId = toObjectId(qRowId);

      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');
      if (!rowId) throw new HTTP(400, 'Missing row id!');

      let histories = await model.find({ sheet: sheetId, row: rowId });

      return res.json(histories);
   } catch (error) {

      next(error);
   };
};


const saveRowHistory = async (req, res, next) => {
   try {
      let userId = req.query.userId;
      let qSheetId = req.params.sheetId;

      let data = req.body;

      if (!(data instanceof Array)) throw new HTTP(400, 'Body data must be array info of cell history!');

      for (let d of data) {
         d.sheet = qSheetId;
         d.userId = userId;
      };

      let history = await model.create(data);

      return res.json(history);

   } catch (error) {
      next(error);
   };
};

const deleteAllDataInCollection = async (req, res, next) => {
   try {
     let result = await model.deleteMany({});
     return res.json(result);
   } catch(err) {
     next(err);
   };
};

module.exports = {
   schema,
   model,

   findHistoriesForSheet,
   findHistoryForOneRow,
   saveRowHistory,
   deleteAllDataInCollection
};
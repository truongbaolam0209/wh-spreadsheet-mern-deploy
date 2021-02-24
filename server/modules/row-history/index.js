
const schema = require('./schema');
const model = require('./model');
const { HTTP } = require('../errors');
const { toObjectId } = require('../utils');
const HISTORY_LIMIT = 10;



const saveRowHistory = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, rowsHistory } = req.body;
      if (!(rowsHistory instanceof Array)) throw new HTTP(400, 'Body data must be array info of cell history!');
      for (let d of rowsHistory) {
         d.sheet = sheetId;
         d.userId = userId;
      };
      let history = await model.create(rowsHistory);

      return res.json(history);
   } catch (error) {
      next(error);
   };
};

const findHistoriesForSheet = async (req, res, next) => {
   try {
      const { projectId: sheetId } = req.query;
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
      let { projectId: sheetId, rowId: qRowId } = req.query;
      let rowId = toObjectId(qRowId);

      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');
      if (!rowId) throw new HTTP(400, 'Missing row id!');

      let histories = await model.find({ sheet: sheetId, row: rowId });
      return res.json(histories);
   } catch (error) {
      next(error);
   };
};

const deleteAllDataInCollection = async (req, res, next) => {
   try {
      let result = await model.deleteMany({});
      return res.json(result);
   } catch (err) {
      next(err);
   };
};



const saveAllDataRowHistoryToServer = async (req, res, next) => {
   try {
      const { dataToSave } = req.body;
      const data = await model.insertMany(dataToSave);
      return res.json(data);
   } catch (error) {
      next(error);
   };
};



module.exports = {
   schema,
   model,

   findHistoriesForSheet,
   findHistoryForOneRow,
   saveRowHistory,
   deleteAllDataInCollection,


   saveAllDataRowHistoryToServer
};
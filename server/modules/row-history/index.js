
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


const deleteRowsHistory = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, rowsHistoryIdsArray } = req.body;
      if (!sheetId || !userId) throw new HTTP(404);

      if (!(rowsHistoryIdsArray instanceof Array)) throw new HTTP(400, 'Body must be array of row id!');

      let rowIds = rowsHistoryIdsArray.map(rowIdData => {
         return toObjectId(rowIdData, null)
      }).filter(Boolean);
      let result = await model.deleteMany({ _id: { $in: rowIds } });

      return res.json(result);

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

const updateOrCreateHistories = async (req, res, next) => {

   try {
      const { projectId: sheetId, rowsHistory } = req.body;

      let histories = await Promise.all(
         rowsHistory.map(async (historyData) => {
            if (historyData._id) {

               let { _id, history: historyObjData, ...rest } = historyData;

               let historyItem = await model.findById(_id).lean().exec();

               if (!historyItem) return null;
               let historyObj = {
                  ...(historyItem.history || {}),
                  ...historyObjData,
               };
               let updatedHistoryItem = await model.findByIdAndUpdate(
                  _id,
                  { history: historyObj, ...rest },
                  { new: true, }
               );
               return updatedHistoryItem;
            } else {
               return null;
            };
         })
      );
      return res.json(histories);
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
   deleteRowsHistory,
   updateOrCreateHistories,


   saveAllDataRowHistoryToServer
};
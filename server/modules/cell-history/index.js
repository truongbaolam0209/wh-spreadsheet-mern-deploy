const schema = require('./schema');
const model = require('./model');
const { HTTP } = require('../errors');
const { toObjectId } = require('../utils');
const HISTORY_LIMIT = 10;


const saveCellHistories = async (req, res, next) => {
   try {
      const { projectId: sheetId, cellsHistory } = req.body;
      if (!(cellsHistory instanceof Array)) throw new HTTP(400, 'Body data must be array info of cell history!');

      await _processSaveCellHistories(sheetId, cellsHistory);

      return res.json({ 'message': 'success' })
   } catch (error) {
      next(error);
   };
};

const findHistoriesForSheet = async (req, res, next) => {
   try {
      let { projectId: sheetId } = req.query;
      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');

      let histories = await model.find({ sheet: sheetId })
         .sort([['row', 1], ['headerKey', 1]])
         .exec();

      return res.json(histories);
   } catch (error) {
      next(error);
   };
};

const findHistoryForOneCell = async (req, res, next) => {
   try {
      let { projectId: sheetId, rowId: qRowId, headerKey: qHeaderKey } = req.query;

      let rowId = toObjectId(qRowId);
      let headerKey = String(qHeaderKey);

      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');
      if (!rowId) throw new HTTP(400, 'Missing row id!');
      if (!headerKey) throw new HTTP(400, 'Missing header key!');

      let history = await _findCellHistory(sheetId, rowId, headerKey);

      return res.json(history);

   } catch (error) {
      next(error);
   };
};








const _processSaveCellHistories = async (sheetId, data) => {
   let _map = {};

   for (let d of data) {
      if (!(d instanceof Object)) throw new HTTP(400, 'Invalid data cell history!');

      let { rowId: qRowId, headerKey: qHeaderKey, history: qHistory } = d;


      let rowId = toObjectId(qRowId, null);
      let headerKey = String(qHeaderKey);


      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');
      if (!rowId) throw new HTTP(400, 'Missing row id!');
      if (!headerKey) throw new HTTP(400, 'Missing header key!');
      if (!qHistory instanceof Object) throw new HTTP(400, 'Invalid cell history data!');


      let _key = `${sheetId}.${rowId}.${headerKey}`;
      let cellHistoryData = _map[_key];

      if (!cellHistoryData) {
         cellHistoryData = {
            sheet: sheetId,
            row: rowId,
            headerKey,
            histories: []
         };
         _map[_key] = cellHistoryData;
      };
      cellHistoryData.histories.push(qHistory);
   };
   let cellHistoryData = Object.values(_map);

   await Promise.all(cellHistoryData.map(_updateCellHistories));
};

const _updateCellHistories = async (cellHistoryData) => {

   let { sheet, row, headerKey, histories: newHistories } = cellHistoryData;

   let cellHistory = await _findCellHistory(sheet, row, headerKey);

   if (!(cellHistory.histories instanceof Array)) {
      cellHistory.histories = [];
   };

   cellHistory.histories = [...cellHistory.histories, ...newHistories];

   if (cellHistory.histories.length > HISTORY_LIMIT) {
      let indexToSplice = cellHistory.histories.length - HISTORY_LIMIT;
      cellHistory.histories = cellHistory.histories.splice(indexToSplice, HISTORY_LIMIT);
   };

   return cellHistory.save();
};
const _findCellHistory = async (sheetId, rowId, headerKey) => {
   let history = await model.findOne({ sheet: sheetId, row: rowId, headerKey });
   if (!history) {
      history = await model.create({
         sheet: sheetId,
         row: rowId,
         headerKey,
         histories: []
      });
   };

   return history;
};

const deleteAllDataInCollectionCell = async (req, res, next) => {
   try {
     let result = await model.deleteMany({});
     return res.json(result);
   } catch(err) {
     next(err);
   };
};


const saveAllDataCellHistoryToServer = async (req, res, next) => {
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
   findHistoryForOneCell,
   saveCellHistories,
   deleteAllDataInCollectionCell,

   saveAllDataCellHistoryToServer
};
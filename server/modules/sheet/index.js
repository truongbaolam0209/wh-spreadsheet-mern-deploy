const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');
const { toObjectId, mongoObjectId } = require('../utils');
const {
   findPublicSettings,
   findUserSettings,
   updatePublicSettings,
   updateUserSettings
} = require('../settings');


const { HTTP } = require('../errors');
const rowModel = require('../row/model');
const cellHistoryModel = require('../cell-history/model');
const rowHistoryModel = require('../row-history/model');
const settingsModel = require('../settings/model');


const handlers = genCRUDHandlers(model, {
   genQueryToFindMany
});

function genQueryToFindMany() {
   return {
      query: {},
      populate: 'createdBy'
   };
};





const createRowsEmptyInit = (drawingTypeTree) => {
   const genId = (nosOfRows) => {
      let arr = [];
      for (let i = 0; i < nosOfRows; i++) {
         arr.push(mongoObjectId());
      };
      return arr;
   };
   let output = [];
   drawingTypeTree.forEach(row => {
      if (row._rowLevel === 0) {
         let idsArr = genId(5);
         const newRows = idsArr.map((id, i) => {
            return ({
               _id: id,
               level: 1,
               parentRow: row.id,
               preRow: i === 0 ? null : idsArr[i - 1]
            });
         });
         output = [...output, ...newRows];
      };
   });
   return output;
};

const findOneWithUserEmail = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId } = req.query;

      if (!sheetId || !userId) throw new HTTP(404);

      let [item, userSettings] = await Promise.all([
         findSheetIncludingRowsSortedFnc(sheetId),
         findUserSettings(sheetId, userId)
      ]);

      if (item) item.userSettings = userSettings;

      return res.json(item);

   } catch (error) {
      next(error);
   };
};

const updateOrCreateRows = async (req, res, next) => {
   try {
      const { projectId: sheetId, rows } = req.body;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');

      let result = await _update_Or_Create_Rows(rows, sheetId);
      return res.json(result);

   } catch (err) {
      next(err);
   };
};

const deleteRows = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, rowIdsArray } = req.body;

      if (!sheetId || !userId) throw new HTTP(404);

      if (!(rowIdsArray instanceof Array)) throw new HTTP(400, 'Body must be array of row id!');

      let rowIds = rowIdsArray.map(rowIdData => {
         return toObjectId(rowIdData, null)
      }).filter(Boolean);

      let result = await rowModel.deleteMany({ _id: { $in: rowIds } });

      return res.json(result);

   } catch (error) {
      next(error);
   };
};

const updateSettingPublic = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, publicSettings } = req.body;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!userId) throw new HTTP(400, 'Invalid sheet id!');
      let setting = await updatePublicSettings(sheetId, userId, publicSettings);

      return res.json(setting);
   } catch (err) {
      next(err);
   };
};

const updateSettingUser = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, userSettings } = req.body;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!userId) throw new HTTP(400, 'Invalid sheet id!');

      let setting = await updateUserSettings(sheetId, userId, userSettings);

      return res.json(setting);
   } catch (err) {
      next(err);
   };
};

const deleteAllRowsInOneProject = async (req, res, next) => {
   try {
      const { projectId: sheetId } = req.body;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      let result = await rowModel.deleteMany({ sheet: sheetId });
      return res.json(result);
   } catch (error) {
      next(error);
   };
};

const deleteAllDataInCollection = async (req, res, next) => {
   try {
      let result = await rowModel.deleteMany({});
      return res.json(result);
   } catch (err) {
      next(err);
   };
};

const findMany = async (req, res, next) => {
   try {
      let sheetIdsData = req.body.sheetIds;
      if (!(sheetIdsData instanceof Array)) throw new HTTP(400, 'Sheet ids must be array!');
      let sheetIds = sheetIdsData.map(id => id).filter(Boolean);
      let items = await Promise.all(sheetIds.map(findSheetIncludingRowsSortedFnc));
      return res.json(items);
   } catch (error) {
      next(error);
   };
};

const findSheetIncludingRowsSortedFnc = async (sheetId) => {
   let [publicSettings, dataRows] = await Promise.all([
      findPublicSettings(sheetId),
      rowModel.find({
         sheet: sheetId,
         level: 1,
      }).lean().exec()
   ]);

   let sheet = { _id: sheetId };
   let rows = [];
   let headers = publicSettings && publicSettings.headers instanceof Array ? publicSettings.headers : [];

   let { drawingTypeTree } = publicSettings;

   if (dataRows.length === 0) {
      let emptyRows = createRowsEmptyInit(drawingTypeTree);
      let manyRows = await _update_Or_Create_Rows(emptyRows, sheetId);
      rows = manyRows.rowsToCreate;

   } else {
      for (let row of dataRows) {
         if (row.level == 1) rows.push(row);
      };
   };

   sheet.rows = _process_Rows(headers, rows);

   drawingTypeTree.forEach(row => {
      headers.forEach(hd => {
         if (row[hd.key]) {
            row[hd.text] = row[hd.key];
            delete row[hd.key];
         };
      });
   });

   sheet.publicSettings = publicSettings;
   return sheet;
};

const _update_Or_Create_Rows = async (rowsData, sheetId) => {

   let { rowsToUpdate, rowsToCreate } = await _process_Rows_Data(rowsData, sheetId);

   const _genUpdateRowQuery = (rowData) => {
      let { _id, data, ...rest } = rowData;
      let setDataQuery = { ...rest };
      for (let key in data) {
         setDataQuery[`data.${key}`] = data[key];
      };
      return {
         $set: setDataQuery
      };
   };

   await Promise.all([
      ...rowsToUpdate.map((r) => rowModel.updateOne({ _id: r._id }, _genUpdateRowQuery(r))),
      rowModel.create(rowsToCreate),
   ]);
   return {
      created: rowsToCreate.length,
      updated: rowsToUpdate.length,

      rowsToCreate,
      rowsToUpdate
   };
};

const _process_Rows_Data = async (rowsData, sheetId) => {
   let rowsToUpdate = [];
   let rowsToCreate = [];
   if (rowsData instanceof Array) {

      let ids = rowsData.filter(rowData => {
         if (!(rowData instanceof Object)) throw new Error('Invalid row data!');
         return Boolean(rowData._id);

      }).map((rowData) => String(rowData._id));

      let existsRows = await rowModel.find({
         _id: { $in: ids.map((id) => toObjectId(id)) },
         sheet: sheetId
      }, '_id').exec();

      let existsIds = existsRows.map((row) => String(row._id));

      for (let rowData of rowsData) {
         if (existsIds.includes(String(rowData._id))) {
            rowsToUpdate.push(rowData);
         } else {
            rowData.sheet = sheetId;
            rowsToCreate.push(rowData);
         };
      };
   };
   return { rowsToCreate, rowsToUpdate };
};

const _process_Rows = (sheetHeaders, rows) => {

   let rowsProcessed = [];

   const _formalRowData = (row, sheetHeaders) => {
      let { _id, data, level, parentRow, preRow } = row;
      let rowFormal = {
         id: _id,
         _rowLevel: level,
         _parentRow: parentRow,
         _preRow: preRow
      };
      if (data instanceof Object) {
         for (let header of sheetHeaders) {
            let { key, text } = header;
            if (key && text) rowFormal[text] = data[key];
         };
      };
      return rowFormal;
   };

   let firstRowIndex = rows.findIndex((row) => row.preRow === null);
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      while (preRow) {
         rowsProcessed.push(_formalRowData(preRow, sheetHeaders));
         let nextRowIndex = rows.findIndex(row => String(row.preRow) == String(preRow._id));
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0];
         } else {
            preRow = null;
         };
      };
      firstRowIndex = rows.findIndex((row) => row.preRow === null);
   };
   return rowsProcessed;
};

const getAllCollections = async (req, res, next) => {

   try {
      const { user } = req.query;
      if (user === 'truongbaolam0209') {
         let [rows, cellHistories, rowHistories, settings] = await Promise.all([
            rowModel.find({}),
            cellHistoryModel.find({}),
            rowHistoryModel.find({}),
            settingsModel.find({})
         ]);
         return res.json({ rows, cellHistories, rowHistories, settings });
      };
   } catch (error) {
      next(error);
   };
};




const saveAllDataSettingsToServer = async (req, res, next) => {
   try {
      const { dataToSave } = req.body;
      const data = await settingsModel.insertMany(dataToSave);
      return res.json(data);
   } catch (error) {
      next(error);
   };
};
const saveAllDataRowsToServer = async (req, res, next) => {
   try {
      const { dataToSave } = req.body;
      const data = await rowModel.insertMany(dataToSave);
      return res.json(data);
   } catch (error) {
      next(error);
   };
};



module.exports = {
   schema,
   model,
   ...handlers,

   findOneWithUserEmail,
   updateOrCreateRows,
   deleteRows,

   updateSettingPublic,
   updateSettingUser,
   deleteAllRowsInOneProject,
   deleteAllDataInCollection,
   findMany,
   getAllCollections,


   saveAllDataSettingsToServer,
   saveAllDataRowsToServer
};







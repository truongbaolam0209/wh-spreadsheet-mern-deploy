const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');
const {
   findPublicSettings,
   findUserSettings,
   updatePublicSettings,
   updateUserSettings
} = require('../settings-data-entry');

const rowDataEntryModel = require('../row-data-entry/model');

const handlers = genCRUDHandlers(model);

const { _update_Or_Create_Rows } = require('../sheet');
const { toObjectId } = require('../utils');





const findOneWithUserEmail = async (req, res, next) => {
   try {
      const { projectId: sheetId, email: userId, headers } = req.body;

      if (!sheetId || !userId || !headers) throw new HTTP(404);

      let [item, userSettings] = await Promise.all([
         findSheetIncludingRowsSortedFnc(sheetId, headers),
         findUserSettings(sheetId, userId)
      ]);

      if (item) item.userSettings = userSettings;
      return res.json(item);

   } catch (error) {
      next(error);
   };
};

const findSheetIncludingRowsSortedFnc = async (sheetId, headers) => {
   let [publicSettings, dataRows] = await Promise.all([
      findPublicSettings(sheetId),
      rowDataEntryModel.find({
         sheet: sheetId,
         level: 1,
      }).lean().exec()
   ]);

   let rows = [];
   for (let row of dataRows) {
      if (row.level == 1) rows.push(row);
   };

   const rowsProcessed = _process_Rows(headers, rows);

   const rowsOutput = rowsProcessed.map(row => {
      
      const output = {
         _id: row.id,
         level: row._rowLevel,
         parentRow: row._parentRow,
         preRow: row._preRow,
      };

      let data = {};
      for (const key in row) {
         if (
            key !== 'id' &&  key !== '_rowLevel' && key !== '_preRow' && key !== '_parentRow' &&
            key !== 'sheet' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v'
         ) {
            const headerFound = headers.find(hd => hd.name === key);
            if (headerFound) {
               data[headerFound.id] = row[key];
            } else {
               output[key] = row[key];
            };
         };
      };

      output.data = data;
      return output;
   });



   const outputPublicSettings = {
      sheetId: publicSettings.sheet,
      drawingTypeTree: publicSettings.drawingTypeTree,
      activityRecorded: publicSettings.activityRecorded,
      headers
   };


   return {
      publicSettings: outputPublicSettings,
      userSettings: null,
      rows: rowsOutput
   };
};



const updateOrCreateRowsDataEntry = async (req, res, next) => {

   try {
      const { projectId: sheetId, rows } = req.body;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');


      let result = await _update_Or_Create_Rows(rows, sheetId, model);
      
      return res.json(result);

   } catch (err) {
      next(err);
   };
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

      for (const key in row) {
         if (key !== '_id' && key !== 'data' && key !== 'level' && key !== 'preRow' && key !== 'parentRow') {
            rowFormal[key] = row[key];
         };
      };


      if (data instanceof Object) {
         Object.keys(data).forEach(key => {
            const headerFound = sheetHeaders.find(hd => hd.id === key);
            if (headerFound) {
               rowFormal[headerFound.name] = data[key];
            };
         });
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

const deleteRows = async (req, res, next) => {
   try {

      const { projectId: sheetId, email: userId, rowIdsArray } = req.body;

      if (!sheetId || !userId) throw new HTTP(404);

      if (!(rowIdsArray instanceof Array)) throw new HTTP(400, 'Body must be array of row id!');

      let rowIds = rowIdsArray.map(rowIdData => {
         return toObjectId(rowIdData, null)
      }).filter(Boolean);

      let result = await rowDataEntryModel.deleteMany({ _id: { $in: rowIds } });

      return res.json(result);

   } catch (error) {
      next(error);
   };
};


const deleteAllDataInThisCollection = async (req, res, next) => {
   try {
     let result = await model.deleteMany({});
     return res.json(result);
   } catch(err) {
     next(err);
   };
};
const saveAllDataToServer = async (req, res, next) => {
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
   ...handlers,

   findOneWithUserEmail,
   updateOrCreateRowsDataEntry,
   deleteRows,

   saveAllDataToServer,
   deleteAllDataInThisCollection
};
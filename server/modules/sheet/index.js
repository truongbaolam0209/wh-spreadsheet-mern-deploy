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


const handlers = genCRUDHandlers(model, {
   genQueryToFindMany
});

function genQueryToFindMany() {
   return {
      query: {},
      populate: 'createdBy'
   };
};



async function findOneWithUserEmail(req, res, next) {
   try {
      let sheetId = req.params.id;
      let userId = req.query.userId;

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


async function findMany(req, res, next) {
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
async function findSheetIncludingRowsSortedFnc(sheetId) {

   let [publicSettings, dataRows] = await Promise.all([
      findPublicSettings(sheetId),
      rowModel.find({
         sheet: sheetId,
         level: 1,
      }).lean().exec()
   ]);

   let sheet = { _id: sheetId };
   let rows = [];
   let headers = publicSettings && publicSettings.headers instanceof Array
      ? publicSettings.headers
      : [];

   let drawingTypeTree = publicSettings.drawingTypeTree;

   if (dataRows.length === 0) {

      let emptyRows = createRowsEmptyInit(drawingTypeTree);
      let manyRows = await _updateOrCreateManyRows(emptyRows, sheetId);
      rows = manyRows.rowsToCreate;

   } else {
      for (let row of dataRows) {
         if (row.level == 1) rows.push(row);
      };
   };
   
   sheet.rows = _processRows(headers, rows);

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






const updateOrCreateRows = async (req, res, next) => {

   try {
      let sheetId = req.params.id;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');

      let { rows = [] } = req.body;
      // // // await _validateUserPermissionEditRows(sheetId, userId, rows);
      let result = await _updateOrCreateManyRows(rows, sheetId);
      return res.json(result);

   } catch (err) {
      next(err);
   };
};
const _updateOrCreateManyRows = async (rowsData, sheetId) => {

   let { rowsToUpdate, rowsToCreate } = await _processRowsData(rowsData, sheetId);

   await Promise.all([
      ...rowsToUpdate.map((r) => rowModel.updateOne({ _id: r._id }, _genUpdateRowQuery(r))),
      // ...rowsToUpdate.map((r) => rowModel.updateOne({ _id: r._id }, r)),
      rowModel.create(rowsToCreate),
   ]);
   return {
      created: rowsToCreate.length,
      updated: rowsToUpdate.length,

      rowsToCreate,
      rowsToUpdate
   };
};
function _genUpdateRowQuery(rowData) {
   let { _id, data, ...rest } = rowData;
   let setDataQuery = { ...rest };
   for (let key in data) {
      setDataQuery[`data.${key}`] = data[key];
   };
   return {
      $set: setDataQuery
   };
};



const _processRowsData = async (rowsData, sheetId) => {
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
         if (existsIds.includes(rowData._id)) {
            rowsToUpdate.push(rowData);
         } else {
            rowData.sheet = sheetId
            rowsToCreate.push(rowData)
         };
      };
   };
   return { rowsToCreate, rowsToUpdate };
};




const deleteRow = async (req, res, next) => {

   try {
      let sheetId = req.params.id;
      let { rowId: qRowId } = req.body;
      let rowId = toObjectId(qRowId, null);

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!rowId) throw new HTTP(400, 'Invalid row id!');

      let [row, rowAtSamePlace] = await Promise.all([
         rowModel.findOne({ sheet: sheetId, _id: rowId }),
         rowModel.findOne({ sheet: sheetId, preRow: rowId }),
      ]);

      if (row) {
         await Promise.all([
            row.deleteOne(),
            rowAtSamePlace ? rowAtSamePlace.updateOne({ preRow: row.preRow }) : null,
         ]);
      };

      return res.json({ deleteCount: row ? 1 : 0 });
   } catch (err) {
      next(err)
   };
};
const deleteRows = async (req, res, next) => {
   try {
      let sheetId = req.params.id;
      let userId = req.query.userId;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!userId) throw new HTTP(400, 'Invalid user id!');

      let rowIdDatas = req.body;
      if (!(rowIdDatas instanceof Array)) throw new HTTP(400, 'Body must be array of row id!');

      let rowIds = rowIdDatas.map(rowIdData => {
         return toObjectId(rowIdData, null)
      }).filter(Boolean);
      
      let result = await rowModel.deleteMany({ _id: { $in: rowIds } });

      return res.json(result);

   } catch (error) {
      next(error);
   };
};
const deleteAllDataInCollection = async (req, res, next) => {
   try {
     let result = await rowModel.deleteMany({});
     return res.json(result);
   } catch(err) {
     next(err);
   };
};

const deleteAllRowsInOneProject = async (req, res, next) => {
   try {
      let sheetId = req.params.id;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      let result = await rowModel.deleteMany({ sheet: sheetId });
      return res.json(result);

   } catch (error) {
      next(error);
   };
};





const updateSettingPublic = async (req, res, next) => {
   try {
      let sheetId = req.params.id;
      let userId = req.query.userId;

      let settingData = req.body;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!userId) throw new HTTP(400, 'Invalid sheet id!');

      let setting = await updatePublicSettings(sheetId, userId, settingData);

      return res.json(setting);
   } catch (err) {
      next(err);
   };
};
const updateSettingUser = async (req, res, next) => {
   try {
      let sheetId = req.params.id;
      let userId = req.query.userId;

      let settingData = req.body;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');
      if (!userId) throw new HTTP(400, 'Invalid sheet id!');

      let setting = await updateUserSettings(sheetId, userId, settingData);

      return res.json(setting);
   } catch (err) {
      next(err);
   };
};




const _processRows = (sheetHeaders, rows) => {

   let rowsProcessed = [];

   // sort & format rows
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

const _formalRowData = (row, sheetHeaders) => {
   // data sheet level parentRow preRow createdAt updatedAt
   let { _id, data, sheet, level, parentRow, preRow, createdAt, updatedAt } = row;
   let rowFormal = {
      id: _id,
      // _sheet: sheet,
      _rowLevel: level,
      _parentRow: parentRow,
      _preRow: preRow,
      // _createdAt: createdAt,
      // _updatedAt: updatedAt,
   };

   if (data instanceof Object) {
      for (let header of sheetHeaders) {
         let { key, text } = header;

         if (key && text) rowFormal[text] = data[key];
      };
   };

   return rowFormal;
};

const _groupSubRowsByParentId = (subRows) => {
   let groups = {};
   for (let subRow of subRows) {
      let parentId = subRow.parentRow;
      let group = groups[parentId] || [];
      groups[parentId] = group;
      group.push(subRow);
   };
   return groups;
};



module.exports = {
   schema,
   model,
   ...handlers,


   updateOrCreateRows,
   deleteRow,
   deleteRows,
   updateSettingPublic,
   updateSettingUser,
   findOneWithUserEmail,
   deleteAllRowsInOneProject,
   deleteAllDataInCollection,
   findMany
};



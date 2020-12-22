const express = require('express');
const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');
const { toObjectId } = require('../utils');
const {
   findPublicSettings,
   findUserSettings,
   updatePublicSettings,
   updateUserSettings,
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
         findSheetIncludingRowsSortedFinal(sheetId),
         findUserSettings(sheetId, userId)
      ]);

      if (item) item.userSettings = userSettings;

      return res.json(item);

   } catch (error) {
      next(error);
   };
};

async function findSheetIncludingRowsSortedFinal(sheetId) {

   let [publicSettings, dataRows] = await Promise.all([

      findPublicSettings(sheetId),

      rowModel.find({
         sheet: sheetId,
         level: { $in: [0, 1, 2] },
      }).lean().exec()
   ]);

   let sheet = { _id: sheetId };
   let rows = [];
   let subRowsLv1 = [];
   let subRowsLv2 = [];
   let headers = publicSettings && publicSettings.headersSheet instanceof Array
      ? publicSettings.headersSheet
      : [];

   for (let row of dataRows) {
      if (row.level == 0) rows.push(row);
      else if (row.level == 1) subRowsLv1.push(row);
      else if (row.level == 2) subRowsLv2.push(row);
   };

   sheet.rows = _processRows(headers, rows, subRowsLv1, subRowsLv2);
   sheet.publicSettings = publicSettings;

   return sheet;
};













const findManyByUserId = async (req, res, next) => {

   try {
      let userId = toObjectId(req.query.userId, null);

      if (!userId) throw new HTTP(400, 'Missing userId!');

      let sheets = await model.find({
         createdBy: userId
      });

      return res.json(sheets);
   } catch (error) {
      next(error);
   };
};


const create = async (req, res, next) => {
   try {
      let userId = toObjectId(req.query.userId, null);
      let { name } = req.body;

      if (!userId) throw new HTTP(400, 'Missing userId!');
      if (!name) throw new HTTP(400, 'Missing sheet name!');

      let sheet = await model.create({
         name,
         createdBy: userId
      });

      let [publicSettings, userSettings] = await Promise.all([
         findPublicSettings(sheet._id),
         findUserSettings(sheet._id, userId)
      ]);

      sheet.publicSettings = publicSettings;
      sheet.userSettings = userSettings;

      return res.json(sheet);
   } catch (error) {
      next(error);
   };
};


const findOne = async (req, res, next) => {

   try {
      let sheetId = toObjectId(req.params.id, null);
      let userId = toObjectId(req.query.userId, null);

      if (!sheetId) throw new HTTP(404);

      let [item, userSettings] = await Promise.all([
         findSheetIncludingRowsSorted(sheetId), // including public settings
         userId ? findUserSettings(sheetId, userId) : null,
      ]);

      if (item) item.userSettings = userSettings;


      return res.json(item);
   } catch (error) {
      next(error);
   };
};



const updateOrCreateRows = async (req, res, next) => {

   try {
      let sheetId = req.params.id;
      console.log(sheetId);
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');

      let { rows = [] } = req.body;

      // await _validateUserPermissionEditRows(sheetId, userId, rows);

      let result = await _updateOrCreateManyRows(rows, sheetId);

      return res.json(result);

   } catch (err) {
      next(err);
   };
};



const _updateOrCreateManyRows = async (rowsData, sheetId) => {

   let { rowsToUpdate, rowsToCreate } = await _processRowsData(rowsData, sheetId);

   await Promise.all([
      ...rowsToUpdate.map((r) => rowModel.updateOne({ _id: r._id }, r)),
      rowModel.create(rowsToCreate),
   ]);

   return {
      created: rowsToCreate.length,
      updated: rowsToUpdate.length
   };
};






const deleteRow = async (req, res, next) => {

   try {
      let qId = req.params.id;
      let sheetId = toObjectId(qId, null);
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

      // _clearUnusedRows(sheetId);

      return res.json({ deleteCount: row ? 1 : 0 });
   } catch (err) {
      next(err)
   };
};


const updateSetting = async (req, res, next) => {
   try {
      let qId = req.params.id;
      let qUserId = req.query.userId;
      let sheetId = toObjectId(qId, null);
      let userId = toObjectId(qUserId, null);
      let settingData = req.body;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');


      let setting = await (userId
         ? updateUserSettings(sheetId, userId, settingData)
         : updatePublicSettings(sheetId, settingData));

      return res.json(setting);

   } catch (err) {
      next(err);
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



const findSheetIncludingRowsSorted = async (sheetId) => {
   let [sheet, publicSettings, dataRows] = await Promise.all([

      model.findById(sheetId).lean().exec(),

      findPublicSettings(sheetId),
      rowModel.find({
         sheet: sheetId,
         level: { $in: [0, 1, 2] },
      }).lean().exec(),
   ]);

   if (!sheet) return sheet;

   let rows = [];
   let subRowsLv1 = [];
   let subRowsLv2 = [];
   let headers = publicSettings && publicSettings.headersSheet instanceof Array
      ? publicSettings.headersSheet
      : [];

   for (let row of dataRows) {
      if (row.level == 0) rows.push(row);
      else if (row.level == 1) subRowsLv1.push(row);
      else if (row.level == 2) subRowsLv2.push(row);
   };

   sheet.rows = _processRows(headers, rows, subRowsLv1, subRowsLv2);
   sheet.publicSettings = publicSettings;

   return sheet;
};




const _processRows = (sheetHeaders, rows, subRowsLv1, subRowsLv2) => {

   let rowsProcessed = [];
   let groupSubRowsLv1 = _groupSubRowsByParentId(subRowsLv1);
   let groupSubRowsLv2 = _groupSubRowsByParentId(subRowsLv2);

   // sort & format rows
   let firstRowIndex = rows.findIndex((row) => row.preRow === null);
   if (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      while (preRow) {
         rowsProcessed.push(_formalRowData(preRow, sheetHeaders));

         // sort & format subRowsLv1
         let subRowsLv1 = groupSubRowsLv1[preRow._id] || [];
         let firstSubRowLv1Index = subRowsLv1.findIndex(sr1 => sr1.preRow == null);
         if (firstSubRowLv1Index >= 0) {
            let preSubRowLv1 = subRowsLv1.splice(firstSubRowLv1Index, 1)[0];
            while (preSubRowLv1) {
               rowsProcessed.push(_formalRowData(preSubRowLv1, sheetHeaders));

               // sort & format subRowsLv2
               let subRowsLv2 = groupSubRowsLv2[preSubRowLv1._id] || [];
               let firstSubRowLv2Index = subRowsLv2.findIndex(sr2 => sr2.preRow == null);

               if (firstSubRowLv2Index >= 0) {
                  let preSubRowLv2 = subRowsLv2.splice(firstSubRowLv2Index, 1)[0];
                  while (preSubRowLv2) {
                     rowsProcessed.push(_formalRowData(preSubRowLv2, sheetHeaders));

                     let nextSubRowLv2Index = subRowsLv2.findIndex(sr2 => String(sr2.preRow) == String(preSubRowLv2._id));
                     if (nextSubRowLv2Index >= 0) {
                        preSubRowLv2 = subRowsLv2.splice(nextSubRowLv2Index, 1)[0];
                     } else {
                        preSubRowLv2 = null;
                     };
                  };
               };

               let nextSubRowLv1Index = subRowsLv1.findIndex(sr1 => String(sr1.preRow) == String(preSubRowLv1._id));

               if (nextSubRowLv1Index >= 0) {
                  preSubRowLv1 = subRowsLv1.splice(nextSubRowLv1Index, 1)[0];
               } else {
                  preSubRowLv1 = null;
               };
            };
         };

         let nextRowIndex = rows.findIndex(row => String(row.preRow) == String(preRow._id));
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0];
         } else {
            preRow = null;
         };
      };
   };

   return rowsProcessed;
};

const _formalRowData = (row, sheetHeaders) => {
   // data sheet level parentRow preRow createdAt updatedAt
   let { _id, data, sheet, level, parentRow, preRow, createdAt, updatedAt } = row;
   let rowFormal = {
      _id,
      _sheet: sheet,
      _rowLevel: level,
      _parentRow: parentRow,
      _preRow: preRow,
      _createdAt: createdAt,
      _updatedAt: updatedAt,
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


const _clearUnusedRows = (sheetId) => {
   try {

   } catch (err) {
      console.error(err);
   };
};

module.exports = {
   schema,
   model,
   ...handlers,
   findManyByUserId,
   create,
   findOne,
   updateOrCreateRows,
   deleteRow,
   updateSetting,
   findOneWithUserEmail
};


console.log('RUN');
findSheetIncludingRowsSortedFinal('MTYwMzc3MDA5NDY1MS10ZXN0NA')
.then(e => console.log(e))
.catch(e => console.log(e));

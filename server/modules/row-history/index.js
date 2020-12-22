const express = require('express');
const schema = require('./schema');
const model = require('./model');
const { HTTP } = require('../errors');
const { toObjectId } = require('../utils');
const HISTORY_LIMIT = 10;


const findHistoriesForSheet = async (req, res, next) => {
   try {
      let { sheetId: qSheetId } = req.params;

      let sheetId = toObjectId(qSheetId);

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
      let { sheetId: qSheetId, rowId: qRowId } = req.params;

      let sheetId = toObjectId(qSheetId);
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
      let data = req.body;

      if (!(data instanceof Array)) throw new HTTP(400, 'Body data must be array info of cell history!');

      let history = await model.create(data);

      return res.json(history);

   } catch (error) {
      next(error);
   };
};


module.exports = {
   schema,
   model,
   findHistoriesForSheet,
   findHistoryForOneRow,
   saveRowHistory
};
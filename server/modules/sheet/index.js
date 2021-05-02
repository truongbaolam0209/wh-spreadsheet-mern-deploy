const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');
const { toObjectId, mongoObjectId, generateEmailInnerHTMLBackend, getInfoValueFromRfaData, validateEmailInput } = require('../utils');
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
         Object.keys(data).forEach(key => {
            const headerFound = sheetHeaders.find(hd => hd.key === key);
            if (headerFound) {
               rowFormal[headerFound.text] = data[key];
            } else if (!headerFound && (key === 'rfaNumber' || key.includes('reply-$$$-') || key.includes('submission-$$$-'))) {
               rowFormal[key] = data[key];
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



const findManyRowsToSendEmail = async (sheetId, qRowIds, company, type, listUser, listGroup, emailSender, projectName) => {

   let rowIds = qRowIds.map(toObjectId);

   if (!sheetId) return 'ERROR - sheetId';
   if (!rowIds) return 'ERROR - rowIds';
   if (!company) return 'ERROR - company';
   if (!type) return 'ERROR - Missing type';
   if (!listUser) return 'ERROR - Missing listUser';
   if (!listGroup) return 'ERROR - Missing listGroup';
   if (!emailSender) return 'ERROR - Missing emailSender';
   if (!projectName) return 'ERROR - Missing projectName';


   let [rows, rowHistories, publicSettings] = await Promise.all([
      rowModel.find({ sheet: sheetId, _id: { $in: rowIds } }),
      rowHistoryModel.find({ sheet: sheetId, _id: { $in: rowIds } }),
      findPublicSettings(sheetId)
   ]);
   const { headers } = publicSettings;
   const rowsOutput = [...rows, ...rowHistories];
   const outputRowsAll = rowsOutput.map(r => {
      let output, rowData;
      if (r.row) {
         output = {
            id: r._id,
            row: r.row
         };
         rowData = r.history;
      } else {
         output = {
            id: r._id,
            _rowLevel: r.level,
            _parentRow: r.parentRow,
            _preRow: r.preRow
         };
         rowData = r.data;
      };

      for (const key in rowData) {
         if (key === 'rfaNumber' || key.includes('reply-$$$-') || key.includes('submission-$$$-')) {
            output[key] = rowData[key];
         } else {
            const headerFound = headers.find(x => x.key === key);
            if (headerFound) {
               output[headerFound.text] = rowData[key];
            };
         };
      };
      return output;
   });

   const dwgsToAddNewRFAGetDrawingURL = await getDrawingURLFromDB(outputRowsAll, type);

   const emailContent = generateEmailInnerHTMLBackend(company, type, dwgsToAddNewRFAGetDrawingURL);

   const oneRowData = outputRowsAll[0];

   const emailListTo = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailTo', company);
   const emailListCc = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailCc', company);
   const emailTitle = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailTitle', company);
   const rfa = oneRowData['RFA Ref'];

   const recipient = {
      to: emailListTo,
      cc: emailListCc
   };

   let listUserOutput = {};
   let listGroupOutput = {};
   const listGroupLowercase = listGroup.map(x => x.toLowerCase());

   Object.keys(recipient).forEach(key => {
      recipient[key].forEach(item => {
         if (listUser.indexOf(item) !== -1) {
            listUserOutput[key] = [...listUserOutput[key] || [], item];
         } else if (listGroupLowercase.indexOf(item.toLowerCase()) !== -1) {
            listGroupOutput[key] = [...listGroupOutput[key] || [], item];
         } else if (validateEmailInput(item)) {
            listUserOutput[key] = [...listUserOutput[key] || [], item];
         };
      });
   });
   listUserOutput.cc = [...listUserOutput.cc || [], emailSender];

   return {
      emailContent,
      listUserOutput,
      listGroupOutput,
      emailTitle: `${projectName}-${rfa}-${emailTitle}`
   };
};


const getDrawingURLFromDB = async (dwgsNewRFA, type) => {
   try {
      return await Promise.all(dwgsNewRFA.map(async dwg => {
         const typeApi = type === 'submit' ? 'submission' : type === 'reply' ? 'reply' : '';
         const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwg[`${typeApi}-$$$-drawing-${company}`], expire: 3600 * 24 * 7 } });
         dwg[`${typeApi}-$$$-drawing-${company}`] = res.data;
         return dwg;
      }));
   } catch (err) {
      console.log(err);
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
   findManyRowsToSendEmail,

   saveAllDataSettingsToServer,
   saveAllDataRowsToServer,

};







const schema = require('./schema');
const model = require('./model');
const { genCRUDHandlers } = require('../crud');
const {
   toObjectId, mongoObjectId, generateEmailInnerHTMLBackend,
   generateEmailMultiFormInnerHtml, getInfoValueFromRfaData, validateEmailInput,
   getInfoValueFromRefDataForm, getInfoKeyFromRefDataForm
} = require('../utils');
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

const rowModelDataEntry = require('../row-data-entry/model');
const settingsModelDataEntry = require('../settings-data-entry/model');
const rowModelRfam = require('../row-rfam/model');
const rowModelRfi = require('../row-rfi/model');
const rowModelCvi = require('../row-cvi/model');
const rowModelDt = require('../row-dt/model');
const rowModelMm = require('../row-mm/model');

const getFileNameFromLinkResponse = (link) => /[^/]*$/.exec(link)[0];

const { createPublicUrl } = require('../../../service/s3');

const handlers = genCRUDHandlers(model, {
   genQueryToFindMany
});

function genQueryToFindMany() {
   return {
      query: {},
      populate: 'createdBy'
   };
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

      let result = await _update_Or_Create_Rows(rows, sheetId, rowModel);
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


   for (let row of dataRows) {
      if (row.level == 1) rows.push(row);
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

const _update_Or_Create_Rows = async (rowsData, sheetId, rowModel) => {

   let { rowsToUpdate, rowsToCreate } = await _process_Rows_Data(rowsData, sheetId, rowModel);
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

const _process_Rows_Data = async (rowsData, sheetId, rowModel) => {

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
            } else if (!headerFound && (
               key === 'rfaNumber' ||
               key.includes('reply-$$$-') ||
               key.includes('submission-$$$-')
            )) {
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
         let [rows, cellHistories, rowHistories, settings, rowsDataEntry, settingsDataEntry, rowsRfam, rowsRfi, rowsCvi, rowsDt, rowsMm] = await Promise.all([
            rowModel.find({}),
            cellHistoryModel.find({}),
            rowHistoryModel.find({}),
            settingsModel.find({}),

            rowModelDataEntry.find({}),
            settingsModelDataEntry.find({}),
            rowModelRfam.find({}),
            rowModelRfi.find({}),
            rowModelCvi.find({}),
            rowModelDt.find({}),
            rowModelMm.find({}),

         ]);
         return res.json({ rows, cellHistories, rowHistories, settings, rowsDataEntry, settingsDataEntry, rowsRfam, rowsRfi, rowsCvi, rowsDt, rowsMm });
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





const findManyRowsToSendEmail = async (sheetId, qRowIds, company, type, emailSender, projectName, formSubmitType) => {

   let rowIds = qRowIds.map(toObjectId);
   if (!sheetId) return 'ERROR - sheetId';
   if (!rowIds) return 'ERROR - rowIds';
   if (!company) return 'ERROR - company';
   if (!type) return 'ERROR - Missing type';
   if (!emailSender) return 'ERROR - Missing emailSender';
   if (!projectName) return 'ERROR - Missing projectName';
   if (!formSubmitType) return 'ERROR - Missing formSubmitType';


   if (formSubmitType === 'rfa') {

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
            output = { id: r._id, row: r.row };
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

      const dwgsToAddNewRFAGetDrawingURL = await getDrawingURLFromDB(outputRowsAll, company, type);
      const emailContent = generateEmailInnerHTMLBackend(company, type, dwgsToAddNewRFAGetDrawingURL);

      const oneRowData = outputRowsAll[0];

      const emailListTo = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailTo', company);
      const emailListCc = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailCc', company);
      const emailTitleText = getInfoValueFromRfaData(oneRowData, type === 'submit' ? 'submission' : 'reply', 'emailTitle', company);
      const rfa = oneRowData['RFA Ref'];

      let listUserOutput = {};
      let listGroupOutput = {};

      emailListTo.forEach(item => {
         if (validateEmailInput(item)) {
            listUserOutput.to = [...listUserOutput.to || [], item];
         } else {
            listGroupOutput.to = [...listGroupOutput.to || [], item];
         };
      });

      emailListCc.forEach(item => {
         if (validateEmailInput(item)) {
            listUserOutput.cc = [...listUserOutput.cc || [], item];
         } else {
            listGroupOutput.cc = [...listGroupOutput.cc || [], item];
         };
      });
      listUserOutput.cc = [...listUserOutput.cc || [], emailSender];


      const emailTitle = `
         <p style='font-size: 20px; font-weight: bold;'>${projectName} - ${rfa}</p>
         <p style='font-size: 17px; font-weight: bold;'>${emailTitleText}</p>
      `;


      return {
         emailContent,
         listUserOutput,
         listGroupOutput,
         emailTitle,
         emailSubject: `${projectName} - ${rfa} - ${emailTitleText}`
      };

   } else {
      const rowModelMulti = formSubmitType === 'rfam' ? rowModelRfam
         : formSubmitType === 'rfi' ? rowModelRfi
            : formSubmitType === 'cvi' ? rowModelCvi
               : formSubmitType === 'dt' ? rowModelDt
                  : formSubmitType === 'mm' ? rowModelMm
                     : null;


      let rowsFound = await rowModelMulti.find({ sheet: sheetId, _id: { $in: rowIds } });

      const outputRowsAll = rowsFound.map(r => {
         let output = {
            id: r._id,
            trade: r.trade,
            revision: r.revision,
            [`${formSubmitType}Ref`]: r[`${formSubmitType}Ref`]
         };
         const rowData = r.data;
         for (const key in rowData) {
            output[key] = rowData[key];
         };
         return output;
      });


      const rowData = outputRowsAll[0];

      const refNumber = rowData.revision === '0' ? rowData[`${formSubmitType}Ref`] : rowData[`${formSubmitType}Ref`] + rowData.revision;;
      const emailTitleText = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'emailTitle', company);


      const emailSignaturedBy = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'signaturedBy', company);


      let listUserOutput = { to: [], cc: [] };
      let listGroupOutput = { to: [], cc: [] };

      if (type === 'submit-request-signature') {

         const resFormNoSignature = await createPublicUrl(getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkFormNoSignature', company), 3600 * 24 * 7);
         const keyFormNoSignature = getInfoKeyFromRefDataForm(rowData, 'submission', formSubmitType, 'linkFormNoSignature', company);
         rowData[keyFormNoSignature] = resFormNoSignature;

         listUserOutput.to = emailSignaturedBy;
         listUserOutput.cc = emailSender;

      } else if (type === 'submit-signed-off-final') {

         const resFormSignedOff = await createPublicUrl(getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkSignedOffFormSubmit', company), 3600 * 24 * 7);
         const keyFormSignedOff = getInfoKeyFromRefDataForm(rowData, 'submission', formSubmitType, 'linkSignedOffFormSubmit', company);
         rowData[keyFormSignedOff] = resFormSignedOff;

         const linkDrawingsArr = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkDrawings', company) || [];
         const linkDrawingsRfaArr = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'linkDrawingsRfa', company) || [];

         const arrayDrawingsAttached = [...linkDrawingsArr, ...linkDrawingsRfaArr];

         if (arrayDrawingsAttached && arrayDrawingsAttached.length > 0) {

            const arrayDrawingsLinkPublic = await getDrawingUrlMultiForm(arrayDrawingsAttached);

            const keyDrawingsAttached = getInfoKeyFromRefDataForm(rowData, 'submission', formSubmitType, 'linkDrawings', company);
            rowData[keyDrawingsAttached] = arrayDrawingsLinkPublic;
         };

         const emailListTo = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'emailTo', company);
         const emailListCc = getInfoValueFromRefDataForm(rowData, 'submission', formSubmitType, 'emailCc', company);


         emailListTo.forEach(item => {
            if (validateEmailInput(item)) {
               listUserOutput.to = [...new Set([...listUserOutput.to || [], item])];
            } else {
               listGroupOutput.to = [...new Set([...listGroupOutput.to || [], item])];
            };
         });

         emailListCc.forEach(item => {
            if (validateEmailInput(item)) {
               listUserOutput.cc = [...new Set([...listUserOutput.cc || [], item])];
            } else {
               listGroupOutput.cc = [...new Set([...listGroupOutput.cc || [], item])];
            };
         });
         listUserOutput.cc = [...new Set([...listUserOutput.cc || [], emailSender, emailSignaturedBy])];

      } else if (type === 'reply-signed-off') {

         const linkFormReplyArray = getInfoValueFromRefDataForm(rowData, 'reply', formSubmitType, 'linkFormReply', company) || [];
         const arrayDrawingsLinkPublic = await getDrawingUrlMultiForm(linkFormReplyArray);

         const keyFormSignedOff = getInfoKeyFromRefDataForm(rowData, 'reply', formSubmitType, 'linkFormReply', company);
         rowData[keyFormSignedOff] = arrayDrawingsLinkPublic;

         const emailListTo = getInfoValueFromRefDataForm(rowData, 'reply', formSubmitType, 'emailTo', company);
         const emailListCc = getInfoValueFromRefDataForm(rowData, 'reply', formSubmitType, 'emailCc', company);

         emailListTo.forEach(item => {
            if (validateEmailInput(item)) {
               listUserOutput.to = [...new Set([...listUserOutput.to || [], item])];
            } else {
               listGroupOutput.to = [...new Set([...listGroupOutput.to || [], item])];
            };
         });

         emailListCc.forEach(item => {
            if (validateEmailInput(item)) {
               listUserOutput.cc = [...new Set([...listUserOutput.cc || [], item])];
            } else {
               listGroupOutput.cc = [...new Set([...listGroupOutput.cc || [], item])];
            };
         });
         listUserOutput.cc = [...new Set([...listUserOutput.cc || [], emailSender])];
      };

      const emailContent = generateEmailMultiFormInnerHtml(company, formSubmitType, rowData, type);

      const emailTitle = `
         <p style='font-size: 20px; font-weight: bold;'>${projectName} - ${refNumber}</p>
         <p style='font-size: 17px; font-weight: bold;'>${emailTitleText}</p>
      `;

      return {
         emailContent,
         listUserOutput,
         listGroupOutput,
         emailTitle,
         emailSubject: `${projectName} - ${refNumber} - ${emailTitleText}`
      };
   };
};
const getDrawingURLFromDB = async (dwgsNewRFA, company, type) => {
   try {
      return await Promise.all(dwgsNewRFA.map(async dwg => {
         const typeApi = type === 'submit' ? 'submission' : type === 'reply' ? 'reply' : '';
         const res = await createPublicUrl(dwg[`${typeApi}-$$$-drawing-${company}`], 3600 * 24 * 7)
         dwg[`${typeApi}-$$$-drawing-${company}`] = res;
         return dwg;
      }));
   } catch (err) {
      console.log(err);
   };
};
const getDrawingUrlMultiForm = async (arrayLinks) => {
   try {
      return await Promise.all(arrayLinks.map(async link => {
         const res = await createPublicUrl(link, 3600 * 24 * 7);
         return {
            fileName: getFileNameFromLinkResponse(link),
            fileLink: res
         };
      }));
   } catch (err) {
      console.log(err);
   };
};


const functionRfaTestEmailHtml = async (req, res, next) => {
   try {

      const { projectId, rowIds, company, type, emailSender, projectName, formSubmitType } = req.body.data;
      const emailText = await findManyRowsToSendEmail(projectId, rowIds, company, type, emailSender, projectName, formSubmitType);
      return res.json(emailText);

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

   findManyRowsToSendEmail,

   functionRfaTestEmailHtml,

   saveAllDataSettingsToServer,
   saveAllDataRowsToServer,


   _update_Or_Create_Rows,
   _process_Rows
};







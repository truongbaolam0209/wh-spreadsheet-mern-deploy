
const schema = require('./schema');
const model = require('../row-cvi/model');
const { HTTP } = require('../errors');
const { _update_Or_Create_Rows, findManyRowsToSendEmail } = require('../sheet');



const updateOrCreateRowsCvi = async (req, res, next) => {

   try {
      const { projectId: sheetId, rows } = req.body;
      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');


      let result = await _update_Or_Create_Rows(rows, sheetId, model);
      
      return res.json(result);

   } catch (err) {
      next(err);
   };
};


const findRowsCviForSheet = async (req, res, next) => {
   try {
      
      const { projectId: sheetId } = req.query;
      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');

      let data = await model.find({ sheet: sheetId })
         .sort([['row', 1]])
         .exec();

      const output = data.map(row => {
         let obj = {
            id: row._id,
            cviRef: row.cviRef,
            revision: row.revision,
            trade: row.trade
         };
         if (row.data) {
            obj = { ...obj, ...row.data };
         };
         return obj;
      });
      return res.json(output);

   } catch (error) {
      next(error);
   };
};

const functionTestEmailHtml = async (req, res, next) => {
   try {
      
      const { projectId, rowIds, company, type, emailSender, projectName, formSubmitType } = req.body.data;
      const emailText = await findManyRowsToSendEmail(projectId, rowIds, company, type, emailSender, projectName, formSubmitType);
      return res.json(emailText);

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

   updateOrCreateRowsCvi,
   findRowsCviForSheet,
   functionTestEmailHtml,

   saveAllDataToServer,
   deleteAllDataInThisCollection
};
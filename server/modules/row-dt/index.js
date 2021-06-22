
const schema = require('./schema');
const model = require('../row-dt/model');
const { HTTP } = require('../errors');
const { _update_Or_Create_Rows } = require('../sheet');



const updateOrCreateRowsDt = async (req, res, next) => {

   try {
      const { projectId: sheetId, rows } = req.body;

      if (!sheetId) throw new HTTP(400, 'Invalid sheet id!');

      let result = await _update_Or_Create_Rows(rows, sheetId, model);
      
      return res.json(result);

   } catch (err) {
      next(err);
   };
};


const findRowsDtForSheet = async (req, res, next) => {
   try {
      
      const { projectId: sheetId } = req.query;
      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');

      let data = await model.find({ sheet: sheetId })
         .sort([['row', 1]])
         .exec();


      const output = data.map(row => {
         let obj = {
            id: row._id,
            dtRef: row.dtRef,
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





module.exports = {
   schema,
   model,

   updateOrCreateRowsDt,
   findRowsDtForSheet
};
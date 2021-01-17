const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { HTTP } = require('../errors');


function toObjectId(idStr, defaultValue) {
   try {
      if (!idStr) throw new Error('Empty id!');

      return ObjectId(idStr);

   } catch (err) {
      if (defaultValue === undefined) {
         throw new HTTP(400, 'Invalid id!');
      } else {
         return defaultValue;
      };
   };
};

function filterObject(src, ...fields) {
   let result = {};
   if (src instanceof Object) {
      for (let field in src) {
         if (fields.includes(field)) {
            result[field] = src[field]
         };
      };
   };
   return result;
};

function mongoObjectId() {
   var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
   return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
       return (Math.random() * 16 | 0).toString(16);
   }).toLowerCase();
};

const extractCellInfo = (key) => {
   return {
       rowId: key.slice(0, 24),
       headerName: key.slice(25, key.length)
   }
};
const getHeaderKey = (headers, headerText) => {
   if (!headers) return;
   return headers.find(hd => hd.text === headerText).key;
};
const convertCellTempToHistory = (
   cellsModifiedTemp,
   stateProject
) => {
   const { email, publicSettings } = stateProject.allDataOneSheet;
   const cellsHistoryData = Object.keys(cellsModifiedTemp).map(key => {
       const { rowId, headerName } = extractCellInfo(key);
       const dataOut = {
           rowId,
           headerKey: getHeaderKey(publicSettings.headers, headerName),
           history: {
               text: cellsModifiedTemp[key],
               email,
               createdAt: new Date(),
           }
       };
       return dataOut;
   });
   return cellsHistoryData;
};
const convertDrawingVersionToHistory = (
   rowsHistory,
   stateProject
) => {
   const { publicSettings } = stateProject.allDataOneSheet;

   const rowsHistoryOutput = rowsHistory.map(rowsH => {
       let obj = {};
       publicSettings.headers.forEach(hd => {
           if (rowsH[hd.text]) obj = { ...obj || {}, [hd.key]: rowsH[hd.text] };
       });
       return {
           row: rowsH.id,
           history: obj,
       };
   });
   return rowsHistoryOutput;
};


module.exports = {
   toObjectId,
   filterObject,
   mongoObjectId,

   convertCellTempToHistory,
   convertDrawingVersionToHistory,
   extractCellInfo
};

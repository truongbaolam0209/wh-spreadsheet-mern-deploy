const uuidv1 = require('uuid').v1;
const { mongoObjectId } = require('../utils');


const SHEET_PUBLIC_FIELDS_MAP = {
   drawingTypeTree: {
      type: Array,
      default: undefined
   },
   activityRecorded: {
      type: Array,
      default: undefined
   },
   projectName: String,
};
const SHEET_PUBLIC_FIELDS = Object.keys(SHEET_PUBLIC_FIELDS_MAP);


const createTemplatePublicSettings = (sheetId) => {
   return {
      sheet: sheetId,
      drawingTypeTree: [],
      activityRecorded: []
   };
};

const SHEET_USER_FIELDS_MAP = {
   user: String,
   headersShown: {
      type: Array,
      default: undefined, // prevent mongoose create empty array
   },
   headersHidden: {
      type: Array,
      default: undefined, // prevent mongoose create empty array
   },
   viewTemplates: {
      type: Array,
      default: undefined, // prevent mongoose create empty array
   },
   nosColumnFixed: Number,
   colorization: Object,
   role: String,
   viewTemplateNodeId: String,
   modeFilter: {
      type: Array,
      // default: undefined, // prevent mongoose create empty array
   },
   modeSort: {
      type: Object,
      // default: undefined, // prevent mongoose create empty array
   },
};

const SHEET_USER_FIELDS = Object.keys(SHEET_USER_FIELDS_MAP);



module.exports = {
   SHEET_PUBLIC_FIELDS_MAP,
   SHEET_PUBLIC_FIELDS,
   createTemplatePublicSettings,
   SHEET_USER_FIELDS_MAP,
   SHEET_USER_FIELDS,
};

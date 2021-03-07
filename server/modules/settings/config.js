const uuidv1 = require('uuid').v1;

const SHEET_PUBLIC_FIELDS_MAP = {
   headers: {
      type: Array,
      default: undefined, // prevent mongoose create empty array
   },
   drawingTypeTree: {
      type: Array,
      default: undefined
   },
   activityRecorded: {
      type: Array,
      default: undefined
   },
   sheetSettings: Object,
   colSettings: Object,
   cellSettings: Object,
   rowSettings: Object,
   cellEditRestriction: Object,
   projectName: String,
};
const SHEET_PUBLIC_FIELDS = Object.keys(SHEET_PUBLIC_FIELDS_MAP);


const createTemplatePublicSettings = (sheetId) => {
   return {
      sheet: sheetId,
      headers: [
         {
            key: uuidv1(),
            text: 'Drawing Number',
         },
         {
            key: uuidv1(),
            text: 'Drawing Name',
         },
         {
            key: uuidv1(),
            text: 'RFA Ref',
         },
         {
            key: uuidv1(),
            text: 'Block/Zone',
         },
         {
            key: uuidv1(),
            text: 'Level',
         },
         {
            key: uuidv1(),
            text: 'Unit/CJ',
         },
         {
            key: uuidv1(),
            text: 'Drg Type',
         },
         {
            key: uuidv1(),
            text: 'Use For',
         },
         {
            key: uuidv1(),
            text: 'Coordinator In Charge',
         },
         {
            key: uuidv1(),
            text: 'Modeller',
         },
         {
            key: uuidv1(),
            text: 'Model Start (T)',
         },
         {
            key: uuidv1(),
            text: 'Model Start (A)',
         },
         {
            key: uuidv1(),
            text: 'Model Finish (T)',
         },
         {
            key: uuidv1(),
            text: 'Model Finish (A)',
         },
         {
            key: uuidv1(),
            text: 'Model Progress',
         },
         {
            key: uuidv1(),
            text: 'Drawing Start (T)',
         },
         {
            key: uuidv1(),
            text: 'Drawing Start (A)',
         },
         {
            key: uuidv1(),
            text: 'Drawing Finish (T)',
         },
         {
            key: uuidv1(),
            text: 'Drawing Finish (A)',
         },
         {
            key: uuidv1(),
            text: 'Drawing Progress',
         },
         {
            key: uuidv1(),
            text: 'Drg To Consultant (T)',
         },
         {
            key: uuidv1(),
            text: 'Drg To Consultant (A)',
         },
         {
            key: uuidv1(),
            text: 'Consultant Reply (T)',
         },
         {
            key: uuidv1(),
            text: 'Consultant Reply (A)',
         },
         {
            key: uuidv1(),
            text: 'Get Approval (T)',
         },
         {
            key: uuidv1(),
            text: 'Get Approval (A)',
         },
         {
            key: uuidv1(),
            text: 'Construction Issuance Date',
         },
         {
            key: uuidv1(),
            text: 'Construction Start',
         },
         {
            key: uuidv1(),
            text: 'Rev',
         },
         {
            key: uuidv1(),
            text: 'Status',
         },
         {
            key: uuidv1(),
            text: 'Remark',
         },
         {
            key: uuidv1(),
            text: 'Drawing',
         },
      ],
      drawingTypeTree: [],
      sheetSettings: {},
      rowSettings: {},
      colSettings: {},
      cellSettings: {},
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
      // default: undefined,
   },
   modeSort: {
      type: Object,
      // default: undefined,
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

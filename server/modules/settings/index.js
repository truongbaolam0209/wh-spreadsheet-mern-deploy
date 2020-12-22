const schema = require('./schema');
const model = require('./model');
const { toObjectId, filterObject } = require('../utils');

const {
   SHEET_PUBLIC_FIELDS,
   createTemplatePublicSettings,
   SHEET_USER_FIELDS,
   createTemplateUserSettings
} = require('./config');


const findPublicSettings = async (sheetId) => {

   let setting = await model.findOne({ sheet: sheetId });

   if (!setting) {
      setting = await createPublicSettings(sheetId);
   };

   return setting;
};

const createPublicSettings = async (sheetId) => {
   let temp = createTemplatePublicSettings(sheetId);
   return model.create(temp);
};

const findUserSettings = async (sheetId, userId) => {
   let setting = await model.findOne({ sheet: sheetId, user: userId });

   if (!setting) {
      setting = await createUserSettings(sheetId, userId);
   };
   return setting;
};

const createUserSettings = async (sheetId, userId) => {
   let temp = createTemplateUserSettings(sheetId, userId);
   return model.create(temp);
};








// const findPublicSettings = async (sheetId) => {
//   sheetId = toObjectId(sheetId, null)
//   if(!sheetId) throw new Error('Invalid sheet id to find public settings!')
//   let setting = await model.findOne({ sheet: sheetId })

//   if(!setting) {
//     setting = await createPublicSettings(sheetId)
//   }

//   return setting;
// }

// const findUserSettings = async (sheetId, userId) => {
//   sheetId = toObjectId(sheetId, null)
//   if(!sheetId) throw new Error('Invalid sheet id to find user setings!');

//   userId = toObjectId(userId, null);
//   if(!userId) throw new Error('Invalid user id to find user settings!');

//   let setting = await model.findOne({ sheet: sheetId, user: userId });

//   if(!setting) {
//     setting = await createUserSettings(sheetId, userId);
//   };

//   return setting;
// };
// const createUserSettings = async (sheetId, userId) => {
//   let temp = createTemplateUserSettings(sheetId, userId);
//   return model.create(temp);
// };
// const createPublicSettings = async (sheetId) => {
//   let temp = createTemplatePublicSettings(sheetId);
//   return model.create(temp);
// };






const updatePublicSettings = async (sheetId, settingData = {}) => {

   sheetId = toObjectId(sheetId, null);

   if (!sheetId) throw new Error('Invalid sheet id to update settings!');

   let setting = await findPublicSettings(sheetId);
   let data = filterDataToUpdatePublicSettings(settingData);

   await setting.update(data);

   return setting;
};



const filterDataToUpdatePublicSettings = (settingData) => {
   let data = filterObject(settingData, ...SHEET_PUBLIC_FIELDS);
   for (let key in data) {
      let value = data[key];
      if (!(value instanceof Object)) {
         delete data[key];
      };
   };
   return data;
};





const updateUserSettings = async (sheetId, userId, settingData = {}) => {

   sheetId = toObjectId(sheetId, null);
   if (!sheetId) throw new Error('Invalid sheet id to update settings!');

   userId = toObjectId(userId, null);
   if (!userId) throw new Error('Invalid user id to update settings!');

   let setting = await findUserSettings(sheetId, userId);
   let data = filterDataToUpdateUserSettings(settingData);

   await setting.update(data);

   return setting;
};


const filterDataToUpdateUserSettings = (settingData) => {
   let data = filterObject(settingData, ...SHEET_USER_FIELDS);
   for (let key in data) {
      let value = data[key];
      if (!(value instanceof Object)) {
         delete data[key];
      };
   };
   return data;
};

module.exports = {
   schema,
   model,
   findPublicSettings,
   createPublicSettings,
   updatePublicSettings,

   findUserSettings,
   createUserSettings,
   updateUserSettings
};

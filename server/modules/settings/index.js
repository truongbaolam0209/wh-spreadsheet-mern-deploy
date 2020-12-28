const schema = require('./schema');
const model = require('./model');
const { toObjectId, filterObject } = require('../utils');

const {
   SHEET_PUBLIC_FIELDS,
   createTemplatePublicSettings,
   SHEET_USER_FIELDS,
} = require('./config');



const findPublicSettings = async (sheetId) => {
   let setting = await model.findOne({ sheet: sheetId, user: null });
   if (!setting) setting = await createPublicSettings(sheetId);

   return setting;
};
const createPublicSettings = async (sheetId) => {
   let temp = createTemplatePublicSettings(sheetId);
   return model.create(temp);
};
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





const findUserSettings = async (sheetId, userId) => {
   let setting = await model.findOne({ sheet: sheetId, user: userId });

   return setting;
};
const createUserSettings = async (req, res, next) => {
   try {
      let { sheetId, userId } = req.params;


      if (!sheetId) throw new HTTP(400, 'Missing sheet id!');
      if (!userId) throw new HTTP(400, 'Missing row id!');

      let setting = model.create({
         sheet: sheetId,
         user: userId,
         ...req.body
      });
      return res.json(setting);
   } catch (error) {
      next(error);
   };
};
const updateUserSettings = async (sheetId, userId, settingData = {}) => {

   if (!sheetId) throw new Error('Invalid sheet id to update settings!');
   if (!userId) throw new Error('Invalid user id to update settings!');
   
   let setting = await findUserSettings(sheetId, userId);

   if (setting) {
      let data = filterObject(settingData, ...SHEET_USER_FIELDS);
      await setting.updateOne(data);

   } else {
      setting = await model.create({
         sheet: sheetId,
         user: userId,
         ...settingData
      });
   };
   return setting;
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

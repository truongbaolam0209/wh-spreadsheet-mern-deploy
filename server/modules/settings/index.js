const schema = require('./schema');
const model = require('./model');
const { filterObject } = require('../utils');

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

const updatePublicSettings = async (sheetId, userId, settingData = {}) => {

   if (!sheetId) throw new Error('Invalid sheet id to update settings!');
   if (!userId) throw new Error('Invalid user id to update settings!');

   let setting = await findPublicSettings(sheetId);

   if (setting) {
      let data = filterObject(settingData, ...SHEET_PUBLIC_FIELDS);
      await setting.updateOne(data);
   };
   return setting;
};

const findUserSettings = async (sheetId, userId) => {
   let setting = await model.findOne({ sheet: sheetId, user: userId });
   return setting;
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

const deleteAllDataInCollection = async (req, res, next) => {
   try {
     let result = await model.deleteMany({});
     return res.json(result);
   } catch(err) {
     next(err);
   };
};



const findAllSettingsInCollection = async (req, res, next) => {
   try {
      let items = await model.find();
      return res.json(items);

   } catch (error) {
      next(error);
   };
};

const findAllSettingsThisProject = async (req, res, next) => {

   try {
      const { projectId: sheetId } = req.query;
      let items = await model.find({
         sheet: sheetId,
      });
      return res.json(items);

   } catch (error) {
      next(error);
   };
};

module.exports = {
   schema,
   model,

   findPublicSettings,
   createPublicSettings,
   updatePublicSettings,

   findUserSettings,
   updateUserSettings,
   deleteAllDataInCollection,
   findAllSettingsInCollection,
   findAllSettingsThisProject
};


const express = require('express');
const Router = express.Router;
const router = new Router();

const SettingsDataEntry = require('../modules/settings-data-entry');
const { validateToken } = require('../../custom/validate');


router.post('/update-setting-public/', validateToken, SettingsDataEntry.updateSettingPublic);



module.exports = router;
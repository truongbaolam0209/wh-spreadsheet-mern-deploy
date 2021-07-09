
const express = require('express');
const Router = express.Router;
const router = new Router();

const SettingsDataEntry = require('../modules/settings-data-entry');
const { validateToken } = require('../../service/validate');

router.post('/save-all-data-to-server', validateToken, SettingsDataEntry.saveAllDataToServer);
router.post('/delete-all/', validateToken, SettingsDataEntry.deleteAllDataInThisCollection);



router.post('/update-setting-public/', validateToken, SettingsDataEntry.updateSettingPublic);



module.exports = router;
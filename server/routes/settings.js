const express = require('express');
const Router = express.Router;
const router = new Router();
const Settings = require('../modules/settings');
const { validateToken } = require('../../service/validate');

router.post('/delete-all', validateToken, Settings.deleteAllDataInCollection);

router.get('/get-all-settings-collection', validateToken, Settings.findAllSettingsInCollection);

router.get('/get-all-settings-this-project', validateToken, Settings.findAllSettingsThisProject);


module.exports = router;
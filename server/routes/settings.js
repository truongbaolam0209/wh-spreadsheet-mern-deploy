const express = require('express');
const Router = express.Router;
const router = new Router();
const Settings = require('../modules/settings');


router.post('/:sheetId/:userId', validateToken, Settings.createUserSettings);

router.delete('/delete-all', validateToken, Settings.deleteAllDataInCollection);

module.exports = router;
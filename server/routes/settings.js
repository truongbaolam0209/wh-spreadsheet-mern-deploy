const express = require('express');
const Router = express.Router;
const router = new Router();
const Settings = require('../modules/settings');


router.post('/:sheetId/:userId', Settings.createUserSettings);

router.delete('/delete-all', Settings.deleteAllDataInCollection);

module.exports = router;
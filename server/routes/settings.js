const express = require('express');
const Router = express.Router;
const router = new Router();
const Settings = require('../modules/settings');


router.post('/delete-all', Settings.deleteAllDataInCollection);


module.exports = router;
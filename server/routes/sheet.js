const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');


router.get('/:id', validateToken, Sheet.findOneWithUserEmail);
router.post('/update-rows/:id', validateToken, Sheet.updateOrCreateRows);
router.post('/update-setting-public/:id', validateToken, Sheet.updateSettingPublic);
router.post('/update-setting-user/:id', validateToken, Sheet.updateSettingUser);

router.delete('/delete-rows/:id', validateToken, Sheet.deleteRows);

router.delete('/delete-rows-project/:id', validateToken, Sheet.deleteAllRowsInOneProject);
router.delete('/delete-all', validateToken, Sheet.deleteAllDataInCollection);

module.exports = router;

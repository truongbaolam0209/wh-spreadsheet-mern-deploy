const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');




router.get('/', validateToken, Sheet.findOneWithUserEmail);

router.post('/update-rows/', validateToken, Sheet.updateOrCreateRows);

router.post('/delete-rows/', validateToken, Sheet.deleteRows);

router.post('/delete-all/', validateToken, Sheet.deleteAllDataInCollection);

router.post('/update-setting-public/', validateToken, Sheet.updateSettingPublic);

router.post('/update-setting-user/', validateToken, Sheet.updateSettingUser);

router.post('/delete-rows-project/', validateToken, Sheet.deleteAllRowsInOneProject);

router.post('/find-many/', validateToken, Sheet.findMany);








module.exports = router;

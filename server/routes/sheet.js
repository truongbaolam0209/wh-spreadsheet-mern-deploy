const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');



router.post('/save-all-data-settings', Sheet.saveAllDataSettingsToServer);
router.post('/save-all-data-rows', Sheet.saveAllDataRowsToServer);


router.get('/', Sheet.findOneWithUserEmail);

router.get('/get-all-collections', Sheet.getAllCollections);

router.post('/update-rows/', Sheet.updateOrCreateRows);

router.post('/delete-rows/', Sheet.deleteRows);

router.post('/delete-all/', Sheet.deleteAllDataInCollection);

router.post('/update-setting-public/', Sheet.updateSettingPublic);

router.post('/update-setting-user/', Sheet.updateSettingUser);

router.post('/delete-rows-project/', Sheet.deleteAllRowsInOneProject);

router.post('/find-many/', Sheet.findMany);










module.exports = router;

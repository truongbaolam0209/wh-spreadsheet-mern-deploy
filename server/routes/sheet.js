const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');



router.get('/:id', Sheet.findOneWithUserEmail);

router.post('/find-many', Sheet.findMany);


router.post('/update-rows/:id', Sheet.updateOrCreateRows);
router.post('/update-setting-public/:id', Sheet.updateSettingPublic);
router.post('/update-setting-user/:id', Sheet.updateSettingUser);

router.post('/delete-rows/:id', Sheet.deleteRows);

router.delete('/delete-rows-project/:id', Sheet.deleteAllRowsInOneProject);
router.delete('/delete-all', Sheet.deleteAllDataInCollection);

module.exports = router;

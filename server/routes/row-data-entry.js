



const express = require('express');
const Router = express.Router;
const router = new Router();

const RowDataEntry = require('../modules/row-data-entry');
const { validateToken } = require('../../service/validate');


router.post('/save-all-data-to-server', validateToken, RowDataEntry.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowDataEntry.deleteAllDataInThisCollection);



router.post('/get-row/', validateToken, RowDataEntry.findOneWithUserEmail);

router.post('/save-rows-data-entry/', validateToken, RowDataEntry.updateOrCreateRowsDataEntry);

router.post('/delete-rows/', validateToken, RowDataEntry.deleteRows);


module.exports = router;
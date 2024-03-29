const express = require('express');
const Router = express.Router;
const router = new Router();

const RowCvi = require('../modules/row-cvi');
const { validateToken } = require('../../service/validate');

router.post('/save-all-data-to-server', validateToken, RowCvi.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowCvi.deleteAllDataInThisCollection);




router.post('/save-rows-cvi/', validateToken, RowCvi.updateOrCreateRowsCvi);
router.get('/', validateToken, RowCvi.findRowsCviForSheet);


router.post('/mail-test/', validateToken, RowCvi.functionTestEmailHtml);

module.exports = router;
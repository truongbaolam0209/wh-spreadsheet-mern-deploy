const express = require('express');
const Router = express.Router;
const router = new Router();

const RowMm = require('../modules/row-mm');
const { validateToken } = require('../../service/validate');


router.post('/save-all-data-to-server', validateToken, RowMm.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowMm.deleteAllDataInThisCollection);



router.post('/save-rows-mm/', validateToken, RowMm.updateOrCreateRowsMm);
router.get('/', validateToken, RowMm.findRowsMmForSheet);


router.post('/mail-test/', validateToken, RowMm.functionTestEmailHtml);

module.exports = router;
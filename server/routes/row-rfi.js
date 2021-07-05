const express = require('express');
const Router = express.Router;
const router = new Router();

const RowRfi = require('../modules/row-rfi');
const { validateToken } = require('../../service/validate');

router.post('/save-all-data-to-server', validateToken, RowRfi.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowRfi.deleteAllDataInThisCollection);



router.post('/save-rows-rfi/', validateToken, RowRfi.updateOrCreateRowsRfi);
router.get('/', validateToken, RowRfi.findRowsRfiForSheet);

router.post('/mail-test/', validateToken, RowRfi.functionTestEmailHtml);

module.exports = router;
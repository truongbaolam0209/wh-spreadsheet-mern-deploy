const express = require('express');
const Router = express.Router;
const router = new Router();

const RowDt = require('../modules/row-dt');
const { validateToken } = require('../../service/validate');


router.post('/save-all-data-to-server', validateToken, RowDt.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowDt.deleteAllDataInThisCollection);

router.post('/save-rows-dt/', validateToken, RowDt.updateOrCreateRowsDt);
router.get('/', validateToken, RowDt.findRowsDtForSheet);

router.post('/mail-test/', validateToken, RowDt.functionTestEmailHtml);


module.exports = router;
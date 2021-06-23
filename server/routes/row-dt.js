const express = require('express');
const Router = express.Router;
const router = new Router();

const RowDt = require('../modules/row-dt');
const { validateToken } = require('../../custom/validate');


router.post('/save-rows-dt/', validateToken, RowDt.updateOrCreateRowsDt);
router.get('/', validateToken, RowDt.findRowsDtForSheet);

router.post('/mail-test/', validateToken, RowDt.functionTestEmailHtml);


module.exports = router;
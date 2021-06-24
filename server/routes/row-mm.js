const express = require('express');
const Router = express.Router;
const router = new Router();

const RowMm = require('../modules/row-mm');
const { validateToken } = require('../../custom/validate');


router.post('/save-rows-mm/', validateToken, RowMm.updateOrCreateRowsMm);
router.get('/', validateToken, RowMm.findRowsMmForSheet);


router.post('/mail-test/', validateToken, RowMm.functionTestEmailHtml);

module.exports = router;
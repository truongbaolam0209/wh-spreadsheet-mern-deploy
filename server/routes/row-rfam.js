const express = require('express');
const Router = express.Router;
const router = new Router();

const RowRfam = require('../modules/row-rfam');
const { validateToken } = require('../../custom/validate');


router.post('/save-rows-rfam/', validateToken, RowRfam.updateOrCreateRowsRfam);
router.get('/', validateToken, RowRfam.findRowRfamForSheet);




module.exports = router;
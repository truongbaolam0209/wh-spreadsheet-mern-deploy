const express = require('express');
const Router = express.Router;
const router = new Router();

const RowRfam = require('../modules/row-rfam');
const { validateToken } = require('../../service/validate');




router.post('/save-all-data-to-server', validateToken, RowRfam.saveAllDataToServer);
router.post('/delete-all/', validateToken, RowRfam.deleteAllDataInThisCollection);




router.post('/save-rows-rfam/', validateToken, RowRfam.updateOrCreateRowsRfam);
router.get('/', validateToken, RowRfam.findRowsRfamForSheet);



router.post('/mail-test/', validateToken, RowRfam.functionTestEmailHtml);





module.exports = router;
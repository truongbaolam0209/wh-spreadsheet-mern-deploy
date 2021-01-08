const express = require('express');
const Router = express.Router;
const router = new Router();
const RowHistory = require('../modules/row-history');

router.get('/:sheetId', validateToken, RowHistory.findHistoriesForSheet);
router.get('/:sheetId/:rowId', validateToken, RowHistory.findHistoryForOneRow);
router.post('/:sheetId', validateToken, RowHistory.saveRowHistory);
router.delete('/delete-all', validateToken, RowHistory.deleteAllDataInCollection);

module.exports = router;

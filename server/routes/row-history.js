const express = require('express');
const Router = express.Router;
const router = new Router();
const RowHistory = require('../modules/row-history');

router.get('/:sheetId', RowHistory.findHistoriesForSheet);
router.get('/:sheetId/:rowId', RowHistory.findHistoryForOneRow);

router.post('/', RowHistory.saveRowHistory);

module.exports = router;

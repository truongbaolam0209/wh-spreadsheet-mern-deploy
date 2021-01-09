const express = require('express');
const Router = express.Router;
const router = new Router();
const CellHistory = require('../modules/cell-history');


router.get('/:sheetId', CellHistory.findHistoriesForSheet);
router.get('/:sheetId/:rowId/:headerKey', CellHistory.findHistoryForOneCell);
router.post('/:sheetId', CellHistory.saveCellHistories);
router.delete('/delete-all', CellHistory.deleteAllDataInCollectionCell);


module.exports = router;

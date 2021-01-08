const express = require('express');
const Router = express.Router;
const router = new Router();
const CellHistory = require('../modules/cell-history');


router.get('/:sheetId', validateToken, CellHistory.findHistoriesForSheet);

router.get('/:sheetId/:rowId/:headerKey', validateToken, CellHistory.findHistoryForOneCell);

router.post('/:sheetId', validateToken, CellHistory.saveCellHistories);

router.delete('/delete-all', validateToken, CellHistory.deleteAllDataInCollectionCell);


module.exports = router;

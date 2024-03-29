const express = require('express');
const Router = express.Router;
const router = new Router();
const CellHistory = require('../modules/cell-history');
const { validateToken } = require('../../service/validate');



router.post('/save-all-data-cell-history', validateToken, CellHistory.saveAllDataCellHistoryToServer);

router.post('/', validateToken, CellHistory.saveCellHistories);

router.get('/', validateToken, CellHistory.findHistoriesForSheet);

router.get('/one-cell/', validateToken, CellHistory.findHistoryForOneCell);

router.post('/delete-all/', validateToken, CellHistory.deleteAllDataInCollectionCell);



module.exports = router;
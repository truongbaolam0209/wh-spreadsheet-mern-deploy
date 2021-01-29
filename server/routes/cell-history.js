const express = require('express');
const Router = express.Router;
const router = new Router();
const CellHistory = require('../modules/cell-history');


router.post('/', CellHistory.saveCellHistories);

router.get('/', CellHistory.findHistoriesForSheet);

router.get('/one-cell/', CellHistory.findHistoryForOneCell);

router.post('/delete-all/', CellHistory.deleteAllDataInCollectionCell);


module.exports = router;

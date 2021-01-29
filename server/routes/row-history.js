const express = require('express');
const Router = express.Router;
const router = new Router();
const RowHistory = require('../modules/row-history');


router.post('/', RowHistory.saveRowHistory);

router.get('/', RowHistory.findHistoriesForSheet);

router.get('/one-row/', RowHistory.findHistoryForOneRow);

router.post('/delete-all/', RowHistory.deleteAllDataInCollection);

module.exports = router;

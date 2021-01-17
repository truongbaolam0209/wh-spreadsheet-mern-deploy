const express = require('express');
const Router = express.Router;
const router = new Router();
const RowHistory = require('../modules/row-history');


router.post('/', validateToken, RowHistory.saveRowHistory);

router.get('/', validateToken, RowHistory.findHistoriesForSheet);

router.get('/one-row/', validateToken, RowHistory.findHistoryForOneRow);

router.post('/delete-all/', validateToken, RowHistory.deleteAllDataInCollection);

module.exports = router;

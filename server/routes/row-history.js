const express = require('express');
const Router = express.Router;
const router = new Router();
const RowHistory = require('../modules/row-history');
const { validateToken } = require('../../custom/validate');

router.post('/save-all-data-row-history', validateToken, RowHistory.saveAllDataRowHistoryToServer);

router.post('/delete-rows-history', validateToken, RowHistory.deleteRowsHistory);

router.post('/update-rows-history', validateToken, RowHistory.updateOrCreateHistories);

router.post('/', validateToken, RowHistory.saveRowHistory);

router.get('/', validateToken, RowHistory.findHistoriesForSheet);

router.get('/one-row/', validateToken, RowHistory.findHistoryForOneRow);

router.post('/delete-all/', validateToken, RowHistory.deleteAllDataInCollection);

router.post('/find-row-histories-many-project', validateToken, RowHistory.findManyHistoriesOfManyProject);

module.exports = router;
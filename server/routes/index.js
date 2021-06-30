const express = require('express');
const Router = express.Router;

const routes = Router();
const sheetRouter = require('./sheet');
const cellHistoryRouter = require('./cell-history');
const rowHistoryRouter = require('./row-history');
const settingRouter = require('./settings');

const rowRfamRouter = require('./row-rfam');
const rowRfiRouter = require('./row-rfi');
const rowCviRouter = require('./row-cvi');
const rowDtRouter = require('./row-dt');
const rowMmRouter = require('./row-mm');

const rowDataEntryRouter = require('./row-data-entry');
const settingDataEntryRouter = require('./settings-data-entry');


routes.use('/api/sheet', sheetRouter);

routes.use('/api/row-data-entry', rowDataEntryRouter);
routes.use('/api/settings-data-entry', settingDataEntryRouter);

routes.use('/api/cell/history', cellHistoryRouter);
routes.use('/api/row/history', rowHistoryRouter);
routes.use('/api/settings', settingRouter);

routes.use('/api/row-rfam', rowRfamRouter);
routes.use('/api/row-rfi', rowRfiRouter);
routes.use('/api/row-cvi', rowCviRouter);
routes.use('/api/row-dt', rowDtRouter);

routes.use('/api/row-mm', rowMmRouter);



module.exports = routes;

const express = require('express');
const Router = express.Router;

const routes = Router();
const sheetRouter = require('./sheet');
const cellHistoryRouter = require('./cell-history');
const rowHistoryRouter = require('./row-history');
const settingRouter = require('./settings');
const rowRfamRouter = require('./row-rfam');


routes.use('/api/sheet', sheetRouter);
routes.use('/api/cell/history', cellHistoryRouter);
routes.use('/api/row/history', rowHistoryRouter);
routes.use('/api/settings', settingRouter);
routes.use('/api/row-rfam', rowRfamRouter);



module.exports = routes;

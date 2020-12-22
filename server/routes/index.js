const express = require('express');
const Router = express.Router;

const routes = Router();
const userRouter = require('./user');
const sheetRouter = require('./sheet');
const cellHistoryRouter = require('./cell-history');



routes.use('/api/user', userRouter);
routes.use('/api/sheet', sheetRouter);
routes.use('/api/cell/history', cellHistoryRouter);



module.exports = routes;

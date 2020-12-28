const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');


router.get('/:id', Sheet.findOneWithUserEmail);
router.post('/update-rows/:id', Sheet.updateOrCreateRows);
router.post('/update-setting/:id', Sheet.updateSetting);

module.exports = router;

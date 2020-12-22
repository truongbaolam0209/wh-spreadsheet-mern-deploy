const express = require('express');
const Router = express.Router;
const router = new Router();

const Sheet = require('../modules/sheet');

router.get('/', Sheet.findManyByUserId);
// router.get('/:id', Sheet.findOne);
router.get('/:id', Sheet.findOneWithUserEmail);
router.post('/', Sheet.create);
router.put('/:id', Sheet.update);
router.delete('/:id', Sheet.delete);


router.post('/update-rows/:id', Sheet.updateOrCreateRows);



router.post('/delete-row/:id', Sheet.deleteRow);
router.post('/update-setting/:id', Sheet.updateSetting);

module.exports = router;

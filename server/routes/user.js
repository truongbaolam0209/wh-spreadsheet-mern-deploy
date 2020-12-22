const express = require('express');
const Router = express.Router;
const router = new Router();

const User = require('../modules/user');

router.get('/', User.findMany);
router.get('/:id', User.findOne);
router.post('/', User.create);
router.put('/:id', User.update);
router.delete('/:id', User.delete);

module.exports = router;

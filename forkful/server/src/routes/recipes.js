const express = require('express');
const ctrl = require('../controllers/recipeController');

const router = express.Router();

router.get('/search', ctrl.search);
router.get('/filter', ctrl.filter);
router.get('/random', ctrl.random);
router.get('/categories', ctrl.categories);
router.get('/areas', ctrl.areas);
router.get('/_cache', ctrl.cacheStats);
router.get('/:id', ctrl.getById);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/favoriteController');

const router = express.Router();

router.use(protect);

router.get('/', ctrl.listFavorites);
router.post(
  '/',
  [body('mealId').isString().notEmpty().withMessage('mealId required')],
  ctrl.addFavorite
);
router.delete('/:mealId', ctrl.removeFavorite);

module.exports = router;

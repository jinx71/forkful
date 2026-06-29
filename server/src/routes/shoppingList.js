const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/shoppingListController');

const router = express.Router();

// Public — anyone can preview a generated list from a set of recipe ids.
router.post(
  '/preview',
  [body('recipeIds').isArray({ min: 1 }).withMessage('recipeIds[] required')],
  ctrl.preview
);

// Everything below requires auth.
router.use(protect);

router.get('/', ctrl.listMine);
router.post(
  '/',
  [
    body('recipeIds').isArray({ min: 1 }).withMessage('recipeIds[] required'),
    body('name').optional().isString().trim().isLength({ max: 80 }),
  ],
  ctrl.save
);
router.post('/from-favorites', ctrl.fromFavorites);
router.get('/:id', ctrl.getById);
router.patch('/:id/items/:itemId', ctrl.toggleItem);
router.delete('/:id', ctrl.remove);

module.exports = router;

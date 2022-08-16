const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema(
  {
    ingredient: { type: String, required: true },
    measures: { type: [String], default: [] },
    aggregated: { type: String, default: '' },
    recipeCount: { type: Number, default: 1 },
    checked: { type: Boolean, default: false },
  },
  { _id: true }
);

const shoppingListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, default: 'Shopping list' },
    recipeIds: { type: [String], default: [] },
    recipeNames: { type: [String], default: [] },
    items: { type: [shoppingItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShoppingList', shoppingListSchema);

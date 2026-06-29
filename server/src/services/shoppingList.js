// Auto-generated shopping list — the headline engineering lesson.
//
// Given a set of recipes (each with strIngredient1..20 / strMeasure1..20 from
// TheMealDB), produce a deduplicated, unit-aware shopping list.
//
// Strategy:
//   1. Normalize ingredient names (lowercase, trim, strip parenthetical notes).
//   2. Parse each measure into { qty, unit, raw } using a small grammar that
//      handles fractions, mixed numbers, decimals, and a fixed unit map.
//   3. Group by ingredient. For each group, sum amounts where the canonical
//      unit matches; everything else falls into a `measures` list verbatim.
//   4. Render an `aggregated` human string per ingredient.
//
// This is intentionally pragmatic — perfect unit conversion is out of scope.

const UNIT_ALIASES = {
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp', tbl: 'tbsp',
  cup: 'cup', cups: 'cup',
  clove: 'clove', cloves: 'clove',
  pinch: 'pinch', pinches: 'pinch',
  slice: 'slice', slices: 'slice',
  can: 'can', cans: 'can',
  package: 'package', packages: 'package', pkg: 'package',
  handful: 'handful', handfuls: 'handful',
  head: 'head', heads: 'head',
  large: 'large', small: 'small', medium: 'medium',
};

const parseNumber = (s) => {
  if (s == null) return NaN;
  const str = String(s).trim();
  if (!str) return NaN;
  // Mixed number: "1 1/2"
  const mixed = str.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
  // Fraction: "1/2"
  const frac = str.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return parseInt(frac[1], 10) / parseInt(frac[2], 10);
  // Decimal/integer
  const n = parseFloat(str);
  return Number.isFinite(n) ? n : NaN;
};

const formatNumber = (n) => {
  if (!Number.isFinite(n)) return '';
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : String(rounded);
};

const normalizeIngredient = (name) => {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const titleCase = (s) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

// Parse a measure string like "1 1/2 tbsp" → { qty: 1.5, unit: 'tbsp', raw: '1 1/2 tbsp' }
// Returns { qty: NaN, unit: '', raw } when no quantity is parseable.
// Grammar for the quantity:
//   <int>                       → "200"
//   <int> "." <int>             → "1.5"
//   <int> "/" <int>             → "1/2"
//   <int> WS+ <int> "/" <int>   → "1 1/2"
const QUANTITY_RE = /^\s*(\d+(?:\s+\d+\s*\/\s*\d+|\.\d+|\s*\/\s*\d+)?)\s*([a-zA-Z]+)?/;

const parseMeasure = (raw) => {
  const out = { qty: NaN, unit: '', raw: (raw || '').trim() };
  if (!out.raw) return out;

  const m = out.raw.match(QUANTITY_RE);
  if (!m) return out;

  const qtyStr = (m[1] || '').trim();
  const unitStr = (m[2] || '').toLowerCase();
  const qty = parseNumber(qtyStr);

  if (!Number.isFinite(qty)) return out;
  out.qty = qty;
  if (unitStr && UNIT_ALIASES[unitStr]) out.unit = UNIT_ALIASES[unitStr];
  return out;
};

// Pull (ingredient, measure) pairs out of a TheMealDB meal object.
const extractIngredients = (meal) => {
  const pairs = [];
  for (let i = 1; i <= 20; i += 1) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && String(ing).trim()) {
      pairs.push({ ingredient: String(ing).trim(), measure: (meas || '').toString().trim() });
    }
  }
  return pairs;
};

// Main aggregator. `meals` is an array of TheMealDB meal objects.
const buildShoppingList = (meals) => {
  const groups = new Map(); // normalized name → group state

  for (const meal of meals) {
    const pairs = extractIngredients(meal);
    for (const { ingredient, measure } of pairs) {
      const key = normalizeIngredient(ingredient);
      if (!key) continue;
      if (!groups.has(key)) {
        groups.set(key, {
          display: titleCase(key),
          recipeIds: new Set(),
          measures: [],
          sums: new Map(), // unit → totalQty
          unparsed: [],
        });
      }
      const g = groups.get(key);
      g.recipeIds.add(meal.idMeal);
      if (measure) g.measures.push(measure);

      const parsed = parseMeasure(measure);
      if (Number.isFinite(parsed.qty)) {
        const unit = parsed.unit || '';
        g.sums.set(unit, (g.sums.get(unit) || 0) + parsed.qty);
      } else if (measure) {
        g.unparsed.push(measure);
      }
    }
  }

  const items = Array.from(groups.entries()).map(([key, g]) => {
    const sumPieces = [];
    for (const [unit, total] of g.sums.entries()) {
      if (unit) sumPieces.push(`${formatNumber(total)} ${unit}`);
      else sumPieces.push(formatNumber(total));
    }
    const unparsedPieces = g.unparsed.slice(0, 3);
    const aggregated = [...sumPieces, ...unparsedPieces].filter(Boolean).join(' + ') || '—';

    return {
      ingredient: g.display,
      key,
      measures: g.measures,
      aggregated,
      recipeCount: g.recipeIds.size,
    };
  });

  // Sort: most-shared ingredients first, then alphabetical.
  items.sort((a, b) => b.recipeCount - a.recipeCount || a.ingredient.localeCompare(b.ingredient));
  return items;
};

module.exports = {
  buildShoppingList,
  extractIngredients,
  parseMeasure,
  normalizeIngredient,
};

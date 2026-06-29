# ForkFul

> Recipe finder with **auto-generated shopping list** — MERN portfolio project (2021–2022 stack).

Search recipes by name, ingredient, category or cuisine. Save favorites. Pick a few and ForkFul builds a deduplicated, unit-aware shopping list across all of them.

**Engineering lesson**: aggregating heterogeneous third-party data (TheMealDB free-form `strIngredientN` / `strMeasureN` pairs) into a normalized, deduplicated, unit-aware artifact. Implemented in `server/src/services/shoppingList.js`.

---

## Features

- 🔎 Search recipes by name or by ingredient
- 🍱 Browse by category (Beef, Chicken, Vegetarian…) and cuisine (Italian, Indian, Japanese…)
- 🎲 Random recipe roller
- ★ Save favorites (per-user, requires sign-up)
- 🛒 **Auto-generated shopping list** — select multiple recipes → server aggregates ingredients, sums same-unit measures, sorts by recipe-count
- 💾 Save, check off, and delete shopping lists
- 📋 Copy or print any list
- 🟢 Cache badge surfaces the `X-Cache` header per request (`live` / `cached` / `demo data`) so the caching layer is visible
- 📱 Mobile-first responsive UI with skeleton, empty, and error states everywhere

---

## Tech stack (period-accurate 2021–2022)

**Client**
- React `17.0.2` (CRA `5.0.1`), React Router `6.3`
- Tailwind CSS `3.1` (line-clamp utilities added manually since 3.1 predates the core inclusion)
- react-hook-form `7`, react-toastify `9`, axios `0.27.2`, dayjs `1.11`

**Server**
- Node `16` LTS, Express `4.18`, Mongoose `6.5`
- `jsonwebtoken` `8.5`, `bcryptjs` `2.4`
- `node-cache` `5`, `express-rate-limit` `6`, `express-validator` `6.14`, `helmet`, `morgan`

**External API**
- [TheMealDB](https://www.themealdb.com/api.php) — keyless (uses public test key `1`)

---

## Project structure

```
forkful/
├── client/           CRA 5 app (React 17)
│   ├── public/
│   └── src/
│       ├── api/      axios client + endpoint modules
│       ├── components/  shared design system (Button, Card, Spinner, …)
│       ├── context/  AuthContext
│       ├── hooks/    useAuth
│       ├── pages/    route-level views
│       └── utils/
├── server/           Express + Mongoose
│   └── src/
│       ├── config/   db connection
│       ├── controllers/
│       ├── data/     mock dataset (offline demo)
│       ├── middleware/  auth, errorHandler, notFound, asyncHandler
│       ├── models/   User, ShoppingList
│       ├── routes/
│       ├── services/ mealdb (cached proxy) + shoppingList (aggregator)
│       └── utils/
└── package.json      root — runs both with `concurrently`
```

---

## Setup

```bash
git clone <repo> forkful
cd forkful

# 1. Install root + both apps
npm run install:all

# 2. Configure env (defaults work out of the box if you have a local MongoDB)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Run client + server together
npm run dev
```

- Client → http://localhost:3000
- Server → http://localhost:5000/api
- Health → http://localhost:5000/api/health

### Environment variables

`server/.env`:

```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/forkful
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
MEALDB_API_KEY=1
MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1
```

`client/.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=ForkFul
```

### Demo mode (no DB, no internet)

The app degrades cleanly:

- **Without MongoDB**: recipe browsing, search, random, detail pages all work. Auth / favorites / saved lists return `503` and the UI surfaces the error.
- **Without internet** (or if TheMealDB is rate-limited): the proxy automatically falls back to a deterministic mock dataset shipped in `server/src/data/mockMeals.js`. The UI shows a `demo data` badge so this is visible.

To run with a local MongoDB via Docker:

```bash
docker run -d --name forkful-mongo -p 27017:27017 mongo:6
```

---

## API surface

All responses follow `{ success, data, message, errors }`.

### Public (recipe proxy)
- `GET  /api/recipes/search?q=<term>`
- `GET  /api/recipes/filter?category=<c>` · `?area=<a>` · `?ingredient=<i>`
- `GET  /api/recipes/random`
- `GET  /api/recipes/categories`
- `GET  /api/recipes/areas`
- `GET  /api/recipes/:id`
- `GET  /api/recipes/_cache`   *(cache stats)*

Every recipe endpoint also returns three response headers:

| Header | Values | Meaning |
|---|---|---|
| `X-Cache` | `cache` / `upstream` / `mock` | served from where |
| `X-Cache-TTL` | seconds | remaining TTL when served from cache |
| `X-Data-Source` | `themealdb` / `mock` | upstream identifier |

### Auth
- `POST /api/auth/register`  `{ name, email, password }`
- `POST /api/auth/login`     `{ email, password }`
- `GET  /api/auth/me`        *(Bearer)*

### Favorites *(Bearer)*
- `GET    /api/favorites`
- `POST   /api/favorites`           `{ mealId }`
- `DELETE /api/favorites/:mealId`

### Shopping list
- `POST   /api/shopping-list/preview`  `{ recipeIds: [] }`   — **public**, returns aggregated items
- `POST   /api/shopping-list/from-favorites`                  *(Bearer)*
- `GET    /api/shopping-list`                                 *(Bearer)*
- `POST   /api/shopping-list`         `{ recipeIds, name? }`  *(Bearer)*
- `GET    /api/shopping-list/:id`                             *(Bearer)*
- `PATCH  /api/shopping-list/:id/items/:itemId`               *(Bearer)*  — toggles `checked`
- `DELETE /api/shopping-list/:id`                             *(Bearer)*

---

## The headline lesson — `services/shoppingList.js`

TheMealDB returns each recipe with up to 20 ingredient/measure pairs (`strIngredient1..20`, `strMeasure1..20`) as free-form strings. To turn N selected recipes into one usable list:

1. **Normalize** ingredient names (lowercase, trim, strip parentheticals).
2. **Parse** each measure with a small grammar handling mixed numbers (`1 1/2`), simple fractions (`1/2`), and decimals.
3. **Alias** units to a canonical set (`tbsp`, `tsp`, `g`, `kg`, `ml`, `l`, `oz`, `lb`, `cup`, `clove`, `slice`, …).
4. **Group by ingredient**. For each group, sum amounts where the canonical unit matches; everything else falls into a verbatim `measures` list (you don't get a wrong total just because the units disagreed).
5. **Sort** by recipe-count descending, then alphabetical — items used in the most recipes float to the top.

Render is human-friendly: `Garlic — 5 cloves + 1 tbsp · used in 3 recipes`.

---

## Caching pattern

`services/mealdb.js` implements `getOrSet(key, ttl, fetcher)` with:

- Per-endpoint TTLs (random = 30s, individual recipes = 1h, taxonomies = 6h)
- Inflight promise dedup (concurrent identical requests share one upstream fetch)
- Transparent upstream → mock fallback on any failure
- Source/TTL surfaced via response headers so the frontend `CacheBadge` can render it

This is the same pattern used in CrickLiveRoyal / PitchSide / CoinScope, here applied to a non-rate-limited API mostly for the demo-mode safety net.

---

## Definition of Done

- [x] `npm install` in both folders, then **one command** boots client + server (`npm run dev`)
- [x] `.env.example` present in client and server; real `.env` git-ignored
- [x] Responsive on mobile + desktop; accessibility basics
- [x] Loading / empty / error states on every async view
- [x] Shared design system + tomato-red accent
- [x] Forms validated client (react-hook-form) and server (express-validator)
- [x] Keyed APIs proxied through backend; rate-limited and cached
- [x] JWT auth + protected routes; passwords never returned
- [x] Mock fallback for offline demo
- [x] Zero console errors/warnings

---

## License

MIT — for portfolio use.

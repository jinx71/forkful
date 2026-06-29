import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RecipeCard, { RecipeCardSkeleton } from '../components/RecipeCard';
import CategoryPill from '../components/CategoryPill';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CacheBadge from '../components/CacheBadge';
import {
  listCategories,
  listAreas,
  filterByCategory,
  filterByArea,
} from '../api/recipes';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [activeCat, setActiveCat] = useState('Chicken');
  const [activeArea, setActiveArea] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, a] = await Promise.all([listCategories(), listAreas()]);
        if (cancelled) return;
        setCategories(c.categories || []);
        setAreas(a.areas || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingTaxonomy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingMeals(true);
    setError(null);
    (async () => {
      try {
        const data = activeArea
          ? await filterByArea(activeArea)
          : await filterByCategory(activeCat);
        if (cancelled) return;
        setMeals(data.meals || []);
        setCache(data._cache);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingMeals(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCat, activeArea]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-tomato-500 via-tomato-500 to-amber-400 px-6 py-10 text-white shadow-lift sm:px-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
            🔪 cook smart
          </p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Find recipes you love.<br />
            <span className="text-white/85">We'll build the shopping list.</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm text-white/85 sm:text-base">
            Search by name or ingredient, save your favorites, and let ForkFul aggregate the
            ingredients across every recipe you picked.
          </p>
          <div className="mt-6">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink-800">Browse by category</h2>
            <p className="text-sm text-ink-500">Pick a category to see what's cooking.</p>
          </div>
          {cache && <CacheBadge source={cache.source} ttl={cache.ttl} />}
        </div>

        {loadingTaxonomy ? (
          <Spinner label="Loading categories…" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CategoryPill
                key={c.idCategory || c.strCategory}
                label={c.strCategory}
                active={activeArea ? false : activeCat === c.strCategory}
                onClick={() => {
                  setActiveArea(null);
                  setActiveCat(c.strCategory);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Areas */}
      {areas.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-xl font-bold text-ink-800">Or explore by cuisine</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <CategoryPill
                key={a.strArea}
                label={a.strArea}
                active={activeArea === a.strArea}
                onClick={() => setActiveArea(a.strArea === activeArea ? null : a.strArea)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Meal grid */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-ink-800">
            {activeArea ? `${activeArea} dishes` : `${activeCat} dishes`}
          </h2>
          <Link to="/random" className="text-sm font-semibold text-tomato-600 hover:underline">
            Surprise me →
          </Link>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={() => setActiveCat(activeCat)} />
        ) : loadingMeals ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <EmptyState title="No recipes here yet" message="Try another category or search above." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {meals.slice(0, 16).map((m) => (
              <RecipeCard key={m.idMeal} meal={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

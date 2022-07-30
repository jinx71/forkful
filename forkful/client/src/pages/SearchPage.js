import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RecipeCard, { RecipeCardSkeleton } from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import CacheBadge from '../components/CacheBadge';
import { searchRecipes, filterByIngredient } from '../api/recipes';

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const mode = params.get('mode') || 'name';

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(null);

  useEffect(() => {
    if (!q) {
      setMeals([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = mode === 'ingredient' ? await filterByIngredient(q) : await searchRecipes(q);
        if (cancelled) return;
        setMeals(data.meals || []);
        setCache(data._cache);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, mode]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-ink-800">
          {q ? `Results for "${q}"` : 'Search recipes'}
          <span className="ml-2 text-sm font-medium text-ink-400">by {mode}</span>
        </h1>
        <SearchBar initialQuery={q} initialMode={mode} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {loading ? 'Searching…' : `${meals.length} ${meals.length === 1 ? 'recipe' : 'recipes'} found`}
        </p>
        {cache && <CacheBadge source={cache.source} ttl={cache.ttl} />}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      ) : meals.length === 0 ? (
        <EmptyState
          title={q ? 'No results found' : 'Type something to search'}
          message={q ? `We couldn't find a recipe matching "${q}".` : 'Use the box above to find recipes.'}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((m) => (
            <RecipeCard key={m.idMeal} meal={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

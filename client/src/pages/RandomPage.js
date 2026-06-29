import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import CacheBadge from '../components/CacheBadge';
import { randomRecipe } from '../api/recipes';

const RandomPage = () => {
  const [meal, setMeal] = useState(null);
  const [cache, setCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await randomRecipe();
      setMeal(data.meal);
      setCache(data._cache);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    roll();
  }, [roll]);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Surprise me</h1>
          <p className="text-sm text-ink-500">Pull a random recipe from the database.</p>
        </div>
        <div className="flex items-center gap-2">
          {cache && <CacheBadge source={cache.source} ttl={cache.ttl} />}
          <Button onClick={roll} disabled={loading}>🎲 Roll again</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="Picking something tasty…" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={roll} />
      ) : meal ? (
        <article className="card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="overflow-hidden bg-ink-100">
              {meal.strMealThumb ? (
                <img src={meal.strMealThumb} alt={meal.strMeal} className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-5xl">🍲</div>
              )}
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-2 flex flex-wrap gap-2">
                {meal.strCategory && (
                  <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
                    {meal.strCategory}
                  </span>
                )}
                {meal.strArea && (
                  <span className="rounded-full bg-tomato-100 px-2.5 py-0.5 text-xs font-semibold text-tomato-700">
                    {meal.strArea}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-ink-800">{meal.strMeal}</h2>
              <p className="mt-3 line-clamp-3 text-sm text-ink-600">{meal.strInstructions}</p>
              <div className="mt-5 flex gap-2">
                <Link to={`/recipe/${meal.idMeal}`} className="btn-primary">View full recipe →</Link>
                <Button variant="ghost" onClick={roll}>Another one</Button>
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
};

export default RandomPage;

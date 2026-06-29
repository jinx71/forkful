import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import CacheBadge from '../components/CacheBadge';
import Button from '../components/Button';
import { getRecipe } from '../api/recipes';
import { useAuth } from '../hooks/useAuth';
import { listFavorites, addFavorite, removeFavorite } from '../api/favorites';

const ytEmbed = (url) => {
  if (!url) return null;
  const m = url.match(/[?&]v=([^&]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const splitSteps = (text) =>
  (text || '')
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

const RecipeDetailPage = () => {
  const { id } = useParams();
  const { isAuthed } = useAuth();
  const [meal, setMeal] = useState(null);
  const [cache, setCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getRecipe(id);
        if (cancelled) return;
        setMeal(data.meal);
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
  }, [id]);

  useEffect(() => {
    if (!isAuthed) return;
    let cancelled = false;
    (async () => {
      try {
        const f = await listFavorites();
        if (!cancelled) setFavorites(f);
      } catch (_) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const isFav = useMemo(() => favorites.some((f) => f.mealId === String(id)), [favorites, id]);

  const toggleFav = async () => {
    if (!isAuthed) {
      toast.info('Sign in to save favorites');
      return;
    }
    setFavBusy(true);
    try {
      const next = isFav ? await removeFavorite(id) : await addFavorite(id);
      setFavorites(next);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (e) {
      toast.error(e.message || 'Could not update favorites');
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Fetching recipe…" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} />;
  if (!meal) return <ErrorState message="Recipe not found" />;

  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && String(ing).trim()) ingredients.push({ ing: ing.trim(), meas: (meas || '').trim() });
  }
  const steps = splitSteps(meal.strInstructions);
  const yt = ytEmbed(meal.strYoutube);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm">
        <Link to="/" className="text-tomato-600 hover:underline">← Back</Link>
        {cache && <CacheBadge source={cache.source} ttl={cache.ttl} />}
      </div>

      {/* Header */}
      <header className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-ink-100">
          {meal.strMealThumb ? (
            <img src={meal.strMealThumb} alt={meal.strMeal} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-5xl">🍲</div>
          )}
        </div>
        <div className="flex flex-col justify-center">
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
            {(meal.strTags || '').split(',').filter(Boolean).slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {t.trim()}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold text-ink-800">{meal.strMeal}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {ingredients.length} ingredients · {steps.length} steps
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={toggleFav} disabled={favBusy} variant={isFav ? 'danger' : 'primary'}>
              {isFav ? '★ Saved' : '☆ Save to favorites'}
            </Button>
            {meal.strYoutube && (
              <a className="btn-ghost" href={meal.strYoutube} target="_blank" rel="noreferrer">
                Watch on YouTube
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="grid gap-8 md:grid-cols-3">
        <aside className="md:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="mb-3 text-base font-bold text-ink-800">Ingredients</h2>
            <ul className="space-y-2">
              {ingredients.map(({ ing, meas }, i) => (
                <li key={`${ing}-${i}`} className="flex items-start justify-between gap-3 text-sm">
                  <span className="font-medium text-ink-700">{ing}</span>
                  <span className="rounded-md bg-ink-50 px-2 py-0.5 text-xs font-semibold text-ink-500">
                    {meas || '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="md:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-ink-800">Method</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="card flex gap-3 p-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tomato-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-700">{step}</p>
              </li>
            ))}
          </ol>

          {yt && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100">
              <div className="relative aspect-video w-full bg-ink-100">
                <iframe
                  src={yt}
                  title={`${meal.strMeal} video`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecipeDetailPage;

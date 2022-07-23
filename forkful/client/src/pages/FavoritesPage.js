import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import { listFavorites, removeFavorite } from '../api/favorites';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const f = await listFavorites();
        if (!cancelled) setFavorites(f);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(favorites.map((f) => f.mealId)));
  const clearSel = () => setSelected(new Set());

  const remove = async (mealId) => {
    try {
      const next = await removeFavorite(mealId);
      setFavorites(next);
      setSelected((prev) => {
        const s = new Set(prev);
        s.delete(mealId);
        return s;
      });
      toast.success('Removed from favorites');
    } catch (e) {
      toast.error(e.message || 'Could not remove');
    }
  };

  const buildList = () => {
    const ids = selected.size > 0 ? Array.from(selected) : favorites.map((f) => f.mealId);
    if (ids.length === 0) {
      toast.info('No recipes selected');
      return;
    }
    navigate(`/shopping-list?ids=${ids.join(',')}`);
  };

  const selectedCount = selected.size;

  const heading = useMemo(() => {
    if (loading) return 'Your favorites';
    if (favorites.length === 0) return 'Your favorites';
    return `Your favorites (${favorites.length})`;
  }, [favorites.length, loading]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">{heading}</h1>
          <p className="text-sm text-ink-500">
            Select recipes and we'll auto-build a deduplicated shopping list.
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={selectedCount === favorites.length ? clearSel : selectAll}>
              {selectedCount === favorites.length ? 'Clear selection' : 'Select all'}
            </Button>
            <Button onClick={buildList}>
              🛒 Build shopping list{selectedCount > 0 ? ` (${selectedCount})` : ''}
            </Button>
          </div>
        )}
      </header>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner label="Loading favorites…" />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Browse recipes and tap the ★ on any detail page to save it here."
          action={<Link to="/" className="btn-primary">Browse recipes</Link>}
        />
      ) : (
        <ul className="grid gap-3">
          {favorites.map((f) => {
            const isSel = selected.has(f.mealId);
            return (
              <li
                key={f.mealId}
                className={`card flex items-center gap-4 p-3 transition ${
                  isSel ? 'ring-2 ring-tomato-500' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(f.mealId)}
                  aria-pressed={isSel}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${
                    isSel
                      ? 'border-tomato-500 bg-tomato-500 text-white'
                      : 'border-ink-200 bg-white text-ink-500 hover:border-tomato-300 hover:text-tomato-600'
                  }`}
                >
                  {isSel ? '✓' : '+'}
                </button>
                <Link to={`/recipe/${f.mealId}`} className="flex flex-1 items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                    {f.thumbnail ? (
                      <img src={f.thumbnail} alt={f.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🍲</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-800">{f.name}</p>
                    <p className="truncate text-xs text-ink-500">
                      {f.category}
                      {f.category && f.area ? ' · ' : ''}
                      {f.area}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(f.mealId)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Remove ${f.name} from favorites`}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;

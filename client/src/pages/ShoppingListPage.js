import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import {
  previewList,
  fromFavorites,
  saveList,
  listMine,
  toggleItem,
  deleteList,
} from '../api/shoppingList';
import { listFavorites } from '../api/favorites';

const ShoppingListPage = () => {
  const [params, setParams] = useSearchParams();
  const idsParam = params.get('ids');
  const requestedIds = useMemo(
    () => (idsParam ? idsParam.split(',').filter(Boolean) : []),
    [idsParam]
  );

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { items, recipeIds, recipeNames }
  const [checkedKeys, setCheckedKeys] = useState(new Set());

  const [savedLists, setSavedLists] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [hasFavorites, setHasFavorites] = useState(false);

  // Load saved lists + favorites flag.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lists, favs] = await Promise.all([listMine(), listFavorites()]);
        if (cancelled) return;
        setSavedLists(lists);
        setHasFavorites(favs.length > 0);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-generate preview when ids in URL.
  const generateFromIds = useCallback(async (ids) => {
    setGenerating(true);
    setError(null);
    try {
      const data = await previewList(ids);
      setPreview(data);
      setCheckedKeys(new Set());
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (requestedIds.length > 0) generateFromIds(requestedIds);
  }, [requestedIds, generateFromIds]);

  const generateFromFavorites = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await fromFavorites();
      setPreview(data);
      setCheckedKeys(new Set());
      setParams({ ids: data.recipeIds.join(',') }, { replace: true });
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Could not build list');
    } finally {
      setGenerating(false);
    }
  };

  const toggleChecked = (key) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onSave = async () => {
    if (!preview) return;
    try {
      const list = await saveList({ recipeIds: preview.recipeIds });
      setSavedLists((prev) => [list, ...prev]);
      toast.success('Shopping list saved');
    } catch (e) {
      toast.error(e.message || 'Could not save');
    }
  };

  const onCopy = async () => {
    if (!preview) return;
    const lines = preview.items.map((it) => `- ${it.ingredient} (${it.aggregated})`);
    const text = [
      `ForkFul shopping list — ${preview.recipeIds.length} recipes`,
      ...lines,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (_) {
      toast.error('Could not copy');
    }
  };

  const onPrint = () => window.print();

  const openSaved = async (id) => {
    try {
      const list = savedLists.find((l) => l._id === id);
      if (!list) return;
      // Hydrate items in the preview shape so the same UI renders.
      setPreview({
        items: list.items.map((it) => ({
          ingredient: it.ingredient,
          key: it.ingredient.toLowerCase(),
          aggregated: it.aggregated || it.measures.join(' + '),
          measures: it.measures,
          recipeCount: it.recipeCount,
          _saved: { listId: list._id, itemId: it._id, checked: it.checked },
        })),
        recipeIds: list.recipeIds,
        recipeNames: list.recipeNames,
      });
      setCheckedKeys(new Set(list.items.filter((it) => it.checked).map((it) => it.ingredient.toLowerCase())));
      setParams({ saved: id }, { replace: true });
    } catch (e) {
      toast.error(e.message || 'Could not open list');
    }
  };

  const onToggleSavedItem = async (item) => {
    if (!item._saved) return;
    try {
      const updated = await toggleItem(item._saved.listId, item._saved.itemId);
      setSavedLists((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      // Reflect in current preview view too:
      toggleChecked(item.key);
    } catch (e) {
      toast.error(e.message || 'Could not update item');
    }
  };

  const onDeleteSaved = async (id) => {
    try {
      await deleteList(id);
      setSavedLists((prev) => prev.filter((l) => l._id !== id));
      toast.success('List deleted');
    } catch (e) {
      toast.error(e.message || 'Could not delete');
    }
  };

  const totalItems = preview?.items?.length || 0;
  const checkedCount = checkedKeys.size;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-800">Shopping list</h1>
          <p className="max-w-xl text-sm text-ink-500">
            ForkFul aggregates the ingredients across every recipe you pick — same items get
            deduplicated and same-unit amounts are summed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={generateFromFavorites} disabled={generating || !hasFavorites}>
            {hasFavorites ? '★ Build from all favorites' : 'No favorites to use'}
          </Button>
        </div>
      </header>

      {error && <ErrorState message={error} />}

      {/* Active preview */}
      {generating ? (
        <div className="card flex min-h-[30vh] items-center justify-center p-8">
          <Spinner label="Aggregating ingredients…" />
        </div>
      ) : preview ? (
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink-800">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
                <span className="ml-2 text-sm font-medium text-ink-400">
                  · {preview.recipeIds.length} {preview.recipeIds.length === 1 ? 'recipe' : 'recipes'}
                </span>
              </h2>
              {preview.recipeNames?.length > 0 && (
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                  {preview.recipeNames.join(' · ')}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={onCopy}>Copy</Button>
              <Button variant="ghost" onClick={onPrint}>Print</Button>
              {!preview.items.some((it) => it._saved) && <Button onClick={onSave}>Save list</Button>}
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-4 flex items-center gap-2 text-xs text-ink-500">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              {checkedCount} of {totalItems} checked off
              <div className="ml-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            <ul className="divide-y divide-ink-100">
              {preview.items.map((it) => {
                const isChecked = checkedKeys.has(it.key);
                return (
                  <li key={it.key} className="flex items-start gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => (it._saved ? onToggleSavedItem(it) : toggleChecked(it.key))}
                      aria-pressed={isChecked}
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold transition ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-ink-300 bg-white text-transparent hover:border-emerald-400'
                      }`}
                    >
                      ✓
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            isChecked ? 'text-ink-400 line-through' : 'text-ink-800'
                          }`}
                        >
                          {it.ingredient}
                        </p>
                        <span className="rounded-md bg-tomato-50 px-2 py-0.5 text-xs font-semibold text-tomato-700">
                          {it.aggregated}
                        </span>
                      </div>
                      {it.recipeCount > 1 && (
                        <p className="mt-0.5 text-xs text-ink-500">
                          Used in {it.recipeCount} recipes
                        </p>
                      )}
                      {it.measures && it.measures.length > 1 && (
                        <p className="mt-0.5 text-[11px] text-ink-400">
                          per-recipe measures: {it.measures.join(' · ')}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : (
        !generating && (
          <EmptyState
            title="Build your first shopping list"
            message="Open Favorites, pick the recipes you want to cook, and tap 'Build shopping list'. Or use the button above to build from all favorites."
            action={
              <Link to="/favorites" className="btn-primary">
                Go to favorites
              </Link>
            }
          />
        )
      )}

      {/* Saved lists */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-ink-800">Saved lists</h2>
        {loadingSaved ? (
          <Spinner label="Loading saved lists…" />
        ) : savedLists.length === 0 ? (
          <p className="text-sm text-ink-500">No saved lists yet. Hit "Save list" above to keep one for later.</p>
        ) : (
          <ul className="grid gap-2">
            {savedLists.map((l) => (
              <li key={l._id} className="card flex items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={() => openSaved(l._id)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-semibold text-ink-800">{l.name}</p>
                  <p className="text-xs text-ink-500">
                    {l.items.length} items · {l.recipeIds.length} recipes ·
                    {l.items.filter((i) => i.checked).length} checked
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSaved(l._id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ShoppingListPage;

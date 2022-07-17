import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export const RecipeCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] w-full skeleton" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 skeleton" />
      <div className="h-3 w-1/2 skeleton" />
    </div>
  </div>
);

const RecipeCard = ({ meal, selected, onToggleSelect, trailing }) => (
  <article
    className={cn(
      'card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift',
      selected && 'ring-2 ring-tomato-500'
    )}
  >
    <Link to={`/recipe/${meal.idMeal}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {meal.strMealThumb ? (
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🍲</div>
        )}
        {(meal.strCategory || meal.strArea) && (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {meal.strCategory && (
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-ink-700 shadow-sm">
                {meal.strCategory}
              </span>
            )}
            {meal.strArea && (
              <span className="rounded-full bg-tomato-500/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                {meal.strArea}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-800">{meal.strMeal}</h3>
      </div>
    </Link>

    {(onToggleSelect || trailing) && (
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSelect(meal);
            }}
            aria-pressed={!!selected}
            title={selected ? 'Selected for list' : 'Add to list'}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition',
              selected
                ? 'border-tomato-500 bg-tomato-500 text-white'
                : 'border-ink-200 bg-white/95 text-ink-600 hover:border-tomato-300 hover:text-tomato-600'
            )}
          >
            {selected ? '✓' : '+'}
          </button>
        )}
        {trailing}
      </div>
    )}
  </article>
);

export default RecipeCard;

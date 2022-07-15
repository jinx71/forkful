import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const navLinkClass = ({ isActive }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive ? 'bg-tomato-50 text-tomato-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
  );

const Navbar = () => {
  const { user, isAuthed, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-tomato-500 text-lg">🍴</span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-800">
            Fork<span className="text-tomato-500">Ful</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/random" className={navLinkClass}>Random</NavLink>
          <NavLink to="/favorites" className={navLinkClass}>Favorites</NavLink>
          <NavLink to="/shopping-list" className={navLinkClass}>Shopping list</NavLink>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <>
              <span className="text-xs text-ink-500">Hi, <span className="font-semibold text-ink-700">{user?.name}</span></span>
              <button onClick={logout} className="btn-ghost">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-200 md:hidden"
        >
          <span className="block h-0.5 w-5 bg-ink-700" />
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <NavLink to="/" end onClick={() => setOpen(false)} className={navLinkClass}>Home</NavLink>
            <NavLink to="/random" onClick={() => setOpen(false)} className={navLinkClass}>Random</NavLink>
            <NavLink to="/favorites" onClick={() => setOpen(false)} className={navLinkClass}>Favorites</NavLink>
            <NavLink to="/shopping-list" onClick={() => setOpen(false)} className={navLinkClass}>Shopping list</NavLink>
            <div className="mt-2 flex gap-2 border-t border-ink-100 pt-3">
              {isAuthed ? (
                <button onClick={() => { logout(); setOpen(false); }} className="btn-ghost flex-1">Sign out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1">Sign in</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

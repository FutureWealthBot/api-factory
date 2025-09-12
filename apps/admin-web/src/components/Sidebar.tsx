import React from 'react';
import { NavLink } from 'react-router-dom';

type Props = { onNavigate?: () => void };

export default function Sidebar({ onNavigate }: Props) {
  const navigateAndClose = () => {
    onNavigate?.();
  };

  // persist collapsed/expanded state (for future mobile toggle)
  React.useEffect(() => {
    try {
      const v = localStorage.getItem('sidebar_open');
      // noop for now; leaving hook in place for later expansion
    } catch (e) {}
  }, []);

  // keyboard nav: arrow up/down moves focus between links
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.sidebar-link'));
      if (!links.length) return;
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? links.indexOf(active as any) : -1;
      if (e.key === 'ArrowDown') {
        const next = links[(idx + 1) % links.length];
        next?.focus();
        e.preventDefault();
      }
      if (e.key === 'ArrowUp') {
        const prev = links[(idx - 1 + links.length) % links.length];
        prev?.focus();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <aside className="sidebar" role="navigation" aria-label="Primary">
      <nav>
        <ul className="sidebar-list">
          <li>
            <NavLink to="/" end onClick={navigateAndClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/fortress" onClick={navigateAndClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Cyber Fortress
            </NavLink>
          </li>
          <li>
            <NavLink to="/retirement-planner" onClick={navigateAndClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Retirement Planner
            </NavLink>
          </li>
          <li>
            <NavLink to="/pricing" onClick={navigateAndClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Pricing
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

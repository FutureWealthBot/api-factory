import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Fortification from './screens/Fortification';
import Sidebar from './components/Sidebar';
import './styles/fortress.css';

function Shell({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // close sidebar on Escape for accessibility
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowSidebar(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // close sidebar when the location changes (useful for mobile navigation)
  React.useEffect(() => {
    if (showSidebar) setShowSidebar(false);
  }, [location]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="topbar">
        <h2 className="brand">API Factory</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="toggle" aria-expanded={showSidebar} onClick={() => setShowSidebar(s => !s)} aria-label="Toggle menu">☰</button>
          <button className="toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <aside className="left-col" style={{ display: showSidebar ? 'block' : undefined }}>
        <h2 className="brand">API Factory</h2>
        <Sidebar onNavigate={() => setShowSidebar(false)} />
      </aside>

  <main id="main-content" className="main-col" role="main">{children}</main>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: 18 }}>
      <h1>Welcome to Admin</h1>
      <p>Use the sidebar to navigate. Try <Link to="/fortress">Cyber Fortress</Link>.</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fortress" element={<Fortification />} />
      </Routes>
    </Shell>
  </BrowserRouter>
);

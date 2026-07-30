import React, { useState, useEffect } from 'react';
import { ConfigProvider } from './context/ConfigContext';
import { AestheticPresentation } from './components/AestheticPresentation';
import { AdminPanel } from './components/AdminPanel';

function MainContent() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.includes('/admin') || hash.includes('#admin') || search.includes('admin');
  });

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdmin(path.includes('/admin') || hash.includes('#admin') || search.includes('admin'));
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const closeAdmin = () => {
    window.location.hash = '';
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#f5ede8] font-sans">
      {isAdmin ? (
        <AdminPanel onBackToPresentation={closeAdmin} />
      ) : (
        <AestheticPresentation />
      )}
    </div>
  );
}

function App() {
  return (
    <ConfigProvider>
      <MainContent />
    </ConfigProvider>
  );
}

export default App;

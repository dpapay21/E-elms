import { useEffect, useState } from 'react';
import AuthFlow from './components/auth/AuthFlow.jsx';
import HomePage from './pages/HomePage.jsx';

function getPageFromPath(pathname) {
  if (pathname === '/register') return 'register';
  if (pathname === '/login') return 'login';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  useEffect(() => {
    const syncPage = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener('popstate', syncPage);
    return () => window.removeEventListener('popstate', syncPage);
  }, []);

  function navigate(path, nextPage) {
    window.history.pushState({}, '', path);
    setPage(nextPage);
  }

  if (page !== 'home') {
    return (
      <AuthFlow key={page} initialMode={page} />
    );
  }

  return <HomePage />;
}

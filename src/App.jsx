import { useEffect, useState } from 'react';
import AuthFlow from './components/auth/AuthFlow.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminApp from './admin/AdminApp.jsx';
import ContentPage from './pages/ContentPage.jsx';
import AccountPage from './pages/AccountPage.jsx';

const PAGE_METADATA = {
  home: ['E-LMIS – Ethiopian Labor Market Information System', 'Explore Ethiopia’s labor market information, employment services, news, and applicant opportunities through E-LMIS.'],
  services: ['Employment Services | E-LMIS', 'Explore E-LMIS employment, recruitment, training, labor identification, and worker support services.'],
  news: ['Labor Market News | E-LMIS', 'Read labor market updates, employment announcements, and news from E-LMIS.'],
  about: ['About E-LMIS', 'Learn about the Ethiopian Labor Market Information System and its role in connecting workers with employment information and services.'],
  contact: ['Contact E-LMIS', 'Find contact information and support resources for the Ethiopian Labor Market Information System.'],
  applicants: ['Applicant Opportunities | E-LMIS', 'Browse approved applicant profiles and employment opportunities through E-LMIS.'],
  login: ['Sign in | E-LMIS', 'Sign in to your E-LMIS account to continue your registration or access your account.'],
  register: ['Create an account | E-LMIS', 'Create an E-LMIS account and complete your employment registration.'],
  admin: ['Admin | E-LMIS', 'Authorized E-LMIS administration portal.'],
  account: ['My account | E-LMIS', 'View your private E-LMIS employment registration and profile information.'],
};

function updatePageMetadata(page) {
  const [title, description] = PAGE_METADATA[page] || PAGE_METADATA.home;
  const privatePage = page === 'admin' || page === 'account' || page === 'login' || page === 'register';
  const canonicalUrl = new URL(window.location.pathname, window.location.origin).href;
  document.title = title;

  const setMeta = (selector, attribute, key, content) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.content = content;
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="robots"]', 'name', 'robots', privatePage ? 'noindex,nofollow' : 'index,follow');
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!privatePage) {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  } else {
    canonical?.remove();
  }
}

function getPageFromPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
  if (path === '/account') return 'account';
  if (path === '/register') return 'register';
  if (path === '/login') return 'login';
  if (['/services', '/news', '/about', '/contact', '/applicants'].includes(path)) return path.slice(1);
  return 'home';
}

export default function App() {
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));

  useEffect(() => updatePageMetadata(page), [page]);

  const syncPage = (path = window.location.pathname) => setPage(getPageFromPath(path));

  useEffect(() => {
    const handlePopState = () => syncPage();
    const handleRouteEvent = (event) => {
      const nextPath = event?.detail || window.location.pathname;
      syncPage(nextPath);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('e-elms:navigate', handleRouteEvent);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('e-elms:navigate', handleRouteEvent);
    };
  }, []);

  function navigate(path, nextPage) {
    window.history.pushState({}, '', path);
    setPage(nextPage);
    window.dispatchEvent(new CustomEvent('e-elms:navigate', { detail: path }));
  }

  if (page !== 'home') {
    if (page === 'admin') return <AdminApp />;
    if (page === 'account') return <AccountPage />;
    if (['services', 'news', 'about', 'contact', 'applicants'].includes(page)) {
      return <ContentPage page={page} />;
    }
    return (
      <AuthFlow key={page} initialMode={page} />
    );
  }

  return <HomePage />;
}

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import SiteIntroModal from './components/SiteIntroModal';
import PageSkeleton from './components/LoadingSkeleton';

// Lazy loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Hotel = lazy(() => import('./pages/Hotel'));
const Lifestyle = lazy(() => import('./pages/Lifestyle'));
const Admin = lazy(() => import('./pages/Admin'));
const Account = lazy(() => import('./pages/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Header />
            <SiteIntroModal />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hotel" element={<Hotel />} />
                <Route path="/lifestyle" element={<Lifestyle />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

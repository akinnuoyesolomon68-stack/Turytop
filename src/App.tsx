import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AdmissionPage = lazy(() => import('./pages/AdmissionPage'));
const ResultCheckerPage = lazy(() => import('./pages/ResultCheckerPage'));
const FeesPaymentPage = lazy(() => import('./pages/FeesPaymentPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admission" element={<AdmissionPage />} />
            <Route path="/results" element={<ResultCheckerPage />} />
            <Route path="/pay-fees" element={<FeesPaymentPage />} />
            <Route path="/admin" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;

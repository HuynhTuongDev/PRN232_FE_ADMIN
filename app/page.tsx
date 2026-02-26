'use client';

import { useState, useEffect, useCallback } from 'react';
import { isLoggedIn, clearTokens, getUser } from './utils/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import MotorbikesPage from './components/MotorbikesPage';
import RentalsPage from './components/RentalsPage';
import UsersPage from './components/UsersPage';
import BlogsPage from './components/BlogsPage';
import PromotionsPage from './components/PromotionsPage';
import ToastContainer, { useToast } from './components/Toast';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [checking, setChecking] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setAuthenticated(isLoggedIn());
    setChecking(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAuthenticated(true);
    addToast('Đăng nhập thành công! Chào mừng trở lại 🎉', 'success');
  }, [addToast]);

  const handleLogout = useCallback(() => {
    clearTokens();
    setAuthenticated(false);
    setActivePage('dashboard');
    addToast('Đã đăng xuất thành công', 'info');
  }, [addToast]);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
  }, []);

  const handleToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    addToast(msg, type);
  }, [addToast]);

  // Show loading while checking auth
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-bg)' }}>
        <div className="spinner" style={{ width: 48, height: 48 }}></div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!authenticated) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const user = getUser();

  // Render active page
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'motorbikes':
        return <MotorbikesPage onToast={handleToast} />;
      case 'rentals':
        return <RentalsPage onToast={handleToast} />;
      case 'users':
        return <UsersPage onToast={handleToast} />;
      case 'blogs':
        return <BlogsPage onToast={handleToast} />;
      case 'promotions':
        return <PromotionsPage onToast={handleToast} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <div className="main-content">
          <Header
            title={activePage}
            userName={user?.name}
          />
          <div className="page-content">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}

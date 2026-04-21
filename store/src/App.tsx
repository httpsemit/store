import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Scanner from './pages/Scanner';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

// Toast component
const Toast = () => {
    const { toastMessage, clearToast } = useStore();
    if (!toastMessage) return null;

    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-slide-in ${
            toastMessage.type === 'success'
                ? 'bg-green-600 text-white shadow-green-200'
                : 'bg-red-600 text-white shadow-red-200'
        }`}>
            <span>{toastMessage.type === 'success' ? '✓' : '✕'}</span>
            <span>{toastMessage.text}</span>
            <button onClick={clearToast} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
    );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useStore();
    if (!currentUser) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

function App() {
    const { initAuth, fetchInitialData, currentUser, theme } = useStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (currentUser) {
            fetchInitialData();
        }
    }, [currentUser, fetchInitialData]);

    return (
        <BrowserRouter>
            <Toast />
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="scanner" element={<Scanner />} />
                    <Route path="sales" element={<POS />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

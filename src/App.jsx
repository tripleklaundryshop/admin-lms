import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase-config';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import Rider from './pages/dashboard/Rider';
import DispatchPage from './pages/dashboard/DispatchPage';
import Customers from './pages/dashboard/Customers'; 
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './pages/components/Sidebar';
import Pricing from './pages/dashboard/Pricing';
import './App.css';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login isSignUp={false} /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Login isSignUp={true} /></PublicRoute>} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/rider" element={<Rider />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/dispatch" element={<DispatchPage />} /> 
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
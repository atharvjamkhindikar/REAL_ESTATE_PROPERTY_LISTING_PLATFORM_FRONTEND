import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import AddProperty from './components/AddProperty';
import AdvancedSearch from './components/AdvancedSearch';
import UserManagement from './components/UserManagement';
import Favorites from './components/Favorites';
import SubscriptionManagement from './components/SubscriptionManagement';
import SearchHistory from './components/SearchHistory';
import Login from './components/Login';
import Unauthorized from './components/Unauthorized';
import UpgradePlan from './components/UpgradePlan';
import { ProtectedRoute, AdminRoute, SubscriptionRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PropertyList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/upgrade" element={<UpgradePlan />} />
            
            {/* Protected routes - require login */}
            <Route path="/add-property" element={
              <ProtectedRoute>
                <AddProperty />
              </ProtectedRoute>
            } />
            
            {/* Subscription-based routes (BASIC+) */}
            <Route path="/search" element={
              <SubscriptionRoute requiredSubscription="BASIC">
                <AdvancedSearch />
              </SubscriptionRoute>
            } />
            <Route path="/favorites" element={
              <SubscriptionRoute requiredSubscription="BASIC">
                <Favorites />
              </SubscriptionRoute>
            } />
            <Route path="/history" element={
              <SubscriptionRoute requiredSubscription="BASIC">
                <SearchHistory />
              </SubscriptionRoute>
            } />
            
            {/* Admin only routes */}
            <Route path="/users" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            <Route path="/subscriptions" element={
              <AdminRoute>
                <SubscriptionManagement />
              </AdminRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

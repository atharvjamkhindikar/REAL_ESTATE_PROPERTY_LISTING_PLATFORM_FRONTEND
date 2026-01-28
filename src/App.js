import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import AddProperty from './components/AddProperty';
import EditProperty from './components/EditProperty';
import AdvancedSearch from './components/AdvancedSearch';
import UserManagement from './components/UserManagement';
import Favorites from './components/Favorites';
import SubscriptionManagement from './components/SubscriptionManagement';
import SearchHistory from './components/SearchHistory';
import Login from './components/Login';
import Register from './components/Register';
import AgentRegister from './components/AgentRegister';
import AgentLogin from './components/AgentLogin';
import AgentDashboard from './components/AgentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ScheduleViewing from './components/ScheduleViewing';
import PropertyImages from './components/PropertyImages';
import BuilderGroupFilter from './components/BuilderGroupFilter';
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
            <Route path="/register" element={<Register />} />
            <Route path="/agent-register" element={<AgentRegister />} />
            <Route path="/agent-login" element={<AgentLogin />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/upgrade" element={<UpgradePlan />} />
            <Route path="/builders" element={<BuilderGroupFilter />} />

            {/* Protected routes - require login */}
            <Route path="/add-property" element={
              <ProtectedRoute>
                <AddProperty />
              </ProtectedRoute>
            } />

            <Route path="/edit-property/:id" element={
              <ProtectedRoute>
                <EditProperty />
              </ProtectedRoute>
            } />

            <Route path="/schedule-viewing/:id" element={
              <ProtectedRoute>
                <ScheduleViewing />
              </ProtectedRoute>
            } />

            <Route path="/property-images/:id" element={
              <ProtectedRoute>
                <PropertyImages />
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
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
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

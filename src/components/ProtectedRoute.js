import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected route - requires authentication
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// Admin only route
export const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin()) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Subscription-based route
export const SubscriptionRoute = ({ children, requiredSubscription }) => {
    const { isAuthenticated, hasSubscription, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasSubscription(requiredSubscription)) {
        return <Navigate to="/upgrade" replace />;
    }

    return children;
};

// Feature-based route
export const FeatureRoute = ({ children, feature }) => {
    const { isAuthenticated, canAccessFeature, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!canAccessFeature(feature)) {
        return <Navigate to="/upgrade" replace />;
    }

    return children;
};

export default ProtectedRoute;

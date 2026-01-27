import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            const data = response.data;
            
            if (data.success && data.data) {
                const userData = data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, user: userData };
            } else {
                return { success: false, error: data.message || 'Login failed' };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        if (user?.id) {
            try {
                const response = await authService.getCurrentUser(user.id);
                if (response.data.success && response.data.data) {
                    const userData = response.data.data;
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error('Failed to refresh user:', error);
            }
        }
    };

    // Role checking helpers
    const isAdmin = () => user?.role === 'ADMIN';
    const isSubscriber = () => user?.role === 'SUBSCRIBER' || user?.role === 'ADMIN';
    const isUser = () => user?.role === 'USER' || isSubscriber();
    const isGuest = () => !user;

    // Subscription checking helpers
    const hasSubscription = (type) => {
        const subscriptionHierarchy = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'];
        const userSubIndex = subscriptionHierarchy.indexOf(user?.subscriptionType || 'FREE');
        const requiredSubIndex = subscriptionHierarchy.indexOf(type);
        return userSubIndex >= requiredSubIndex;
    };

    const hasFreeSubscription = () => hasSubscription('FREE');
    const hasBasicSubscription = () => hasSubscription('BASIC');
    const hasPremiumSubscription = () => hasSubscription('PREMIUM');
    const hasEnterpriseSubscription = () => hasSubscription('ENTERPRISE');

    // Feature access based on subscription
    const canAccessFeature = (feature) => {
        const featureRequirements = {
            // Basic features - FREE
            'view_properties': 'FREE',
            'basic_search': 'FREE',
            
            // BASIC subscription features
            'advanced_search': 'BASIC',
            'favorites': 'BASIC',
            'email_alerts': 'BASIC',
            'search_history': 'BASIC',
            
            // PREMIUM subscription features
            'unlimited_favorites': 'PREMIUM',
            'market_analytics': 'PREMIUM',
            'exclusive_listings': 'PREMIUM',
            'priority_support': 'PREMIUM',
            
            // ENTERPRISE subscription features
            'api_access': 'ENTERPRISE',
            'custom_integrations': 'ENTERPRISE',
            'dedicated_manager': 'ENTERPRISE',
            
            // Admin only features
            'user_management': 'ADMIN',
            'add_users': 'ADMIN',
            'subscription_management': 'ADMIN',
        };

        const requirement = featureRequirements[feature];
        
        if (requirement === 'ADMIN') {
            return isAdmin();
        }
        
        return hasSubscription(requirement);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin,
        isSubscriber,
        isUser,
        isGuest,
        hasSubscription,
        hasFreeSubscription,
        hasBasicSubscription,
        hasPremiumSubscription,
        hasEnterpriseSubscription,
        canAccessFeature,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

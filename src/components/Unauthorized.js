import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Unauthorized.css';

const Unauthorized = () => {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-card">
                <div className="unauthorized-icon">🚫</div>
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                
                {isAuthenticated && (
                    <div className="user-info">
                        <p>Logged in as: <strong>{user.firstName} {user.lastName}</strong></p>
                        <p>Role: <span className="role-badge">{user.role}</span></p>
                        <p>Subscription: <span className="subscription-badge">{user.subscriptionType}</span></p>
                    </div>
                )}
                
                <div className="action-buttons">
                    <Link to="/" className="btn-primary">Go to Home</Link>
                    {!isAuthenticated && (
                        <Link to="/login" className="btn-secondary">Login</Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;

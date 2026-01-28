import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './AgentLogin.css';

const AgentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/agent-dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.agentLogin(email, password);

            if (response.data.success && response.data.data) {
                const agentData = response.data.data;
                localStorage.setItem('agent', JSON.stringify(agentData));
                navigate(from, { replace: true });
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Agent login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-login-container">
            <div className="agent-login-card">
                <div className="agent-login-header">
                    <div className="agent-login-logo">🏢</div>
                    <h1>Agent Login</h1>
                    <p>Sign in to your agent dashboard</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {location.state?.message && (
                    <div className="success-alert">
                        <span className="success-icon">✓</span>
                        {location.state.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="agent-login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@realestate.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="agent-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In as Agent'}
                    </button>
                </form>

                <div className="agent-login-footer">
                    <p className="signup-prompt">Don't have an agent account? <Link to="/agent-register" className="register-link">Register here</Link></p>
                    <p className="user-prompt">Are you a user? <Link to="/login" className="user-login-link">User Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default AgentLogin;

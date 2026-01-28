import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        userType: 'BUYER', // Changed from 'USER' to 'BUYER'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            setError('First name is required');
            return false;
        }
        if (!formData.lastName.trim()) {
            setError('Last name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Invalid email format');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return false;
        }
        // Phone number validation - accept various formats
        // Accepts: (123)456-7890, 123-456-7890, 1234567890, +1-123-456-7890, +91-98765-43210, etc.
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            setError('Please enter a valid phone number (e.g., +1-123-456-7890 or 123-456-7890)');
            return false;
        }
        if (!formData.userType) {
            setError('Please select account type');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone,
                userType: formData.userType,
                subscriptionType: 'FREE',  // Maps to subscription_type column
            });

            if (response.data.success) {
                setError('');
                setSuccess('✅ Registration successful! Redirecting to login...');
                // Redirect after 2 seconds to show message
                setTimeout(() => {
                    navigate('/login', { state: { message: 'Registration successful! Please login.' } });
                }, 2000);
            } else {
                setSuccess('');
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            setSuccess('');
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMsg);
            console.error('Registration error:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <div className="register-logo">🏠</div>
                    <h1>Create Account</h1>
                    <p>Join our real estate community</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-alert">
                        <span className="success-icon">✅</span>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userType">Account Type *</label>
                        <select
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Account Type --</option>
                            <option value="BUYER">Buyer / Tenant</option>
                            <option value="AGENT">Real Estate Agent</option>
                            <option value="OWNER">Property Owner</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;

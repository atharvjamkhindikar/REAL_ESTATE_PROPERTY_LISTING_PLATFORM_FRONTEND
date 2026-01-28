import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './AgentRegister.css';

const AgentRegister = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agencyName: '',
        licenseNumber: '',
        specialization: 'GENERAL',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const specializations = ['GENERAL', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'LUXURY'];

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
        if (!formData.agencyName.trim()) {
            setError('Agency name is required');
            return false;
        }
        if (!formData.licenseNumber.trim()) {
            setError('License number is required');
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
        setError('');
        try {
            const response = await authService.agentRegister({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                userType: 'AGENT',
            });

            if (response.data.success) {
                setError('');
                navigate('/agent-login', {
                    state: { message: 'Registration successful! Please login as an agent.' }
                });
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMsg);
            console.error('Agent registration error:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="agent-register-container">
            <div className="agent-register-card">
                <div className="agent-register-header">
                    <div className="agent-register-logo">🏢</div>
                    <h1>Agent Registration</h1>
                    <p>Join our network of professional agents</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="agent-register-form">
                    <div className="form-section">
                        <h3>Personal Information</h3>
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
                                placeholder="john.doe@realestate.com"
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
                    </div>

                    <div className="form-section">
                        <h3>Agent Information</h3>
                        <div className="form-group">
                            <label htmlFor="agencyName">Agency Name *</label>
                            <input
                                type="text"
                                id="agencyName"
                                name="agencyName"
                                value={formData.agencyName}
                                onChange={handleChange}
                                placeholder="Your Agency Name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="licenseNumber">License Number *</label>
                            <input
                                type="text"
                                id="licenseNumber"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                placeholder="License Number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="specialization">Specialization</label>
                            <select
                                id="specialization"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                            >
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>
                                        {spec.charAt(0) + spec.slice(1).toLowerCase().replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Security</h3>
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
                    </div>

                    <button
                        type="submit"
                        className="agent-register-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating Agent Account...' : 'Register as Agent'}
                    </button>
                </form>

                <div className="agent-register-footer">
                    <p>Already have an account? <Link to="/agent-login" className="login-link">Agent Login</Link></p>
                    <p className="user-link">Are you a buyer or seller? <Link to="/register" className="signup-link">Sign up here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default AgentRegister;

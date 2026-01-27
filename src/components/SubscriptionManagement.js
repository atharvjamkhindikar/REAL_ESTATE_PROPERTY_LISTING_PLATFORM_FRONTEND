import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../services/api';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        subscriptionType: 'BASIC',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        price: 0,
        autoRenew: true,
    });

    const subscriptionPlans = {
        FREE: { price: 0, features: ['Basic search', '5 favorites', 'View listings'] },
        BASIC: { price: 9.99, features: ['Advanced search', '20 favorites', 'Email alerts', 'Priority support'] },
        PREMIUM: { price: 29.99, features: ['Unlimited favorites', 'Market analytics', 'Exclusive listings', '24/7 support'] },
        ENTERPRISE: { price: 99.99, features: ['All Premium features', 'API access', 'Custom integrations', 'Dedicated manager'] },
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [page]);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await subscriptionService.getAllSubscriptions(page, 10);
            setSubscriptions(response.data.content);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch subscriptions. Please try again later.');
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await subscriptionService.createSubscription(formData);
            setShowCreateModal(false);
            resetForm();
            fetchSubscriptions();
        } catch (err) {
            setError('Failed to create subscription. Please try again.');
            console.error('Error creating subscription:', err);
        }
    };

    const handleUpgrade = async (id, currentType) => {
        const types = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'];
        const currentIndex = types.indexOf(currentType);
        if (currentIndex < types.length - 1) {
            const newType = types[currentIndex + 1];
            try {
                await subscriptionService.upgradeSubscription(id, newType);
                fetchSubscriptions();
            } catch (err) {
                setError('Failed to upgrade subscription.');
                console.error('Error upgrading subscription:', err);
            }
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
            try {
                await subscriptionService.cancelSubscription(id);
                fetchSubscriptions();
            } catch (err) {
                setError('Failed to cancel subscription.');
                console.error('Error canceling subscription:', err);
            }
        }
    };

    const handleRenew = async (id) => {
        try {
            await subscriptionService.renewSubscription(id);
            fetchSubscriptions();
        } catch (err) {
            setError('Failed to renew subscription.');
            console.error('Error renewing subscription:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            subscriptionType: 'BASIC',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            price: 0,
            autoRenew: true,
        });
    };

    const getStatusBadge = (subscription) => {
        if (subscription.status === 'ACTIVE') {
            return <span className="badge badge-active">Active</span>;
        } else if (subscription.status === 'CANCELLED') {
            return <span className="badge badge-cancelled">Cancelled</span>;
        } else if (subscription.status === 'EXPIRED') {
            return <span className="badge badge-expired">Expired</span>;
        }
        return <span className="badge badge-pending">Pending</span>;
    };

    if (loading) {
        return <div className="loading">Loading subscriptions...</div>;
    }

    return (
        <div className="subscription-management-container">
            <div className="header">
                <h1>Subscription Management</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Subscription
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Subscription Plans */}
            <div className="plans-section">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                    {Object.entries(subscriptionPlans).map(([type, plan]) => (
                        <div key={type} className={`plan-card ${type === 'PREMIUM' ? 'featured' : ''}`}>
                            {type === 'PREMIUM' && <div className="featured-badge">Most Popular</div>}
                            <h3>{type}</h3>
                            <div className="plan-price">${plan.price}<span>/month</span></div>
                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="subscriptions-table">
                <h2>Active Subscriptions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Plan</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Auto Renew</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((subscription) => (
                            <tr key={subscription.id}>
                                <td>{subscription.userId}</td>
                                <td><span className="plan-badge">{subscription.subscriptionType}</span></td>
                                <td>{new Date(subscription.startDate).toLocaleDateString()}</td>
                                <td>{new Date(subscription.endDate).toLocaleDateString()}</td>
                                <td>${subscription.price}</td>
                                <td>{getStatusBadge(subscription)}</td>
                                <td>{subscription.autoRenew ? '✓' : '✗'}</td>
                                <td className="actions">
                                    {subscription.status === 'ACTIVE' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpgrade(subscription.id, subscription.subscriptionType)} 
                                                className="btn-upgrade"
                                                disabled={subscription.subscriptionType === 'ENTERPRISE'}
                                            >
                                                Upgrade
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(subscription.id)} 
                                                className="btn-cancel-sub"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {(subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') && (
                                        <button 
                                            onClick={() => handleRenew(subscription.id)} 
                                            className="btn-renew"
                                        >
                                            Renew
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 0}
                    className="btn-page"
                >
                    Previous
                </button>
                <span>Page {page + 1} of {totalPages}</span>
                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page === totalPages - 1}
                    className="btn-page"
                >
                    Next
                </button>
            </div>

            {/* Create Subscription Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Create New Subscription</h2>
                            <button onClick={() => setShowCreateModal(false)} className="close-btn">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>User ID*</label>
                                <input
                                    type="number"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Subscription Type*</label>
                                <select
                                    name="subscriptionType"
                                    value={formData.subscriptionType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="FREE">Free</option>
                                    <option value="BASIC">Basic</option>
                                    <option value="PREMIUM">Premium</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date*</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date*</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Price*</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="autoRenew"
                                        checked={formData.autoRenew}
                                        onChange={handleInputChange}
                                    />
                                    Auto Renew
                                </label>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;

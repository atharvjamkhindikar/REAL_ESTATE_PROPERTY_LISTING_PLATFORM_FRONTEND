import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/api';
import './SubscriptionManagement.css';

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        subscriptionType: 'BASIC',
    });

    // USD to INR conversion rate (1 USD = 83 INR) - rounded up to clean numbers
    const USD_TO_INR = 83;

    const subscriptionPlans = {
        FREE: { price: 0, features: ['Basic search', '5 favorites', 'View listings'] },
        BASIC: { price: 850, features: ['Advanced search', '20 favorites', 'Email alerts', 'Priority support'] },
        PREMIUM: { price: 2500, features: ['Unlimited favorites', 'Market analytics', 'Exclusive listings', '24/7 support'] },
        ENTERPRISE: { price: 8300, features: ['All Premium features', 'API access', 'Custom integrations', 'Dedicated manager'] },
    };

    // Function to get the current price for a plan type
    const getPriceForPlanType = (planType) => {
        return subscriptionPlans[planType]?.price || 0;
    };

    // Format price in INR - handles both pre-converted and raw prices
    const formatPriceINR = (price) => {
        if (!price && price !== 0) return '₹0';

        // If price is very small (like 9.99, 29.99, 99.99), it's from backend - convert and round it
        // Otherwise it's already converted locally
        let priceInINR = price;
        if (price > 0 && price < 200) {
            // Small price suggests it's USD, convert to INR and round up
            priceInINR = Math.ceil(price * USD_TO_INR);
        }

        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(priceInINR);
    };

    const fetchSubscriptions = useCallback(async () => {
        try {
            setLoading(true);
            // Try to get active subscriptions first
            const response = await subscriptionService.getActiveSubscriptions();

            // Handle different response structures
            const data = response.data;
            let subscriptionsData = [];

            // Check if response has data wrapper (ApiResponse format)
            if (data.data) {
                // Response structure: { success, data: [...], message }
                subscriptionsData = Array.isArray(data.data) ? data.data : [];
            } else if (data.content) {
                // Response structure: { content, totalPages }
                subscriptionsData = data.content || [];
            } else if (Array.isArray(data)) {
                // Response structure: direct array
                subscriptionsData = data;
            }

            // Ensure we have an array
            subscriptionsData = Array.isArray(subscriptionsData) ? subscriptionsData : [];

            // Paginate on frontend if needed
            const itemsPerPage = 10;
            const totalPagesCount = Math.ceil(subscriptionsData.length / itemsPerPage);
            const paginatedData = subscriptionsData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

            setSubscriptions(paginatedData);
            setTotalPages(totalPagesCount || 1);
            setError(null);
        } catch (err) {
            setError('Failed to fetch subscriptions. Please try again later.');
            console.error('Error fetching subscriptions:', err);
            setSubscriptions([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate required fields
        if (!formData.userId || formData.userId === '') {
            setError('User ID is required');
            return;
        }
        if (!formData.subscriptionType) {
            setError('Subscription Type is required');
            return;
        }

        try {
            console.log('Creating subscription for user:', formData.userId, 'Plan:', formData.subscriptionType);
            const response = await subscriptionService.createSubscription(formData.userId, formData.subscriptionType);
            console.log('Subscription created successfully:', response);
            setShowCreateModal(false);
            resetForm();
            setError(null);
            setSuccess('Subscription created successfully!');
            setTimeout(() => setSuccess(null), 3000);
            fetchSubscriptions();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create subscription. Please try again.';
            setError(errorMsg);
            console.error('Error creating subscription:', err);
        }
    };

    const handleUpgrade = async (userId, currentType) => {
        const types = ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'];
        const currentIndex = types.indexOf(currentType);
        if (currentIndex < types.length - 1) {
            const newType = types[currentIndex + 1];
            try {
                await subscriptionService.upgradeSubscription(userId, newType);
                setSuccess(`Subscription upgraded to ${newType}!`);
                setTimeout(() => setSuccess(null), 3000);
                fetchSubscriptions();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to upgrade subscription.';
                setError(errorMsg);
                console.error('Error upgrading subscription:', err);
            }
        } else {
            setError('Already on highest plan');
        }
    };

    const handleCancel = async (userId) => {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
            try {
                await subscriptionService.cancelSubscription(userId);
                setSuccess('Subscription cancelled successfully!');
                setTimeout(() => setSuccess(null), 3000);
                fetchSubscriptions();
            } catch (err) {
                const errorMsg = err.response?.data?.message || 'Failed to cancel subscription.';
                setError(errorMsg);
                console.error('Error canceling subscription:', err);
            }
        }
    };

    const handleRenew = async (userId) => {
        try {
            await subscriptionService.renewSubscription(userId);
            setSuccess('Subscription renewed successfully!');
            setTimeout(() => setSuccess(null), 3000);
            fetchSubscriptions();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to renew subscription.';
            setError(errorMsg);
            console.error('Error renewing subscription:', err);
        }
    };

    const handleToggleAutoRenew = async (userId) => {
        try {
            await subscriptionService.toggleAutoRenew(userId);
            setSuccess('Auto-renew setting updated!');
            setTimeout(() => setSuccess(null), 3000);
            fetchSubscriptions();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update auto-renew.';
            setError(errorMsg);
            console.error('Error toggling auto-renew:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            subscriptionType: 'BASIC',
        });
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
            {success && <div className="success-message">{success}</div>}

            {/* Subscription Plans */}
            <div className="plans-section">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                    {Object.entries(subscriptionPlans).map(([type, plan]) => (
                        <div key={type} className={`plan-card ${type === 'PREMIUM' ? 'featured' : ''}`}>
                            {type === 'PREMIUM' && <div className="featured-badge">Most Popular</div>}
                            <h3>{type}</h3>
                            <div className="plan-price">{formatPriceINR(plan.price)}<span>/month</span></div>
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
                <h2>Active Subscriptions ({subscriptions.filter(s => s.active).length})</h2>
                {subscriptions.length === 0 ? (
                    <div className="no-subscriptions">
                        <p>No subscriptions found</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Email</th>
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
                                <tr key={subscription.id} className={subscription.active ? 'row-active' : 'row-inactive'}>
                                    <td className="user-name">
                                        {subscription.user?.firstName && subscription.user?.lastName
                                            ? `${subscription.user.firstName} ${subscription.user.lastName}`
                                            : subscription.user?.email || `User ${subscription.user?.id || 'N/A'}`
                                        }
                                    </td>
                                    <td className="user-email">{subscription.user?.email || 'N/A'}</td>
                                    <td><span className="plan-badge">{subscription.planType}</span></td>
                                    <td className="date-cell">{new Date(subscription.startDate).toLocaleDateString()}</td>
                                    <td className="date-cell">{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : '∞'}</td>
                                    <td className="price-cell">{formatPriceINR(getPriceForPlanType(subscription.planType))}</td>
                                    <td>
                                        <span className={`badge ${subscription.active ? 'badge-active' : 'badge-inactive'}`}>
                                            {subscription.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleAutoRenew(subscription.user?.id)}
                                            className={`toggle-auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'}`}
                                            title={subscription.autoRenew ? 'Disable auto-renew' : 'Enable auto-renew'}
                                        >
                                            {subscription.autoRenew ? '✓ Auto' : '✗ Manual'}
                                        </button>
                                    </td>
                                    <td className="actions">
                                        {subscription.active && !subscription.isExpired && (
                                            <>
                                                <button
                                                    onClick={() => handleUpgrade(subscription.user?.id, subscription.planType)}
                                                    className="btn-upgrade"
                                                    disabled={subscription.planType === 'ENTERPRISE'}
                                                    title="Upgrade to higher plan"
                                                >
                                                    ↑ Upgrade
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(subscription.user?.id)}
                                                    className="btn-cancel-sub"
                                                    title="Cancel this subscription"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </>
                                        )}
                                        {(!subscription.active || subscription.isExpired) && (
                                            <button
                                                onClick={() => handleRenew(subscription.user?.id)}
                                                className="btn-renew"
                                                title="Renew this subscription"
                                            >
                                                ⟲ Renew
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                )}
            </div>

            <div className="pagination">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page <= 0}
                    className="btn-page"
                >
                    Previous
                </button>
                <span className="page-info">Page {page + 1} of {totalPages || 1}</span>
                <button
                    onClick={() => setPage(page + 1)} 
                    disabled={page >= totalPages - 1 || totalPages <= 1}
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
                                    <option value="">Select a plan</option>
                                    <option value="FREE">Free - ₹0/month</option>
                                    <option value="BASIC">Basic - ₹850/month</option>
                                    <option value="PREMIUM">Premium - ₹2,500/month</option>
                                    <option value="ENTERPRISE">Enterprise - ₹8,300/year</option>
                                </select>
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

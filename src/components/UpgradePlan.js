import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './UpgradePlan.css';

const UpgradePlan = () => {
    const { user, isAuthenticated } = useAuth();

    const plans = [
        {
            name: 'FREE',
            price: '$0',
            period: '/month',
            features: [
                'View property listings',
                'Basic search functionality',
                'Limited to 5 favorites',
                'Community support',
            ],
            notIncluded: [
                'Advanced search filters',
                'Search history',
                'Email alerts',
                'Market analytics',
            ],
        },
        {
            name: 'BASIC',
            price: '$9.99',
            period: '/month',
            popular: false,
            features: [
                'Everything in FREE',
                'Advanced search filters',
                'Up to 20 favorites',
                'Search history tracking',
                'Email alerts for new listings',
                'Priority support',
            ],
            notIncluded: [
                'Unlimited favorites',
                'Market analytics',
                'Exclusive listings',
            ],
        },
        {
            name: 'PREMIUM',
            price: '$29.99',
            period: '/month',
            popular: true,
            features: [
                'Everything in BASIC',
                'Unlimited favorites',
                'Market analytics & insights',
                'Exclusive listings access',
                '24/7 priority support',
                'No advertisements',
            ],
            notIncluded: [
                'API access',
                'Custom integrations',
            ],
        },
        {
            name: 'ENTERPRISE',
            price: '$99.99',
            period: '/month',
            features: [
                'Everything in PREMIUM',
                'API access',
                'Custom integrations',
                'Dedicated account manager',
                'White-label options',
                'Custom reporting',
            ],
            notIncluded: [],
        },
    ];

    const currentPlanIndex = plans.findIndex(p => p.name === user?.subscriptionType);

    return (
        <div className="upgrade-container">
            <div className="upgrade-header">
                <h1>Upgrade Your Plan</h1>
                <p>Get access to more features with a premium subscription</p>
                {isAuthenticated && (
                    <p className="current-plan">
                        Your current plan: <span className="plan-badge">{user.subscriptionType}</span>
                    </p>
                )}
            </div>

            <div className="plans-grid">
                {plans.map((plan, index) => (
                    <div 
                        key={plan.name} 
                        className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.name === user?.subscriptionType ? 'current' : ''}`}
                    >
                        {plan.popular && <div className="popular-badge">Most Popular</div>}
                        {plan.name === user?.subscriptionType && <div className="current-badge">Current Plan</div>}
                        
                        <h2>{plan.name}</h2>
                        <div className="price">
                            {plan.price}<span>{plan.period}</span>
                        </div>

                        <ul className="features-list">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="included">
                                    <span className="check">✓</span> {feature}
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, i) => (
                                <li key={i} className="not-included">
                                    <span className="cross">✗</span> {feature}
                                </li>
                            ))}
                        </ul>

                        {index > currentPlanIndex ? (
                            <button className="upgrade-btn">Upgrade to {plan.name}</button>
                        ) : index === currentPlanIndex ? (
                            <button className="current-btn" disabled>Current Plan</button>
                        ) : (
                            <button className="downgrade-btn" disabled>Included in your plan</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="back-link">
                <Link to="/">← Back to Home</Link>
            </div>
        </div>
    );
};

export default UpgradePlan;

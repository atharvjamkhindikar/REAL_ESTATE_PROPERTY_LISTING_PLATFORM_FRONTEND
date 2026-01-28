import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scheduleViewingService, propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ScheduleViewing.css';

const ScheduleViewing = () => {
    const { id: propertyId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [formData, setFormData] = useState({
        viewingDate: '',
        viewingTime: '',
        preferredContactMethod: 'PHONE',
        notes: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(propertyId);
            const apiResponse = response.data;
            setProperty(apiResponse.data || apiResponse);
        } catch (err) {
            setError('Failed to fetch property details.');
            console.error('Error fetching property:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.viewingDate) {
            setError('Please select a viewing date');
            return false;
        }
        if (!formData.viewingTime) {
            setError('Please select a viewing time');
            return false;
        }

        // Validate that the date/time is in the future
        const viewingDateTime = new Date(`${formData.viewingDate}T${formData.viewingTime}`);
        if (viewingDateTime <= new Date()) {
            setError('Viewing date and time must be in the future');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError('Please log in to schedule a viewing');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            const viewingData = {
                userId: user.id,
                propertyId: parseInt(propertyId),
                viewingDate: formData.viewingDate,
                viewingTime: formData.viewingTime,
                preferredContactMethod: formData.preferredContactMethod,
                notes: formData.notes,
            };

            const response = await scheduleViewingService.scheduleViewing(viewingData);

            if (response.data.success) {
                setSuccess(true);
                setFormData({
                    viewingDate: '',
                    viewingTime: '',
                    preferredContactMethod: 'PHONE',
                    notes: '',
                });

                setTimeout(() => {
                    navigate(`/property/${propertyId}`, {
                        state: { message: 'Viewing scheduled successfully!' }
                    });
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to schedule viewing');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to schedule viewing. Please try again.';
            setError(errorMsg);
            console.error('Error scheduling viewing:', err.response?.data || err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading property details...</div>;
    }

    if (!property) {
        return (
            <div className="error-container">
                <div className="error">{error || 'Property not found'}</div>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Listings
                </button>
            </div>
        );
    }

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="schedule-viewing-container">
            <button onClick={() => navigate(`/property/${propertyId}`)} className="back-btn">
                ← Back to Property
            </button>

            <div className="schedule-viewing-content">
                <div className="property-summary">
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="property-thumb"
                    />
                    <div className="property-info">
                        <h2>{property.title}</h2>
                        <p className="property-address">{property.address}</p>
                        <p className="property-details">
                            {property.bedrooms} Beds • {property.bathrooms} Baths • {property.squareFeet} sqft
                        </p>
                    </div>
                </div>

                <div className="schedule-form-container">
                    <h1>Schedule a Viewing</h1>
                    <p className="form-subtitle">Request a viewing for this property</p>

                    {error && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-alert">
                            <span className="success-icon">✓</span>
                            Viewing scheduled successfully! Redirecting...
                        </div>
                    )}

                    {!user && (
                        <div className="login-required">
                            <p>Please <a href="/login">log in</a> to schedule a viewing.</p>
                        </div>
                    )}

                    {user && (
                        <form onSubmit={handleSubmit} className="viewing-form">
                            <div className="user-info-display">
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Phone:</strong> {user.phone}</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="viewingDate">Preferred Viewing Date *</label>
                                <input
                                    type="date"
                                    id="viewingDate"
                                    name="viewingDate"
                                    value={formData.viewingDate}
                                    onChange={handleChange}
                                    min={today}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="viewingTime">Preferred Viewing Time *</label>
                                <input
                                    type="time"
                                    id="viewingTime"
                                    name="viewingTime"
                                    value={formData.viewingTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
                                <select
                                    id="preferredContactMethod"
                                    name="preferredContactMethod"
                                    value={formData.preferredContactMethod}
                                    onChange={handleChange}
                                >
                                    <option value="PHONE">Phone Call</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="SMS">SMS Message</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Additional Notes (Optional)</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Any specific questions or requests? (e.g., 'Interested in the renovated kitchen')"
                                    rows="4"
                                />
                            </div>

                            <button
                                type="submit"
                                className="schedule-btn"
                                disabled={submitting}
                            >
                                {submitting ? 'Scheduling...' : 'Schedule Viewing'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleViewing;

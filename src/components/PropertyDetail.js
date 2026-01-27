import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import './PropertyDetail.css';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            // Handle ApiResponse wrapper: { success: true, data: {...} }
            const apiResponse = response.data;
            setProperty(apiResponse.data || apiResponse);
            setError(null);
        } catch (err) {
            setError('Failed to fetch property details.');
            console.error('Error fetching property:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatListingType = (type) => {
        if (!type) return 'N/A';
        return type === 'FOR_SALE' ? 'For Sale' : 'For Rent';
    };

    const formatPropertyType = (type) => {
        if (!type) return 'N/A';
        return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
    };

    if (loading) {
        return <div className="loading">Loading property details...</div>;
    }

    if (error || !property) {
        return (
            <div className="error-container">
                <div className="error">{error || 'Property not found'}</div>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Listings
                </button>
            </div>
        );
    }

    return (
        <div className="property-detail-container">
            <button onClick={() => navigate('/')} className="back-btn">
                ← Back to Listings
            </button>
            
            <div className="property-detail">
                <div className="detail-image">
                    {property.imageUrl ? (
                        <img src={property.imageUrl} alt={property.title} />
                    ) : (
                        <div className="no-image">No Image Available</div>
                    )}
                </div>
                
                <div className="detail-content">
                    <div className="detail-header">
                        <h1>{property.title}</h1>
                        <div className="price-badge">{formatPrice(property.price)}</div>
                    </div>
                    
                    <div className="listing-status">
                        <span className="status-badge">{formatListingType(property.listingType)}</span>
                        <span className="type-badge">{formatPropertyType(property.propertyType)}</span>
                    </div>
                    
                    <div className="detail-address">
                        <h3>📍 Location</h3>
                        <p>{property.address}</p>
                        <p>{property.city}, {property.state} {property.zipCode}</p>
                    </div>
                    
                    <div className="detail-features">
                        <h3>Features</h3>
                        <div className="features-grid">
                            <div className="feature-item">
                                <strong>Bedrooms:</strong> {property.bedrooms}
                            </div>
                            <div className="feature-item">
                                <strong>Bathrooms:</strong> {property.bathrooms}
                            </div>
                            <div className="feature-item">
                                <strong>Square Feet:</strong> {property.squareFeet}
                            </div>
                            {property.yearBuilt && (
                                <div className="feature-item">
                                    <strong>Year Built:</strong> {property.yearBuilt}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{property.description}</p>
                    </div>
                    
                    <div className="contact-section">
                        <button className="contact-btn">Contact Agent</button>
                        <button className="schedule-btn">Schedule Viewing</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;

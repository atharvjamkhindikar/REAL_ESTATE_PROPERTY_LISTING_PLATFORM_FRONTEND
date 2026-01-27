import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../services/api';
import './PropertyCard.css';

const PropertyCard = ({ property, userId = 1, showFavoriteButton = true }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatListingType = (type) => {
        return type === 'FOR_SALE' ? 'For Sale' : 'For Rent';
    };

    const formatPropertyType = (type) => {
        return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
    };

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            setLoading(true);
            await favoriteService.toggleFavorite(userId, property.id);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="property-card">
            <div className="property-image">
                {property.imageUrl ? (
                    <img src={property.imageUrl} alt={property.title} />
                ) : (
                    <div className="no-image">No Image Available</div>
                )}
                <div className="listing-badge">{formatListingType(property.listingType)}</div>
                {showFavoriteButton && (
                    <button 
                        className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                        onClick={handleToggleFavorite}
                        disabled={loading}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                )}
            </div>
            <div className="property-details">
                <h3>{property.title}</h3>
                <p className="property-price">{formatPrice(property.price)}</p>
                <p className="property-address">
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
                <div className="property-features">
                    <span className="feature">
                        <strong>{property.bedrooms}</strong> Beds
                    </span>
                    <span className="feature">
                        <strong>{property.bathrooms}</strong> Baths
                    </span>
                    <span className="feature">
                        <strong>{property.squareFeet}</strong> sqft
                    </span>
                </div>
                <p className="property-type">{formatPropertyType(property.propertyType)}</p>
                <Link to={`/property/${property.id}`} className="view-details-btn">
                    View Details
                </Link>
            </div>
        </div>
    );
};

export default PropertyCard;

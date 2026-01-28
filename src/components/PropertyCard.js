import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteService, propertyImageService, propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyCard.css';

const PropertyCard = ({ property, userId = null, showFavoriteButton = true, showActions = false, onDelete }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const finalUserId = userId || user?.id;

    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [primaryImage, setPrimaryImage] = useState(null);

    useEffect(() => {
        if (property?.id) {
            fetchPropertyImages();
            // Check if property is favorited only if user is logged in
            if (finalUserId && finalUserId > 0) {
                checkFavoriteStatus();
            } else {
                // Not authenticated - default to NOT favorite
                console.log(`User not authenticated for property ${property.id}`);
                setIsFavorite(false);
            }
        }
    }, [property?.id, finalUserId]);

    const checkFavoriteStatus = async () => {
        try {
            console.log(`Checking favorite status for property ${property.id}, user ${finalUserId}`);
            const response = await favoriteService.isFavorite(finalUserId, property.id);

            // Safely extract the boolean value from response
            let isFav = false;

            if (response && response.data) {
                // Try different response structures
                if (typeof response.data === 'boolean') {
                    isFav = response.data;
                } else if (response.data.data !== undefined) {
                    isFav = response.data.data === true;
                } else if (response.data.isFavorite !== undefined) {
                    isFav = response.data.isFavorite === true;
                } else if (response.data.success !== undefined) {
                    isFav = response.data.success === true;
                }
            }

            console.log(`Property ${property.id} favorite status check result:`, isFav);
            setIsFavorite(isFav);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            // ALWAYS default to false on error
            setIsFavorite(false);
        }
    };

    const fetchPropertyImages = async () => {
        try {
            const response = await propertyImageService.getPropertyImages(property.id);
            const imageData = response.data.data || response.data;
            const imageArray = Array.isArray(imageData) ? imageData : [];

            setImages(imageArray);

            // Find primary image or use first image
            const primary = imageArray.find(img => img.isPrimary);
            setPrimaryImage(primary || imageArray[0] || null);
        } catch (error) {
            console.error('Error fetching property images:', error);
            setPrimaryImage(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
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
        
        if (!finalUserId) {
            console.error('User ID is required to toggle favorite');
            return;
        }

        try {
            setLoading(true);
            await favoriteService.toggleFavorite(finalUserId, property.id);
            setIsFavorite(!isFavorite);
            console.log(`Favorite toggled for property ${property.id}`);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert state on error
            setIsFavorite(isFavorite);
        } finally {
            setLoading(false);
        }
    };

    const canEditOrDelete = () => {
        if (!user) return false;
        const isAdmin = user.userType === 'ADMIN' || user.role === 'ADMIN';
        const isAgent = user.userType === 'AGENT' || user.role === 'AGENT';
        const isOwner = property.owner?.id === user.id;
        return isAdmin || isAgent || isOwner;
    };

    const handleEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/edit-property/${property.id}`);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            await propertyService.deleteProperty(property.id);
            alert('Property deleted successfully!');
            if (onDelete) {
                onDelete(property.id);
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    return (
        <div className="property-card">
            <div className="property-image">
                {primaryImage ? (
                    <img src={primaryImage.imageUrl} alt={property.title} />
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
                {showActions && canEditOrDelete() && (
                    <div className="property-actions">
                        <button className="edit-btn" onClick={handleEdit}>
                            Edit
                        </button>
                        <button className="delete-btn" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;

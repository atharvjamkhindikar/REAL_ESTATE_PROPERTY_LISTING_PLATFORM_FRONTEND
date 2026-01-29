import React, {useEffect, useState} from 'react';
import {propertyService} from '../services/api';
import {useAuth} from '../context/AuthContext';
import PropertyCard from './PropertyCard';
import ConnectionError from './ConnectionError';
import './PropertyList.css';


const PropertyList = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        city: '',
        propertyType: '',
        listingType: '',
    });
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // fetch on mount
        fetchProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

   
    
    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getAvailableProperties();
            // Backend returns ApiResponse: { success: true, data: [...] }
            const apiResponse = response.data;
            const data = apiResponse.data || apiResponse;
            setProperties(Array.isArray(data) ? data : (data.content || []));
            setError(null);
        } catch (err) {
            setError(err);
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const applyFilters = () => {
        return properties.filter((property) => {
            return (
                (!filters.city || property.city.toLowerCase().includes(filters.city.toLowerCase())) &&
                (!filters.propertyType || property.propertyType === filters.propertyType) &&
                (!filters.listingType || property.listingType === filters.listingType)
            );
        });
    };

    const clearFilters = () => {
        setFilters({
            city: '',
            propertyType: '',
            listingType: '',
        });
    };

    const handlePropertyDeleted = (propertyId) => {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
    };

    const filteredProperties = applyFilters();

    if (loading) {
        return <div className="loading">Loading properties...</div>;
    }

    if (error) {
        return <ConnectionError error={error} />;
    }

    return (
        <div className="property-list-container">
            {/* Profile Section - Show only if user is authenticated */}
            {isAuthenticated && user && (
                <div className="profile-section">
                    <div className="profile-card">
                        <div className="profile-header">
                            <h2>Welcome, {user.firstName} {user.lastName}!</h2>
                        </div>
                        <div className="profile-content">
                            <div className="profile-info">
                                <div className="info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{user.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone:</span>
                                    <span className="info-value">{user.phone || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">User Type:</span>
                                    <span className="info-value">{user.userType}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Subscription:</span>
                                    <span className="info-value subscription-badge">{user.subscriptionType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="filters">
                <h2>Filter Properties</h2>
                <div className="filter-group">
                    <input
                        type="text"
                        name="city"
                        placeholder="Search by city"
                        value={filters.city}
                        onChange={handleFilterChange}
                    />
                    <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
                        <option value="">All Property Types</option>
                        <option value="HOUSE">House</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="CONDO">Condo</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                        <option value="LAND">Land</option>
                        <option value="COMMERCIAL">Commercial</option>
                    </select>
                    <select name="listingType" value={filters.listingType} onChange={handleFilterChange}>
                        <option value="">All Listing Types</option>
                        <option value="FOR_SALE">For Sale</option>
                        <option value="FOR_RENT">For Rent</option>
                    </select>
                    <button onClick={clearFilters} className="clear-btn">Clear Filters</button>
                </div>
            </div>

            <div className="property-grid">
                {filteredProperties.length === 0 ? (
                    <div className="no-properties">No properties found matching your criteria.</div>
                ) : (
                    filteredProperties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            showActions={true}
                            onDelete={handlePropertyDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default PropertyList;

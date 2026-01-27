import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/api';
import PropertyCard from './PropertyCard';
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

    useEffect(() => {
        fetchProperties();
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
            setError('Failed to fetch properties. Please try again later.');
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
        const filteredProperties = properties.filter((property) => {
            return (
                (!filters.city || property.city.toLowerCase().includes(filters.city.toLowerCase())) &&
                (!filters.propertyType || property.propertyType === filters.propertyType) &&
                (!filters.listingType || property.listingType === filters.listingType)
            );
        });
        return filteredProperties;
    };

    const clearFilters = () => {
        setFilters({
            city: '',
            propertyType: '',
            listingType: '',
        });
    };

    const filteredProperties = applyFilters();

    if (loading) {
        return <div className="loading">Loading properties...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="property-list-container">
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
                        <PropertyCard key={property.id} property={property} />
                    ))
                )}
            </div>
        </div>
    );
};

export default PropertyList;

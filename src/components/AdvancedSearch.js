import React, { useState, useEffect } from 'react';
import { propertyService } from '../services/api';
import PropertyCard from './PropertyCard';
import './AdvancedSearch.css';

const AdvancedSearch = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useState({
        city: '',
        state: '',
        zipCode: '',
        propertyType: '',
        listingType: '',
        minPrice: '',
        maxPrice: '',
        minBedrooms: '',
        maxBedrooms: '',
        minBathrooms: '',
        maxBathrooms: '',
        minArea: '',
        maxArea: '',
        propertyStatus: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        page: 0,
        size: 12,
    });

    useEffect(() => {
        handleSearch();
    }, [page]);

    const handleInputChange = (e) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = {
                ...searchParams,
                page,
            };
            
            // Remove empty values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await propertyService.searchProperties(params);
            const data = response.data || {};
            // Handle both paginated response and direct array
            if (Array.isArray(data)) {
                setProperties(data);
                setTotalPages(1);
                setTotalElements(data.length);
            } else {
                setProperties(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            }
            setError(null);
        } catch (err) {
            setError('Failed to search properties. Please try again.');
            console.error('Error searching properties:', err);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        handleSearch();
    };

    const clearFilters = () => {
        setSearchParams({
            city: '',
            state: '',
            zipCode: '',
            propertyType: '',
            listingType: '',
            minPrice: '',
            maxPrice: '',
            minBedrooms: '',
            maxBedrooms: '',
            minBathrooms: '',
            maxBathrooms: '',
            minArea: '',
            maxArea: '',
            propertyStatus: '',
            sortBy: 'createdAt',
            sortOrder: 'DESC',
            page: 0,
            size: 12,
        });
        setPage(0);
    };

    return (
        <div className="advanced-search-container">
            <div className="search-header">
                <h1>Advanced Property Search</h1>
                <p>Find your perfect property with detailed filters</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-sections">
                    {/* Location Section */}
                    <div className="search-section">
                        <h3>📍 Location</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="e.g., New York"
                                    value={searchParams.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="e.g., NY"
                                    value={searchParams.state}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    placeholder="e.g., 10001"
                                    value={searchParams.zipCode}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Property Type Section */}
                    <div className="search-section">
                        <h3>🏠 Property Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Property Type</label>
                                <select
                                    name="propertyType"
                                    value={searchParams.propertyType}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All Types</option>
                                    <option value="HOUSE">House</option>
                                    <option value="APARTMENT">Apartment</option>
                                    <option value="CONDO">Condo</option>
                                    <option value="TOWNHOUSE">Townhouse</option>
                                    <option value="LAND">Land</option>
                                    <option value="COMMERCIAL">Commercial</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Listing Type</label>
                                <select
                                    name="listingType"
                                    value={searchParams.listingType}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All Listings</option>
                                    <option value="FOR_SALE">For Sale</option>
                                    <option value="FOR_RENT">For Rent</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="propertyStatus"
                                    value={searchParams.propertyStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SOLD">Sold</option>
                                    <option value="RENTED">Rented</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Price Range Section */}
                    <div className="search-section">
                        <h3>💰 Price Range</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min Price ($)</label>
                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="0"
                                    value={searchParams.minPrice}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Price ($)</label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Any"
                                    value={searchParams.maxPrice}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rooms Section */}
                    <div className="search-section">
                        <h3>🛏️ Rooms</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min Bedrooms</label>
                                <input
                                    type="number"
                                    name="minBedrooms"
                                    placeholder="0"
                                    value={searchParams.minBedrooms}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Bedrooms</label>
                                <input
                                    type="number"
                                    name="maxBedrooms"
                                    placeholder="Any"
                                    value={searchParams.maxBedrooms}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Min Bathrooms</label>
                                <input
                                    type="number"
                                    name="minBathrooms"
                                    placeholder="0"
                                    value={searchParams.minBathrooms}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Bathrooms</label>
                                <input
                                    type="number"
                                    name="maxBathrooms"
                                    placeholder="Any"
                                    value={searchParams.maxBathrooms}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Area Section */}
                    <div className="search-section">
                        <h3>📐 Area (sq ft)</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Min Area</label>
                                <input
                                    type="number"
                                    name="minArea"
                                    placeholder="0"
                                    value={searchParams.minArea}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Area</label>
                                <input
                                    type="number"
                                    name="maxArea"
                                    placeholder="Any"
                                    value={searchParams.maxArea}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sorting Section */}
                    <div className="search-section">
                        <h3>⚙️ Sort By</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Sort Field</label>
                                <select
                                    name="sortBy"
                                    value={searchParams.sortBy}
                                    onChange={handleInputChange}
                                >
                                    <option value="createdAt">Date Listed</option>
                                    <option value="price">Price</option>
                                    <option value="bedrooms">Bedrooms</option>
                                    <option value="bathrooms">Bathrooms</option>
                                    <option value="area">Area</option>
                                    <option value="city">City</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Order</label>
                                <select
                                    name="sortOrder"
                                    value={searchParams.sortOrder}
                                    onChange={handleInputChange}
                                >
                                    <option value="DESC">Descending</option>
                                    <option value="ASC">Ascending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="search-actions">
                    <button type="button" onClick={clearFilters} className="btn-clear">
                        Clear All Filters
                    </button>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Searching...' : '🔍 Search Properties'}
                    </button>
                </div>
            </form>

            {/* Results Section */}
            <div className="results-section">
                <div className="results-header">
                    <h2>Search Results</h2>
                    {totalElements > 0 && (
                        <p className="results-count">Found {totalElements} properties</p>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Searching properties...</div>
                ) : properties.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No properties found</h3>
                        <p>Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="properties-grid">
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>

                        {totalPages > 1 && (
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdvancedSearch;

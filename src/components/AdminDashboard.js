import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editingProperty, setEditingProperty] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!isAdmin()) {
            navigate('/unauthorized');
            return;
        }

        fetchAllProperties();
    }, [user, navigate, page, filterType]);

    const fetchAllProperties = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await propertyService.getAllProperties(page, 10);
            let properties = response.data.data?.content || response.data.data || [];
            properties = Array.isArray(properties) ? properties : [];

            // Filter by type if needed
            if (filterType !== 'ALL') {
                properties = properties.filter(p => p.propertyType === filterType);
            }

            // Filter by search term
            if (searchTerm) {
                properties = properties.filter(p =>
                    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setProperties(properties);
            setTotalPages(response.data.data?.totalPages || 1);
        } catch (err) {
            setError('Failed to load properties');
            console.error('Error:', err);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProperty = (property) => {
        setEditingProperty(property);
        setFormData({
            title: property.title,
            description: property.description,
            price: property.price,
            address: property.address,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            propertyType: property.propertyType,
            listingType: property.listingType,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFeet: property.squareFeet,
            yearBuilt: property.yearBuilt,
            available: property.available,
        });
        setShowEditModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveProperty = async (e) => {
        e.preventDefault();

        if (!editingProperty) return;

        try {
            await propertyService.updateProperty(editingProperty.id, formData);
            setSuccess('Property updated successfully!');
            setShowEditModal(false);
            setEditingProperty(null);
            await fetchAllProperties();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to update property');
            console.error('Error:', err);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            try {
                await propertyService.deleteProperty(propertyId);
                setSuccess('Property deleted successfully!');
                await fetchAllProperties();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError('Failed to delete property');
                console.error('Error:', err);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="admin-dashboard-loading">Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-dashboard-container">
            <div className="admin-dashboard-header">
                <div className="dashboard-title">
                    <h1>⚙️ Admin Dashboard</h1>
                    <p>Welcome, {user?.firstName} {user?.lastName}</p>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-add-property" onClick={() => navigate('/add-property')}>
                        ➕ Add Property
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✅ {success}</span>
                </div>
            )}

            <div className="dashboard-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by title, address, or city..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(0);
                        }}
                        className="search-input"
                    />
                </div>

                <div className="filter-box">
                    <select
                        value={filterType}
                        onChange={(e) => {
                            setFilterType(e.target.value);
                            setPage(0);
                        }}
                        className="filter-select"
                    >
                        <option value="ALL">All Types</option>
                        <option value="HOUSE">House</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="CONDO">Condo</option>
                        <option value="TOWNHOUSE">Townhouse</option>
                        <option value="LAND">Land</option>
                        <option value="COMMERCIAL">Commercial</option>
                    </select>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>All Properties</h2>
                    <p>{properties.length} properties found</p>
                </div>

                {properties.length === 0 ? (
                    <div className="no-properties">
                        <p>No properties found</p>
                    </div>
                ) : (
                    <div className="properties-table-wrapper">
                        <table className="properties-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Owner</th>
                                    <th>Price</th>
                                    <th>Address</th>
                                    <th>Type</th>
                                    <th>Beds/Baths</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property) => (
                                    <tr key={property.id}>
                                        <td className="title-cell">{property.title}</td>
                                        <td>{property.owner?.firstName} {property.owner?.lastName}</td>
                                        <td className="price-cell">₹{(property.price / 100000).toFixed(1)}L</td>
                                        <td className="address-cell">{property.address}</td>
                                        <td>{property.propertyType}</td>
                                        <td>{property.bedrooms}/{property.bathrooms}</td>
                                        <td>
                                            <span className={`status-badge ${property.available ? 'active' : 'inactive'}`}>
                                                {property.available ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn-table-edit"
                                                onClick={() => handleEditProperty(property)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-table-delete"
                                                onClick={() => handleDeleteProperty(property.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
            </div>

            {/* Edit Property Modal */}
            {showEditModal && editingProperty && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Property: {editingProperty.title}</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSaveProperty} className="edit-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleFormChange}
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Zip Code *</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Property Type *</label>
                                    <select
                                        name="propertyType"
                                        value={formData.propertyType || 'HOUSE'}
                                        onChange={handleFormChange}
                                    >
                                        <option value="HOUSE">House</option>
                                        <option value="APARTMENT">Apartment</option>
                                        <option value="CONDO">Condo</option>
                                        <option value="TOWNHOUSE">Townhouse</option>
                                        <option value="LAND">Land</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Listing Type *</label>
                                    <select
                                        name="listingType"
                                        value={formData.listingType || 'FOR_SALE'}
                                        onChange={handleFormChange}
                                    >
                                        <option value="FOR_SALE">For Sale</option>
                                        <option value="FOR_RENT">For Rent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bedrooms *</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bathrooms *</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Square Feet *</label>
                                    <input
                                        type="number"
                                        name="squareFeet"
                                        value={formData.squareFeet || ''}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Year Built</label>
                                    <input
                                        type="number"
                                        name="yearBuilt"
                                        value={formData.yearBuilt || ''}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available || false}
                                            onChange={handleFormChange}
                                        />
                                        Available
                                    </label>
                                </div>
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="btn-save">Save Changes</button>
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { propertyService, propertyImageService } from '../services/api';
import PropertyCard from './PropertyCard';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeListings: 0,
        rentListings: 0,
    });
    const [showAddImageModal, setShowAddImageModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        // Check if user is logged in and is an agent
        if (!user) {
            navigate('/agent-login');
            return;
        }

        if (user.userType !== 'AGENT' && user.role !== 'AGENT') {
            navigate('/unauthorized');
            return;
        }

        fetchAgentProperties();
    }, [user, navigate]);

    const fetchAgentProperties = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all properties first, then filter by owner
            const response = await propertyService.getAvailableProperties(0, 100);
            let allProperties = response.data.data?.content || response.data.data || [];
            allProperties = Array.isArray(allProperties) ? allProperties : [];

            // Filter properties owned by this agent
            const agentProperties = allProperties.filter(p => p.owner && p.owner.id === user.id);

            console.log(`Found ${agentProperties.length} properties for agent ${user.id}`);
            setProperties(agentProperties);

            // Calculate stats
            setStats({
                totalProperties: agentProperties.length,
                activeListings: agentProperties.filter(p => p.listingType === 'FOR_SALE').length,
                rentListings: agentProperties.filter(p => p.listingType === 'FOR_RENT').length,
            });
        } catch (err) {
            setError('Failed to load properties');
            console.error('Error:', err);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddImages = (property) => {
        setSelectedProperty(property);
        setShowAddImageModal(true);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is larger than 5MB`);
                return false;
            }
            return true;
        });

        setSelectedImages(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreviews(prev => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadImages = async (e) => {
        e.preventDefault();

        if (selectedImages.length === 0) {
            alert('Please select at least one image');
            return;
        }

        setUploadingImages(true);
        try {
            for (let i = 0; i < selectedImages.length; i++) {
                const formData = new FormData();
                formData.append('file', selectedImages[i]);
                formData.append('caption', '');
                formData.append('isPrimary', String(i === 0));
                formData.append('displayOrder', String(i));

                await propertyImageService.addImage(selectedProperty.id, formData);
            }

            setSuccess(`${selectedImages.length} image(s) uploaded successfully!`);
            setSelectedImages([]);
            setImagePreviews([]);
            setShowAddImageModal(false);

            await fetchAgentProperties();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error uploading images:', err);
            alert('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleEditProperty = (propertyId) => {
        navigate(`/edit-property/${propertyId}`);
    };

    const handleDeleteProperty = async (propertyId) => {
        if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            try {
                await propertyService.deleteProperty(propertyId);
                setSuccess('Property deleted successfully!');
                await fetchAgentProperties();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.error('Error deleting property:', err);
                alert('Failed to delete property');
            }
        }
    };


    const handleLogout = () => {
        logout();
        navigate('/agent-login');
    };

    if (loading) {
        return <div className="agent-dashboard-loading">Loading agent dashboard...</div>;
    }

    return (
        <div className="agent-dashboard-container">
            <div className="agent-dashboard-header">
                <div className="dashboard-title">
                    <h1>🏢 Agent Dashboard</h1>
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

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{stats.totalProperties}</h3>
                        <p>Total Properties</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <h3>{stats.activeListings}</h3>
                        <p>For Sale</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏠</div>
                    <div className="stat-info">
                        <h3>{stats.rentListings}</h3>
                        <p>For Rent</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Your Properties</h2>
                    <p>{properties.length} properties in your portfolio</p>
                </div>

                {properties.length === 0 ? (
                    <div className="no-properties">
                        <p>No properties yet. Start by adding your first property!</p>
                        <button
                            className="btn-add-first-property"
                            onClick={() => navigate('/add-property')}
                        >
                            ➕ Add Your First Property
                        </button>
                    </div>
                ) : (
                    <div className="properties-grid">
                        {properties.map((property) => (
                            <div key={property.id} className="property-card-wrapper">
                                <PropertyCard
                                    property={property}
                                    userId={user.id}
                                    showFavoriteButton={false}
                                />
                                <div className="property-actions">
                                    <button
                                        className="btn-action btn-images"
                                        onClick={() => handleAddImages(property)}
                                    >
                                        📸 Add/Edit Images
                                    </button>
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() => handleEditProperty(property.id)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        className="btn-action btn-delete"
                                        onClick={() => handleDeleteProperty(property.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Images Modal */}
            {showAddImageModal && (
                <div className="modal-overlay" onClick={() => setShowAddImageModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Images to {selectedProperty?.title}</h2>
                            <button className="close-btn" onClick={() => setShowAddImageModal(false)}>✕</button>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="image-file-input"
                        />

                        <div className="selected-images-preview">
                            {imagePreviews.length === 0 && <div className="no-images">No images selected</div>}
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-preview">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                    <button
                                        className="remove-image-btn"
                                        onClick={() => removeImage(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={handleUploadImages}
                                className="btn-upload"
                                disabled={uploadingImages}
                            >
                                {uploadingImages ? 'Uploading...' : 'Upload Images'}
                            </button>
                            <button
                                onClick={() => setShowAddImageModal(false)}
                                className="btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDashboard;

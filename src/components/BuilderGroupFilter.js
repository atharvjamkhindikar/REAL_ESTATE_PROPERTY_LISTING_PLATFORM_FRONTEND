import React, { useState, useEffect, useCallback } from 'react';
import { builderGroupService } from '../services/api';
import PropertyCard from './PropertyCard';
import { useAuth } from '../context/AuthContext';
import './BuilderGroupFilter.css';

const BuilderGroupFilter = () => {
    const { isAdmin } = useAuth();

    // ...existing code...
    const [builderGroups, setBuilderGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Properties State
    const [properties, setProperties] = useState([]);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Management State
    const [showManagementPanel, setShowManagementPanel] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true
    });

    // Image Management State
    const [groupImage, setGroupImage] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    // Property Management State
    const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
    const [availableProperties, setAvailableProperties] = useState([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');

    // Fetch all active builder groups
    const fetchBuilderGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await builderGroupService.getActiveBuilderGroups();
            const groups = response.data.data || response.data;
            setBuilderGroups(Array.isArray(groups) ? groups : []);
        } catch (err) {
            setError('Failed to fetch builder groups.');
            console.error('Error:', err);
            setBuilderGroups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch properties for selected builder group
    const fetchGroupProperties = useCallback(async () => {
        if (!selectedGroup) return;

        try {
            setPropertiesLoading(true);
            setError(null);

            const response = await builderGroupService.getBuilderGroupProperties(
                selectedGroup.id,
                page,
                12
            );

            const data = response.data.data || response.data;
            if (data.content) {
                setProperties(data.content);
                setTotalPages(data.totalPages || 0);
            } else if (Array.isArray(data)) {
                setProperties(data);
                setTotalPages(1);
            }
        } catch (err) {
            setError('Failed to fetch properties.');
            console.error('Error:', err);
            setProperties([]);
        } finally {
            setPropertiesLoading(false);
        }
    }, [selectedGroup, page]);

    // Fetch builder group image from localStorage
    const fetchGroupImage = useCallback(async (groupId) => {
        try {
            // Get image from localStorage where it's stored
            const imageUrl = localStorage.getItem(`builderGroup_image_${groupId}`);
            setGroupImage(imageUrl || null);
        } catch (err) {
            console.error('Error fetching group image:', err);
            setGroupImage(null);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchBuilderGroups();
    }, [fetchBuilderGroups]);

    // Load properties and image when group selected
    useEffect(() => {
        if (selectedGroup) {
            setPage(0);
            fetchGroupProperties();
            fetchGroupImage(selectedGroup.id);
        }
    }, [selectedGroup, fetchGroupProperties, fetchGroupImage]);

    // Load properties on page change
    useEffect(() => {
        fetchGroupProperties();
    }, [page, fetchGroupProperties, selectedGroup]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Validate form
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Builder group name is required');
            return false;
        }
        return true;
    };

    // Create builder group
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

        try {
            await builderGroupService.createBuilderGroup(formData);
            setSuccess('Builder group created successfully!');
            setFormData({
                name: '',
                description: '',
                active: true
            });
            setShowManagementPanel(false);
            await fetchBuilderGroups();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to create builder group';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Update builder group
    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

        try {
            const response = await builderGroupService.updateBuilderGroup(
                editingGroupId,
                formData
            );
            setSuccess('Builder group updated successfully!');
            resetForm();
            setShowManagementPanel(false);
            await fetchBuilderGroups();
            if (selectedGroup && selectedGroup.id === editingGroupId) {
                setSelectedGroup(response.data.data || response.data);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update builder group';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Delete builder group
    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm('Are you sure you want to delete this builder group?')) {
            return;
        }

        try {
            await builderGroupService.deleteBuilderGroup(groupId);
            setSuccess('Builder group deleted successfully!');
            if (selectedGroup && selectedGroup.id === groupId) {
                setSelectedGroup(null);
                setProperties([]);
            }
            await fetchBuilderGroups();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete builder group';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Edit builder group
    const handleEditGroup = (group) => {
        setEditingGroupId(group.id);
        setFormData({
            name: group.name,
            description: group.description || '',
            active: group.active
        });
        setShowManagementPanel(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            active: true
        });
        setEditingGroupId(null);
    };

    // Close management panel
    const handleClosePanel = () => {
        setShowManagementPanel(false);
        resetForm();
    };

    // Handle image file selection
    const handleImageFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setSelectedImageFile(file);
            setError(null);
        } else {
            setError('Please select a valid image file');
        }
    };

    // Upload builder group image (Admin only)
    const handleUploadGroupImage = async (e) => {
        e.preventDefault();
        if (!selectedImageFile || !selectedGroup) return;

        setUploadingImage(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedImageFile);

            await builderGroupService.uploadBuilderGroupImage(selectedGroup.id, formData);
            setSuccess('Group image uploaded successfully!');
            setSelectedImageFile(null);
            setShowImageUpload(false);
            await fetchGroupImage(selectedGroup.id);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to upload image';
            setError(errorMsg);
            console.error('Error:', err);
        } finally {
            setUploadingImage(false);
        }
    };

    // Delete builder group image (Admin only)
    const handleDeleteGroupImage = async () => {
        if (!window.confirm('Are you sure you want to delete this group image?')) return;

        try {
            await builderGroupService.deleteBuilderGroupImage(selectedGroup.id);
            setSuccess('Group image deleted successfully!');
            setGroupImage(null);
            await fetchBuilderGroups(); // Refresh groups list
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete image';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Add property to builder group (Admin only)
    const handleAddPropertyToGroup = async () => {
        if (!selectedPropertyId || !selectedGroup) {
            setError('Please select a property');
            return;
        }

        try {
            await builderGroupService.addPropertyToGroup(selectedGroup.id, selectedPropertyId);
            setSuccess('Property added to builder group successfully!');
            setSelectedPropertyId('');
            setShowAddPropertyModal(false);
            await fetchGroupProperties();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add property';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    // Remove property from builder group (Admin only)
    const handleRemovePropertyFromGroup = async (propertyId) => {
        if (!window.confirm('Remove this property from the builder group?')) return;

        try {
            await builderGroupService.removePropertyFromGroup(selectedGroup.id, propertyId);
            setSuccess('Property removed from builder group!');
            await fetchGroupProperties();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to remove property';
            setError(errorMsg);
            console.error('Error:', err);
        }
    };

    return (
        <div className="builder-group-filter-container">
            <div className="header">
                <h1>🏢 Builder Groups & Properties</h1>
                <p>Browse properties from our partner builders</p>
                {isAdmin() && (
                    <button
                        className="btn-manage"
                        onClick={() => {
                            resetForm();
                            setShowManagementPanel(true);
                        }}
                    >
                        ⚙️ Manage Groups
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <span>✓ {success}</span>
                    <button onClick={() => setSuccess(null)}>×</button>
                </div>
            )}

            {/* Management Panel */}
            {isAdmin() && showManagementPanel && (
                <div className="management-panel">
                    <div className="panel-content">
                        <h2>{editingGroupId ? '✎ Edit Builder Group' : '➕ Create New Builder Group'}</h2>
                        <form onSubmit={editingGroupId ? handleUpdateGroup : handleCreateGroup}>
                            <div className="form-group">
                                <label>Group Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Shapoorji Pallonji"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Builder group description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group checkbox">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                    id="active-checkbox"
                                />
                                <label htmlFor="active-checkbox">Active</label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleClosePanel}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingGroupId ? 'Update Group' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Builder Groups Section */}
            <div className="groups-section">
                <h2>Available Builder Groups</h2>

                {loading ? (
                    <div className="loading">Loading builder groups...</div>
                ) : builderGroups.length === 0 ? (
                    <div className="no-data">
                        <p>No builder groups available</p>
                    </div>
                ) : (
                    <div className="groups-grid">
                        {builderGroups.map((group) => (
                            <div
                                key={group.id}
                                className={`group-card ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                onClick={() => setSelectedGroup(group)}
                            >
                                <div className="group-header">
                                    <h3>{group.name}</h3>
                                    {isAdmin() && (
                                        <div className="group-actions">
                                            <button
                                                className="btn-icon edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditGroup(group);
                                                }}
                                                title="Edit"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteGroup(group.id);
                                                }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="group-image-placeholder">
                                    {localStorage.getItem(`builderGroup_image_${group.id}`) ? (
                                        <img src={localStorage.getItem(`builderGroup_image_${group.id}`)} alt={group.name} />
                                    ) : (
                                        <div className="no-image">📷 No Image</div>
                                    )}
                                </div>
                                {group.description && (
                                    <p className="group-description">{group.description}</p>
                                )}
                                <div className="group-footer">
                                    <span className="property-count">
                                        {group.propertyCount || 0} properties
                                    </span>
                                    {group.active ? (
                                        <span className="badge badge-active">Active</span>
                                    ) : (
                                        <span className="badge badge-inactive">Inactive</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Properties Section */}
            {selectedGroup && (
                <>
                    {/* Admin: Group Image Management */}
                    {isAdmin() && (
                        <div className="admin-section">
                            <div className="image-management">
                                <h3>📸 Group Image</h3>
                                <div className="image-display">
                                    {groupImage ? (
                                        <>
                                            <img src={groupImage} alt={selectedGroup.name} />
                                            <div className="image-actions">
                                                <button
                                                    className="btn-danger"
                                                    onClick={handleDeleteGroupImage}
                                                >
                                                    Delete Image
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="no-image-placeholder">
                                            <p>No image for this builder group</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="btn-upload"
                                    onClick={() => setShowImageUpload(!showImageUpload)}
                                >
                                    {showImageUpload ? 'Cancel' : 'Upload Image'}
                                </button>

                                {showImageUpload && (
                                    <div className="upload-form">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageFileSelect}
                                        />
                                        {selectedImageFile && (
                                            <div className="file-info">
                                                {selectedImageFile.name}
                                            </div>
                                        )}
                                        <button
                                            className="btn-primary"
                                            onClick={handleUploadGroupImage}
                                            disabled={!selectedImageFile || uploadingImage}
                                        >
                                            {uploadingImage ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Admin: Add Property to Group */}
                            <div className="property-management">
                                <h3>➕ Add Property to Group</h3>
                                <button
                                    className="btn-primary"
                                    onClick={() => setShowAddPropertyModal(true)}
                                >
                                    Add Property
                                </button>

                                {showAddPropertyModal && (
                                    <div className="modal-overlay" onClick={() => setShowAddPropertyModal(false)}>
                                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                            <div className="modal-header">
                                                <h3>Add Property to {selectedGroup.name}</h3>
                                                <button
                                                    className="close-btn"
                                                    onClick={() => setShowAddPropertyModal(false)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <label>Property ID:</label>
                                                <input
                                                    type="number"
                                                    value={selectedPropertyId}
                                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                                    placeholder="Enter property ID"
                                                />
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => setShowAddPropertyModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn-primary"
                                                    onClick={handleAddPropertyToGroup}
                                                >
                                                    Add Property
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Properties Section */}
                    <div className="properties-section">
                        <div className="section-header">
                            <h2>Properties from {selectedGroup.name}</h2>
                            <span className="property-count">{properties.length} properties</span>
                        </div>

                        {propertiesLoading ? (
                            <div className="loading">Loading properties...</div>
                        ) : properties.length === 0 ? (
                            <div className="no-data">
                                <p>No properties available for this builder group</p>
                            </div>
                        ) : (
                            <>
                                <div className="properties-grid">
                                    {properties.map((property) => (
                                        <div key={property.id} className="property-wrapper">
                                            <PropertyCard
                                                property={property}
                                                showFavoriteButton={true}
                                            />
                                            {isAdmin() && (
                                                <button
                                                    className="btn-remove-property"
                                                    onClick={() => handleRemovePropertyFromGroup(property.id)}
                                                    title="Remove from group"
                                                >
                                                    🗑️ Remove from Group
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 0}
                                            className="btn-page"
                                        >
                                            ← Previous
                                        </button>
                                        <span className="page-info">
                                            Page {page + 1} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === totalPages - 1}
                                            className="btn-page"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default BuilderGroupFilter;

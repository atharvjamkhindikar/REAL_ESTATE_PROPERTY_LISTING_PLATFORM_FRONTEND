import React, { useState, useEffect, useCallback } from 'react';
import { propertyImageService } from '../services/api';
import './PropertyImageUploader.css';

const PropertyImageUploader = ({ propertyId, onImagesUpdated }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Upload state
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    // Edit state
    const [editingImageId, setEditingImageId] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);

    // Reorder state
    const [reorderMode, setReorderMode] = useState(false);
    const [reorderedImages, setReorderedImages] = useState([]);

    // Fetch property images
    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await propertyImageService.getPropertyImages(propertyId);
            const imagesList = response.data.data || response.data;
            setImages(Array.isArray(imagesList) ? imagesList : []);

            if (onImagesUpdated) {
                onImagesUpdated(Array.isArray(imagesList) ? imagesList : []);
            }
        } catch (err) {
            setError('Failed to fetch images');
            console.error('Error:', err);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, [propertyId, onImagesUpdated]);

    // Initial fetch
    useEffect(() => {
        if (propertyId) {
            fetchImages();
        }
    }, [fetchImages, propertyId]);

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    // Process files for upload
    const processFiles = async (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            setError('Please select image files');
            return;
        }

        setError(null);
        setSuccess(null);

        // Create preview URLs for local display
        const newUploads = imageFiles.map((file, index) => ({
            id: `temp-${Date.now()}-${index}`,
            file,
            previewUrl: URL.createObjectURL(file),
            caption: '',
            isPrimary: false,
            uploading: true
        }));

        setUploadingFiles(prev => [...prev, ...newUploads]);

        // Upload each file
        for (const upload of newUploads) {
            try {
                await uploadImage(upload);
            } catch (err) {
                console.error('Upload failed:', err);
                setUploadingFiles(prev =>
                    prev.filter(u => u.id !== upload.id)
                );
            }
        }
    };

    // Upload single image
    const uploadImage = async (upload) => {
        try {
            const formData = new FormData();
            formData.append('file', upload.file);
            formData.append('caption', upload.caption);
            formData.append('isPrimary', upload.isPrimary);
            formData.append('displayOrder', images.length + uploadingFiles.length);

            const response = await propertyImageService.addImage(propertyId, formData);

            setSuccess('Image uploaded successfully!');
            setUploadingFiles(prev =>
                prev.filter(u => u.id !== upload.id)
            );

            // Refresh images
            await fetchImages();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to upload image';
            setError(errorMsg);
            console.error('Error:', err);

            // Remove from uploading list on error
            setUploadingFiles(prev =>
                prev.filter(u => u.id !== upload.id)
            );
        }
    };

    // Delete image
    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            await propertyImageService.deleteImage(propertyId, imageId);
            setSuccess('Image deleted successfully!');
            await fetchImages();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to delete image');
            console.error('Error:', err);
        }
    };

    // Set primary image
    const handleSetPrimary = async (imageId) => {
        try {
            await propertyImageService.setPrimaryImage(propertyId, imageId);
            setSuccess('Primary image updated!');
            await fetchImages();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to set primary image');
            console.error('Error:', err);
        }
    };

    // Start editing caption
    const handleEditCaption = (image) => {
        setEditingImageId(image.id);
        setEditCaption(image.caption || '');
        setShowEditForm(true);
    };

    // Save caption
    const handleSaveCaption = async () => {
        if (!editingImageId) return;

        try {
            const imageData = {
                imageUrl: images.find(img => img.id === editingImageId)?.imageUrl,
                caption: editCaption,
                isPrimary: images.find(img => img.id === editingImageId)?.isPrimary
            };

            await propertyImageService.updateImage(propertyId, editingImageId, imageData);
            setSuccess('Caption updated!');
            setShowEditForm(false);
            setEditingImageId(null);
            setEditCaption('');
            await fetchImages();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to update caption');
            console.error('Error:', err);
        }
    };

    // Start reorder mode
    const handleStartReorder = () => {
        setReorderedImages([...images]);
        setReorderMode(true);
    };

    // Move image in reorder
    const handleMoveImage = (index, direction) => {
        const newImages = [...reorderedImages];
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < newImages.length) {
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            setReorderedImages(newImages);
        }
    };

    // Save reorder
    const handleSaveReorder = async () => {
        try {
            const imageIds = reorderedImages.map(img => img.id);
            await propertyImageService.reorderImages(propertyId, imageIds);
            setSuccess('Images reordered successfully!');
            setReorderMode(false);
            await fetchImages();
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Failed to reorder images');
            console.error('Error:', err);
        }
    };

    // Cancel reorder
    const handleCancelReorder = () => {
        setReorderMode(false);
        setReorderedImages([]);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="property-image-uploader">
            <div className="uploader-header">
                <h2>📷 Property Images</h2>
                <p>Upload, manage, and organize your property photos</p>
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

            {/* Upload Area */}
            <div className="upload-section">
                <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="image-input"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="image-input" className="upload-label">
                        <div className="upload-icon">📸</div>
                        <p>Drop images here or click to upload</p>
                        <span>Supported formats: JPG, PNG, GIF, WebP</span>
                    </label>
                </div>
            </div>

            {/* Loading State */}
            {loading && !images.length ? (
                <div className="loading">Loading images...</div>
            ) : null}

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="uploading-section">
                    <h3>Uploading...</h3>
                    <div className="uploading-grid">
                        {uploadingFiles.map((upload) => (
                            <div key={upload.id} className="uploading-item">
                                <img src={upload.previewUrl} alt="uploading" />
                                <div className="uploading-progress">
                                    <span className="spinner"></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Caption Modal */}
            {showEditForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>✏️ Edit Caption</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingImageId(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Image Caption</label>
                                <textarea
                                    value={editCaption}
                                    onChange={(e) => setEditCaption(e.target.value)}
                                    placeholder="Enter image caption or description"
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingImageId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveCaption}
                                >
                                    Save Caption
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="images-section">
                    <div className="section-header">
                        <h3>Your Images ({images.length})</h3>
                        {!reorderMode && (
                            <button
                                className="btn-reorder"
                                onClick={handleStartReorder}
                            >
                                🔄 Reorder
                            </button>
                        )}
                    </div>

                    {/* Reorder Mode */}
                    {reorderMode && (
                        <div className="reorder-controls">
                            <p>Drag images to reorder or use arrow buttons</p>
                            <div className="reorder-actions">
                                <button
                                    className="btn-save"
                                    onClick={handleSaveReorder}
                                >
                                    ✓ Save Order
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={handleCancelReorder}
                                >
                                    ✗ Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Images Display */}
                    <div className={`images-grid ${reorderMode ? 'reorder-mode' : ''}`}>
                        {(reorderMode ? reorderedImages : images).map((image, index) => (
                            <div
                                key={image.id}
                                className={`image-card ${image.isPrimary ? 'primary' : ''}`}
                            >
                                <div className="image-container">
                                    <img src={image.imageUrl} alt={image.caption} />

                                    {image.isPrimary && (
                                        <div className="primary-badge">★ Primary</div>
                                    )}

                                    {reorderMode && (
                                        <div className="reorder-controls-inline">
                                            <button
                                                className="btn-arrow"
                                                onClick={() => handleMoveImage(index, -1)}
                                                disabled={index === 0}
                                                title="Move up"
                                            >
                                                ⬆️
                                            </button>
                                            <span className="order-number">{index + 1}</span>
                                            <button
                                                className="btn-arrow"
                                                onClick={() => handleMoveImage(index, 1)}
                                                disabled={index === reorderedImages.length - 1}
                                                title="Move down"
                                            >
                                                ⬇️
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!reorderMode && (
                                    <>
                                        <div className="image-info">
                                            {image.caption && (
                                                <p className="caption">{image.caption}</p>
                                            )}
                                            <p className="date">
                                                Uploaded: {formatDate(image.uploadedAt)}
                                            </p>
                                        </div>

                                        <div className="image-actions">
                                            <button
                                                className={`btn-action ${image.isPrimary ? 'active' : ''}`}
                                                onClick={() => handleSetPrimary(image.id)}
                                                title="Set as primary"
                                            >
                                                ★ Primary
                                            </button>
                                            <button
                                                className="btn-action edit"
                                                onClick={() => handleEditCaption(image)}
                                                title="Edit caption"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDeleteImage(image.id)}
                                                title="Delete image"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && images.length === 0 && uploadingFiles.length === 0 && (
                <div className="no-images">
                    <p>No images yet. Upload some property photos to get started!</p>
                </div>
            )}
        </div>
    );
};

export default PropertyImageUploader;

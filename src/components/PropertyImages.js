import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyImageService, propertyService } from '../services/api';
import './PropertyImages.css';

const PropertyImages = () => {
    const { id: propertyId } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchProperty();
        fetchImages();
    }, [propertyId]);

    const fetchProperty = async () => {
        try {
            const response = await propertyService.getPropertyById(propertyId);
            const apiResponse = response.data;
            setProperty(apiResponse.data || apiResponse);
        } catch (err) {
            setError('Failed to fetch property details.');
            console.error('Error fetching property:', err);
        }
    };

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await propertyImageService.getPropertyImages(propertyId);
            setImages(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch property images.');
            console.error('Error fetching images:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files[0]) {
            setSelectedFile(files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select an image');
            return;
        }

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await propertyImageService.addImage(propertyId, formData);

            if (response.data.success) {
                setSuccess('Image uploaded successfully!');
                setSelectedFile(null);
                await fetchImages();

                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(response.data.message || 'Failed to upload image');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
            console.error('Error uploading image:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await propertyImageService.deleteImage(propertyId, imageId);
            if (response.data.success) {
                setSuccess('Image deleted successfully!');
                await fetchImages();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to delete image');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete image');
            console.error('Error deleting image:', err);
        }
    };

    const handleSetPrimary = async (imageId) => {
        try {
            const response = await propertyImageService.setPrimaryImage(propertyId, imageId);
            if (response.data.success) {
                setSuccess('Primary image updated successfully!');
                await fetchImages();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to set primary image');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set primary image');
            console.error('Error setting primary image:', err);
        }
    };

    if (loading) {
        return <div className="loading">Loading property images...</div>;
    }

    return (
        <div className="property-images-container">
            <button onClick={() => navigate(`/property/${propertyId}`)} className="back-btn">
                ← Back to Property
            </button>

            <div className="images-content">
                <div className="images-header">
                    <h1>Manage Property Images</h1>
                    {property && (
                        <p className="property-name">{property.title}</p>
                    )}
                </div>

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-alert">
                        <span className="success-icon">✓</span>
                        {success}
                    </div>
                )}

                <div className="upload-section">
                    <h2>Upload New Image</h2>
                    <form onSubmit={handleUpload} className="upload-form">
                        <div
                            className={`drop-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <div className="file-selected">
                                    <p className="file-name">📄 {selectedFile.name}</p>
                                    <p className="file-size">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                </div>
                            ) : (
                                <>
                                    <p className="drop-icon">📷</p>
                                    <p className="drop-text">Drag and drop your image here</p>
                                    <p className="drop-or">or</p>
                                </>
                            )}
                            <label htmlFor="file-input" className="file-label">
                                Click to select
                            </label>
                            <input
                                type="file"
                                id="file-input"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <p className="file-requirements">
                            Supported formats: JPG, PNG, GIF, WebP | Max size: 5MB
                        </p>

                        {selectedFile && (
                            <>
                                <button
                                    type="submit"
                                    className="upload-btn"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setSelectedFile(null)}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </form>
                </div>

                <div className="gallery-section">
                    <h2>Property Gallery ({images.length})</h2>

                    {images.length === 0 ? (
                        <div className="no-images">
                            <p>No images uploaded yet. Add your first image above!</p>
                        </div>
                    ) : (
                        <div className="images-grid">
                            {images.map((image) => (
                                <div key={image.id} className="image-card">
                                    <div className="image-wrapper">
                                        <img src={image.imageUrl} alt={image.alt} />
                                        {image.isPrimary && (
                                            <div className="primary-badge">Primary</div>
                                        )}
                                    </div>
                                    <div className="image-actions">
                                        <button
                                            onClick={() => handleSetPrimary(image.id)}
                                            className="set-primary-btn"
                                            disabled={image.isPrimary}
                                            title="Set as primary image"
                                        >
                                            {image.isPrimary ? '⭐ Primary' : '☆ Set Primary'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="delete-btn"
                                            title="Delete image"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyImages;

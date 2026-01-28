import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, contactAgentService, propertyImageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PropertyDetail.css';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);
    const [contactError, setContactError] = useState(null);
    const [contactSuccess, setContactSuccess] = useState(false);

    // Image upload state
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const [contactData, setContactData] = useState({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        subject: '',
        message: '',
        additionalInfo: '',
    });

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            // Handle ApiResponse wrapper: { success: true, data: {...} }
            const apiResponse = response.data;
            setProperty(apiResponse.data || apiResponse);

            // Fetch property images
            fetchPropertyImages(id);
            setError(null);
        } catch (err) {
            setError('Failed to fetch property details.');
            console.error('Error fetching property:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPropertyImages = async (propertyId) => {
        try {
            const response = await propertyImageService.getPropertyImages(propertyId);
            const imageData = response.data.data || response.data;
            const imageArray = Array.isArray(imageData) ? imageData : [];
            setImages(imageArray);
            setCurrentImageIndex(0);
        } catch (err) {
            console.error('Error fetching property images:', err);
            setImages([]);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatListingType = (type) => {
        if (!type) return 'N/A';
        return type === 'FOR_SALE' ? 'For Sale' : 'For Rent';
    };

    const formatPropertyType = (type) => {
        if (!type) return 'N/A';
        return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
    };

    const canEditOrDelete = () => {
        if (!user || !property) return false;
        const isAdmin = user.userType === 'ADMIN' || user.role === 'ADMIN';
        const isAgent = user.userType === 'AGENT' || user.role === 'AGENT';
        const isOwner = property.owner?.id === user.id;
        return isAdmin || isAgent || isOwner;
    };

    const handleEdit = () => {
        navigate(`/edit-property/${id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            return;
        }

        try {
            await propertyService.deleteProperty(id);
            alert('Property deleted successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactLoading(true);
        setContactError(null);
        setContactSuccess(false);

        try {
            await contactAgentService.createContact({
                userId: user?.id || null,
                propertyId: id,
                senderName: contactData.senderName,
                senderEmail: contactData.senderEmail,
                senderPhone: contactData.senderPhone,
                subject: contactData.subject,
                message: contactData.message,
                additionalInfo: contactData.additionalInfo,
            });

            setContactSuccess(true);
            // Reset form
            setContactData({
                senderName: '',
                senderEmail: '',
                senderPhone: '',
                subject: '',
                message: '',
                additionalInfo: '',
            });

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowContactModal(false);
            }, 2000);
        } catch (err) {
            setContactError(err.response?.data?.message || 'Failed to send message. Please try again.');
            console.error('Error contacting agent:', err);
        } finally {
            setContactLoading(false);
        }
    };

    const openContactModal = () => {
        if (user) {
            setContactData(prev => ({
                ...prev,
                senderName: user.firstName + ' ' + user.lastName,
                senderEmail: user.email,
                senderPhone: user.phone,
            }));
        }
        setShowContactModal(true);
    };

    const closeContactModal = () => {
        setShowContactModal(false);
        setContactError(null);
        setContactSuccess(false);
    };

    // Handle image file selection
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Validate files
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

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreviews(prev => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove selected image
    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Upload images to property
    const handleUploadImages = async (e) => {
        e.preventDefault();

        if (selectedImages.length === 0) {
            setUploadError('Please select at least one image');
            return;
        }

        setUploadingImages(true);
        setUploadError(null);
        setUploadSuccess(null);

        try {
            console.log(`Uploading ${selectedImages.length} images to property ${id}`);

            for (let i = 0; i < selectedImages.length; i++) {
                const formData = new FormData();
                formData.append('file', selectedImages[i]);
                formData.append('caption', '');
                formData.append('isPrimary', String(i === 0)); // First image is primary
                formData.append('displayOrder', String(i));

                console.log(`Uploading image ${i + 1}/${selectedImages.length}`);
                try {
                    await propertyImageService.addImage(id, formData);
                    console.log(`Image ${i + 1} uploaded successfully`);
                } catch (uploadErr) {
                    console.warn(`Image ${i + 1} upload failed, trying fallback...`);
                    // Fallback: try with just file
                    const fallbackFormData = new FormData();
                    fallbackFormData.append('file', selectedImages[i]);

                    try {
                        await propertyImageService.addImage(id, fallbackFormData);
                        console.log(`Image ${i + 1} uploaded with fallback`);
                    } catch (fallbackErr) {
                        throw uploadErr;
                    }
                }
            }

            console.log('All images uploaded successfully');
            setUploadSuccess(`${selectedImages.length} image(s) uploaded successfully!`);

            // Clear selected images
            setSelectedImages([]);
            setImagePreviews([]);

            // Refresh property images
            await fetchPropertyImages(id);

            // Close upload section after 2 seconds
            setTimeout(() => {
                setShowImageUpload(false);
            }, 2000);
        } catch (err) {
            console.error('Error uploading images:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to upload images';
            setUploadError(`Error: ${errorMsg}`);
        } finally {
            setUploadingImages(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading property details...</div>;
    }

    if (error || !property) {
        return (
            <div className="error-container">
                <div className="error">{error || 'Property not found'}</div>
                <button onClick={() => navigate('/')} className="back-btn">
                    Back to Listings
                </button>
            </div>
        );
    }

    return (
        <div className="property-detail-container">
            <button onClick={() => navigate('/')} className="back-btn">
                ← Back to Listings
            </button>
            
            <div className="property-detail">
                <div className="detail-image">
                    {images.length > 0 ? (
                        <>
                            <img src={images[currentImageIndex].imageUrl} alt={property.title} />
                            {images.length > 1 && (
                                <>
                                    <button
                                        className="image-nav-btn prev"
                                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                        title="Previous image"
                                    >
                                        ❮
                                    </button>
                                    <button
                                        className="image-nav-btn next"
                                        onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                        title="Next image"
                                    >
                                        ❯
                                    </button>
                                    <div className="image-counter">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="no-image">
                            <div>📸 No Images Available</div>
                            {user && user.role === 'AGENT' && (
                                <button
                                    className="add-images-btn"
                                    onClick={() => setShowImageUpload(true)}
                                >
                                    + Add Images to This Property
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="detail-content">
                    <div className="detail-header">
                        <h1>{property.title}</h1>
                        <div className="price-badge">{formatPrice(property.price)}</div>
                    </div>
                    
                    <div className="listing-status">
                        <span className="status-badge">{formatListingType(property.listingType)}</span>
                        <span className="type-badge">{formatPropertyType(property.propertyType)}</span>
                    </div>
                    
                    <div className="detail-address">
                        <h3>📍 Location</h3>
                        <p>{property.address}</p>
                        <p>{property.city}, {property.state} {property.zipCode}</p>
                    </div>
                    
                    <div className="detail-features">
                        <h3>Features</h3>
                        <div className="features-grid">
                            <div className="feature-item">
                                <strong>Bedrooms:</strong> {property.bedrooms}
                            </div>
                            <div className="feature-item">
                                <strong>Bathrooms:</strong> {property.bathrooms}
                            </div>
                            <div className="feature-item">
                                <strong>Square Feet:</strong> {property.squareFeet}
                            </div>
                            {property.yearBuilt && (
                                <div className="feature-item">
                                    <strong>Year Built:</strong> {property.yearBuilt}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{property.description}</p>
                    </div>
                    
                    <div className="contact-section">
                        <Link to={`/schedule-viewing/${property.id}`} className="schedule-btn">
                            📅 Schedule Viewing
                        </Link>
                        {user && user.role === 'AGENT' && (
                            <Link to={`/property-images/${property.id}`} className="images-btn">
                                📸 Manage Images
                            </Link>
                        )}
                        <button onClick={openContactModal} className="contact-btn">
                            📞 Contact Agent
                        </button>
                    </div>

                    {/* Edit/Delete buttons for owner/agent */}
                    {canEditOrDelete() && (
                        <div className="edit-delete-buttons">
                            <button onClick={handleEdit} className="edit-btn">
                                ✏️ Edit Property
                            </button>
                            <button onClick={handleDelete} className="delete-btn">
                                🗑️ Delete Property
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Agent Modal */}
            {showContactModal && (
                <div className="modal-overlay" onClick={closeContactModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Contact Agent</h2>
                            <button className="close-btn" onClick={closeContactModal}>✕</button>
                        </div>

                        {contactSuccess && (
                            <div className="success-message">
                                ✅ Message sent successfully! We'll get back to you soon.
                            </div>
                        )}

                        {contactError && (
                            <div className="error-message">
                                ⚠️ {contactError}
                            </div>
                        )}

                        <form onSubmit={handleContactSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="senderName">Name *</label>
                                <input
                                    type="text"
                                    id="senderName"
                                    name="senderName"
                                    value={contactData.senderName}
                                    onChange={handleContactChange}
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="senderEmail">Email *</label>
                                    <input
                                        type="email"
                                        id="senderEmail"
                                        name="senderEmail"
                                        value={contactData.senderEmail}
                                        onChange={handleContactChange}
                                        placeholder="Your email"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="senderPhone">Phone *</label>
                                    <input
                                        type="tel"
                                        id="senderPhone"
                                        name="senderPhone"
                                        value={contactData.senderPhone}
                                        onChange={handleContactChange}
                                        placeholder="Your phone"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={contactData.subject}
                                    onChange={handleContactChange}
                                    placeholder="What is this about?"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={contactData.message}
                                    onChange={handleContactChange}
                                    placeholder="Your message"
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="additionalInfo">Additional Information</label>
                                <textarea
                                    id="additionalInfo"
                                    name="additionalInfo"
                                    value={contactData.additionalInfo}
                                    onChange={handleContactChange}
                                    placeholder="Any additional details (preferred viewing times, address, etc.)"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="modal-buttons">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={contactLoading}
                                >
                                    {contactLoading ? 'Sending...' : 'Send Message'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeContactModal}
                                    disabled={contactLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Upload Section (for AGENT role) */}
            {user && user.role === 'AGENT' && showImageUpload && (
                <div className="image-upload-overlay" onClick={() => setShowImageUpload(false)}>
                    <div className="image-upload-content" onClick={(e) => e.stopPropagation()}>
                        <div className="image-upload-header">
                            <h2>Upload Property Images</h2>
                            <button className="close-btn" onClick={() => setShowImageUpload(false)}>✕</button>
                        </div>

                        {uploadSuccess && (
                            <div className="success-message">
                                ✅ {uploadSuccess}
                            </div>
                        )}

                        {uploadError && (
                            <div className="error-message">
                                ⚠️ {uploadError}
                            </div>
                        )}

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
                                        title="Remove image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="image-upload-buttons">
                            <button
                                onClick={handleUploadImages}
                                className="upload-btn"
                                disabled={uploadingImages}
                            >
                                {uploadingImages ? 'Uploading...' : 'Upload Images'}
                            </button>
                            <button
                                onClick={() => setShowImageUpload(false)}
                                className="cancel-upload-btn"
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

export default PropertyDetail;

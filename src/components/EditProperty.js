import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService, propertyImageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EditProperty.css';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        propertyType: 'HOUSE',
        listingType: 'FOR_SALE',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        yearBuilt: '',
        available: true,
    });

    // Image URL state
    const [imageUrls, setImageUrls] = useState(['']);
    const [existingImages, setExistingImages] = useState([]);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getPropertyById(id);
            const property = response.data.data || response.data;

            // Check if user can edit (Admin, Agent, or Owner)
            const isAdmin = user?.userType === 'ADMIN';
            const isAgent = user?.userType === 'AGENT';
            const isOwner = property.owner?.id === user?.id;

            if (!isAdmin && !isAgent && !isOwner) {
                alert('You do not have permission to edit this property');
                navigate('/');
                return;
            }

            setCanEdit(true);

            setFormData({
                title: property.title || '',
                description: property.description || '',
                price: property.price || '',
                address: property.address || '',
                city: property.city || '',
                state: property.state || '',
                zipCode: property.zipCode || '',
                propertyType: property.propertyType || 'HOUSE',
                listingType: property.listingType || 'FOR_SALE',
                bedrooms: property.bedrooms || '',
                bathrooms: property.bathrooms || '',
                squareFeet: property.squareFeet || '',
                yearBuilt: property.yearBuilt || '',
                available: property.available !== undefined ? property.available : true,
            });

            // Fetch existing images
            const imagesResponse = await propertyImageService.getPropertyImages(id);
            const images = imagesResponse.data.data || imagesResponse.data || [];
            setExistingImages(images);
        } catch (err) {
            console.error('Error fetching property:', err);
            alert('Failed to load property details');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleImageUrlChange = (index, value) => {
        setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
    };

    const addImageUrlField = () => {
        setImageUrls((prev) => [...prev, '']);
    };

    const removeImageUrlField = (index) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const normalizeUrlList = () => {
        return imageUrls
            .map((u) => (u || '').trim())
            .filter((u) => u.length > 0);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
        if (!formData.bedrooms || formData.bedrooms < 1) newErrors.bedrooms = 'Valid number of bedrooms is required';
        if (!formData.bathrooms || formData.bathrooms < 1) newErrors.bathrooms = 'Valid number of bathrooms is required';
        if (!formData.squareFeet || formData.squareFeet <= 0) newErrors.squareFeet = 'Valid square footage is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const uploadNewImages = async (propertyId) => {
        const urls = normalizeUrlList();
        if (urls.length === 0) return;

        try {
            const currentMaxOrder = existingImages.length;
            for (let i = 0; i < urls.length; i++) {
                const payload = {
                    imageUrl: urls[i],
                    caption: '',
                    isPrimary: existingImages.length === 0 && i === 0,
                    displayOrder: currentMaxOrder + i,
                };
                await propertyImageService.addImage(propertyId, payload);
            }
        } catch (err) {
            console.error('Error uploading new images:', err);
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            console.log('Updating property...');

            await propertyService.updateProperty(id, formData);

            // Upload new images if any
            const urls = normalizeUrlList();
            if (urls.length > 0) {
                await uploadNewImages(id);
            }

            alert('Property updated successfully!');
            navigate('/agent-dashboard');
        } catch (err) {
            console.error('Error updating property:', err);
            alert('Failed to update property. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            await propertyImageService.deleteImage(id, imageId);
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
            alert('Image deleted successfully');
        } catch (err) {
            console.error('Error deleting image:', err);
            alert('Failed to delete image');
        }
    };

    if (loading) {
        return <div className="loading">⏳ Loading property...</div>;
    }

    if (!canEdit) {
        return <div className="error">❌ You do not have permission to edit this property</div>;
    }

    return (
        <div className="edit-property-container">
            <button onClick={() => navigate(-1)} className="back-btn">
                ← Back
            </button>

            <div className="form-container">
                <h1>Edit Property</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Beautiful Family Home"
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the property..."
                            rows="4"
                        />
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Price (INR) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="5000000"
                            />
                            {errors.price && <span className="error-text">{errors.price}</span>}
                        </div>

                        <div className="form-group">
                            <label>Property Type *</label>
                            <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
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
                            <select name="listingType" value={formData.listingType} onChange={handleChange}>
                                <option value="FOR_SALE">For Sale</option>
                                <option value="FOR_RENT">For Rent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main Street"
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Mumbai"
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Maharashtra"
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>

                        <div className="form-group">
                            <label>Zip Code *</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="400001"
                            />
                            {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Bedrooms *</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                placeholder="3"
                            />
                            {errors.bedrooms && <span className="error-text">{errors.bedrooms}</span>}
                        </div>

                        <div className="form-group">
                            <label>Bathrooms *</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                placeholder="2"
                            />
                            {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}
                        </div>

                        <div className="form-group">
                            <label>Square Feet *</label>
                            <input
                                type="number"
                                name="squareFeet"
                                value={formData.squareFeet}
                                onChange={handleChange}
                                placeholder="2000"
                            />
                            {errors.squareFeet && <span className="error-text">{errors.squareFeet}</span>}
                        </div>

                        <div className="form-group">
                            <label>Year Built</label>
                            <input
                                type="number"
                                name="yearBuilt"
                                value={formData.yearBuilt}
                                onChange={handleChange}
                                placeholder="2020"
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleChange}
                            />
                            Available for listing
                        </label>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="existing-images-section">
                            <h3>📸 Existing Images</h3>
                            <div className="images-grid">
                                {existingImages.map((image, index) => (
                                    <div key={image.id || index} className="image-item">
                                        <img src={image.imageUrl} alt={`Property ${index + 1}`} />
                                        {image.isPrimary && <span className="primary-badge">Primary</span>}
                                        <button
                                            type="button"
                                            className="delete-image-btn"
                                            onClick={() => handleDeleteImage(image.id)}
                                            title="Delete image"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add New Images */}
                    <div className="image-upload-section">
                        <h3>🖼️ Add New Images (Paste URLs)</h3>
                        <div className="url-list">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="url-row">
                                    <input
                                        type="url"
                                        value={url}
                                        placeholder="https://example.com/property-image.jpg"
                                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="url-remove-btn"
                                        onClick={() => removeImageUrlField(index)}
                                        disabled={imageUrls.length === 1}
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="url-add-btn" onClick={addImageUrlField}>
                            ➕ Add another image URL
                        </button>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Updating...' : 'Update Property'}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProperty;

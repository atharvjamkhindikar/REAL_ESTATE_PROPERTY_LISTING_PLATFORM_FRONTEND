import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService, propertyImageService } from '../services/api';
import './AddProperty.css';

const AddProperty = () => {
    const navigate = useNavigate();
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

    // Image upload state (FILES - optional if backend supports multipart)
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Image URL state (PRIMARY FIX - backend requires imageUrl)
    const [imageUrls, setImageUrls] = useState(['']);

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
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

    const uploadImages = async (propertyId) => {
        if (!propertyId) {
            console.error('No property ID provided for image upload');
            alert('Property created but image upload failed: Invalid property ID');
            navigate('/');
            return;
        }

        if (selectedImages.length === 0) return;

        setUploadingImages(true);
        try {
            console.log(`Uploading ${selectedImages.length} images for property ${propertyId}`);

            for (let i = 0; i < selectedImages.length; i++) {
                const formData = new FormData();
                formData.append('file', selectedImages[i]);
                formData.append('caption', '');
                formData.append('isPrimary', String(i === 0)); // Convert to string
                formData.append('displayOrder', String(i)); // Convert to string

                console.log(`Uploading image ${i + 1}/${selectedImages.length}`);
                try {
                    await propertyImageService.addImage(propertyId, formData);
                    console.log(`Image ${i + 1} uploaded successfully`);
                } catch (uploadErr) {
                    console.warn(`Image ${i + 1} upload with all fields failed, trying with file only...`);
                    // Fallback: try uploading with just file if fields cause issues
                    const fallbackFormData = new FormData();
                    fallbackFormData.append('file', selectedImages[i]);

                    try {
                        await propertyImageService.addImage(propertyId, fallbackFormData);
                        console.log(`Image ${i + 1} uploaded successfully with fallback`);
                    } catch (fallbackErr) {
                        // Re-throw the fallback error (more accurate) so outer catch can handle it
                        throw fallbackErr;
                    }
                }
            }

            console.log('All images uploaded successfully');
            alert('Property and images added successfully!');

            // Clear images after successful upload
            setSelectedImages([]);
            setImagePreviews([]);

            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            console.error('Error uploading images:', err);
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.response?.statusText);
            console.error('Error data:', err.response?.data);
            console.error('Full error:', JSON.stringify(err, null, 2));

            const errorMsg = err.response?.data?.message || err.response?.statusText || err.message;
            const statusCode = err.response?.status || 'Unknown';

            alert(`Images failed to upload (Error ${statusCode}): ${errorMsg}. Property was created successfully. You can add images later from the property detail page.`);
            navigate('/');
        } finally {
            setUploadingImages(false);
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
        // Trim and remove empty strings
        return imageUrls
            .map((u) => (u || '').trim())
            .filter((u) => u.length > 0);
    };

    const uploadImagesByUrl = async (propertyId) => {
        const urls = normalizeUrlList();
        if (!propertyId || urls.length === 0) return;

        setUploadingImages(true);
        try {
            for (let i = 0; i < urls.length; i++) {
                const payload = {
                    imageUrl: urls[i],
                    caption: '',
                    isPrimary: i === 0,
                    displayOrder: i,
                };
                await propertyImageService.addImage(propertyId, payload);
            }
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            console.log('Creating property...');

            const response = await propertyService.createProperty(formData);
            console.log('Property creation response:', response.data);

            // Extract property ID from ApiResponse
            const created = response.data?.data || response.data;
            const propertyId = created?.id;

            console.log('Extracted property ID:', propertyId);

            // Primary path: upload by URL (backend requires imageUrl)
            const urls = normalizeUrlList();
            if (urls.length > 0) {
                await uploadImagesByUrl(propertyId);
                alert('Property and images added successfully!');
                navigate('/');
                return;
            }

            // Fallback: if you selected files, try multipart upload (only works if backend supports it)
            if (selectedImages.length > 0) {
                await uploadImages(propertyId);
                return;
            }

            alert('Property added successfully!');
            navigate('/');
        } catch (err) {
            console.error('Error creating property:', err);
            console.error('Error details:', err.response?.data || err.message);
            alert('Failed to add property. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-property-container">
            <button onClick={() => navigate('/')} className="back-btn">
                ← Back to Listings
            </button>
            
            <div className="form-container">
                <h1>Add New Property</h1>
                
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
                            <label>Price *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="500000"
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
                                placeholder="New York"
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
                                placeholder="NY"
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
                                placeholder="10001"
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

                    {/* Image URL Section (Recommended) */}
                    <div className="image-upload-section">
                        <h3>🖼️ Property Images (Paste URLs)</h3>
                        <p>Recommended: Paste image URLs (works with your backend)</p>

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
                                    {index === 0 && <span className="primary-badge">Primary</span>}
                                </div>
                            ))}
                        </div>

                        <button type="button" className="url-add-btn" onClick={addImageUrlField}>
                            ➕ Add another image URL
                        </button>

                        {/* Optional preview of first URL */}
                        {normalizeUrlList().length > 0 && (
                            <div className="url-preview">
                                <p>Preview (first URL):</p>
                                <img
                                    src={normalizeUrlList()[0]}
                                    alt="Preview"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Existing File Upload Section (Optional) */}
                    <div className="image-upload-section">
                        <h3>📸 Property Images (Upload Files - Optional)</h3>
                        <p>Only works if backend supports file upload endpoint</p>

                        <div className="image-input-wrapper">
                            <label htmlFor="image-input" className="image-upload-label">
                                <span>📁 Click to select images or drag and drop</span>
                                <small>Max 5MB per image, JPG/PNG/WebP</small>
                            </label>
                            <input
                                id="image-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="image-input-hidden"
                            />
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="image-previews">
                                <h4>Selected Images ({imagePreviews.length})</h4>
                                <div className="preview-grid">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <div className="preview-info">
                                                {index === 0 && <span className="primary-badge">Primary</span>}
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeImage(index)}
                                                    title="Remove image"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting || uploadingImages}
                        >
                            {submitting || uploadingImages ? 'Adding Property...' : 'Add Property'}
                        </button>
                        <button type="button" onClick={() => navigate('/')} className="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProperty;

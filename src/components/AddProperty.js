import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
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
        imageUrl: '',
        available: true,
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            await propertyService.createProperty(formData);
            alert('Property added successfully!');
            navigate('/');
        } catch (err) {
            console.error('Error creating property:', err);
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

                    <div className="form-group">
                        <label>Image URL</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
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

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? 'Adding Property...' : 'Add Property'}
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

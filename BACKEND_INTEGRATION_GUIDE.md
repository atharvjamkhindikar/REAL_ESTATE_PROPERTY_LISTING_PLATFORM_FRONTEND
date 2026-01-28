# 🔗 Backend-Frontend Integration Guide

**Real Estate Backend v1.1.0 → React Frontend Integration**  
**Date:** January 27, 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Configuration](#api-configuration)
3. [Service Integration](#service-integration)
4. [API Client Setup](#api-client-setup)
5. [Component Integration Examples](#component-integration-examples)
6. [Authentication Flow](#authentication-flow)
7. [Error Handling](#error-handling)
8. [Complete Code Examples](#complete-code-examples)

---

## 🎯 Overview

The backend now has **40+ API endpoints** for 6 major features. Your React frontend needs to:

1. ✅ Configure API base URL
2. ✅ Create API service/client
3. ✅ Implement authentication state management
4. ✅ Call backend endpoints from React components
5. ✅ Handle responses and errors

---

## ⚙️ API Configuration

### Step 1: Create API Configuration File

Create file: `src/config/api.config.js`

```javascript
// API Base URL Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    AGENT_LOGIN: `${API_BASE_URL}/auth/agent-login`,
    ME: (id) => `${API_BASE_URL}/auth/me/${id}`,
  },

  // Favorites
  FAVORITES: {
    GET_ALL: (userId) => `${API_BASE_URL}/favorites/user/${userId}`,
    GET_PAGED: (userId) => `${API_BASE_URL}/favorites/user/${userId}/paged`,
    ADD: `${API_BASE_URL}/favorites`,
    REMOVE: `${API_BASE_URL}/favorites`,
    TOGGLE: `${API_BASE_URL}/favorites/toggle`,
    CHECK: `${API_BASE_URL}/favorites/check`,
    COUNT: (propertyId) => `${API_BASE_URL}/favorites/count/${propertyId}`,
    UPDATE_NOTES: (favoriteId) => `${API_BASE_URL}/favorites/${favoriteId}/notes`,
  },

  // Schedule Viewings
  VIEWINGS: {
    CREATE: `${API_BASE_URL}/schedule-viewings`,
    GET_USER: (userId) => `${API_BASE_URL}/schedule-viewings/user/${userId}`,
    GET_USER_PAGED: (userId) => `${API_BASE_URL}/schedule-viewings/user/${userId}/paged`,
    GET_PROPERTY: (propertyId) => `${API_BASE_URL}/schedule-viewings/property/${propertyId}`,
    CONFIRM: (id) => `${API_BASE_URL}/schedule-viewings/${id}/confirm`,
    REJECT: (id) => `${API_BASE_URL}/schedule-viewings/${id}/reject`,
    COMPLETE: (id) => `${API_BASE_URL}/schedule-viewings/${id}/complete`,
    CANCEL: (id) => `${API_BASE_URL}/schedule-viewings/${id}/cancel`,
  },

  // Property Images
  IMAGES: {
    ADD: (propertyId) => `${API_BASE_URL}/properties/${propertyId}/images`,
    GET: (propertyId) => `${API_BASE_URL}/properties/${propertyId}/images`,
    UPDATE: (propertyId, imageId) => `${API_BASE_URL}/properties/${propertyId}/images/${imageId}`,
    DELETE: (propertyId, imageId) => `${API_BASE_URL}/properties/${propertyId}/images/${imageId}`,
    SET_PRIMARY: (propertyId, imageId) => `${API_BASE_URL}/properties/${propertyId}/images/${imageId}/primary`,
    REORDER: (propertyId) => `${API_BASE_URL}/properties/${propertyId}/images/reorder`,
  },

  // Builder Groups
  BUILDER_GROUPS: {
    GET_ALL: `${API_BASE_URL}/builder-groups`,
    GET_ACTIVE: `${API_BASE_URL}/builder-groups/active`,
    GET_BY_ID: (id) => `${API_BASE_URL}/builder-groups/${id}`,
    CREATE: `${API_BASE_URL}/builder-groups`,
    UPDATE: (id) => `${API_BASE_URL}/builder-groups/${id}`,
    DELETE: (id) => `${API_BASE_URL}/builder-groups/${id}`,
  },

  // Properties
  PROPERTIES: {
    GET_ALL: `${API_BASE_URL}/properties`,
    GET_BY_ID: (id) => `${API_BASE_URL}/properties/${id}`,
    SEARCH: `${API_BASE_URL}/properties/search`,
  },
};

export default API_BASE_URL;
```

### Step 2: Create `.env` File

In your React project root, create `.env`:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

For production, create `.env.production`:

```env
REACT_APP_API_URL=https://your-production-api.com/api
REACT_APP_ENV=production
```

---

## 🔌 Service Integration

### Step 3: Create API Service File

Create file: `src/services/api.service.js`

```javascript
import API_BASE_URL, { API_ENDPOINTS } from '../config/api.config';

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

// ========== AUTHENTICATION SERVICES ==========

export const authService = {
  // Register new user
  register: async (userData) => {
    return apiCall(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Regular login
  login: async (email, password) => {
    return apiCall(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Agent login
  agentLogin: async (email, password) => {
    return apiCall(API_ENDPOINTS.AUTH.AGENT_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current user
  getCurrentUser: async (userId) => {
    return apiCall(API_ENDPOINTS.AUTH.ME(userId));
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// ========== FAVORITES SERVICES ==========

export const favoriteService = {
  // Get all favorites for user
  getUserFavorites: async (userId) => {
    return apiCall(API_ENDPOINTS.FAVORITES.GET_ALL(userId));
  },

  // Get paginated favorites
  getUserFavoritesPaged: async (userId, page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') => {
    const url = `${API_ENDPOINTS.FAVORITES.GET_PAGED(userId)}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    return apiCall(url);
  },

  // Add to favorites
  addFavorite: async (userId, propertyId, notes = '') => {
    const url = `${API_ENDPOINTS.FAVORITES.ADD}?userId=${userId}&propertyId=${propertyId}&notes=${encodeURIComponent(notes)}`;
    return apiCall(url, { method: 'POST' });
  },

  // Remove from favorites
  removeFavorite: async (userId, propertyId) => {
    const url = `${API_ENDPOINTS.FAVORITES.REMOVE}?userId=${userId}&propertyId=${propertyId}`;
    return apiCall(url, { method: 'DELETE' });
  },

  // Toggle favorite
  toggleFavorite: async (userId, propertyId) => {
    const url = `${API_ENDPOINTS.FAVORITES.TOGGLE}?userId=${userId}&propertyId=${propertyId}`;
    return apiCall(url, { method: 'POST' });
  },

  // Check if favorited
  checkFavorite: async (userId, propertyId) => {
    const url = `${API_ENDPOINTS.FAVORITES.CHECK}?userId=${userId}&propertyId=${propertyId}`;
    return apiCall(url);
  },

  // Get favorite count
  getFavoriteCount: async (propertyId) => {
    return apiCall(API_ENDPOINTS.FAVORITES.COUNT(propertyId));
  },

  // Update favorite notes
  updateFavoriteNotes: async (favoriteId, notes) => {
    const url = `${API_ENDPOINTS.FAVORITES.UPDATE_NOTES(favoriteId)}?notes=${encodeURIComponent(notes)}`;
    return apiCall(url, { method: 'PATCH' });
  },
};

// ========== SCHEDULE VIEWING SERVICES ==========

export const viewingService = {
  // Schedule a viewing
  scheduleViewing: async (viewingData) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(viewingData),
    });
  },

  // Get user viewings
  getUserViewings: async (userId) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.GET_USER(userId));
  },

  // Get paginated viewings
  getUserViewingsPaged: async (userId, page = 0, size = 10, sortBy = 'viewingDate', direction = 'DESC') => {
    const url = `${API_ENDPOINTS.VIEWINGS.GET_USER_PAGED(userId)}?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`;
    return apiCall(url);
  },

  // Get property viewings
  getPropertyViewings: async (propertyId) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.GET_PROPERTY(propertyId));
  },

  // Confirm viewing (agent)
  confirmViewing: async (viewingId) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.CONFIRM(viewingId), { method: 'PUT' });
  },

  // Reject viewing (agent)
  rejectViewing: async (viewingId, rejectionReason) => {
    const url = `${API_ENDPOINTS.VIEWINGS.REJECT(viewingId)}?rejectionReason=${encodeURIComponent(rejectionReason)}`;
    return apiCall(url, { method: 'PUT' });
  },

  // Complete viewing
  completeViewing: async (viewingId) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.COMPLETE(viewingId), { method: 'PUT' });
  },

  // Cancel viewing
  cancelViewing: async (viewingId) => {
    return apiCall(API_ENDPOINTS.VIEWINGS.CANCEL(viewingId), { method: 'PUT' });
  },
};

// ========== PROPERTY IMAGE SERVICES ==========

export const imageService = {
  // Add image
  addImage: async (propertyId, imageData) => {
    return apiCall(API_ENDPOINTS.IMAGES.ADD(propertyId), {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  },

  // Get property images
  getPropertyImages: async (propertyId) => {
    return apiCall(API_ENDPOINTS.IMAGES.GET(propertyId));
  },

  // Update image
  updateImage: async (propertyId, imageId, imageData) => {
    return apiCall(API_ENDPOINTS.IMAGES.UPDATE(propertyId, imageId), {
      method: 'PUT',
      body: JSON.stringify(imageData),
    });
  },

  // Delete image
  deleteImage: async (propertyId, imageId) => {
    return apiCall(API_ENDPOINTS.IMAGES.DELETE(propertyId, imageId), { method: 'DELETE' });
  },

  // Set primary image
  setPrimaryImage: async (propertyId, imageId) => {
    return apiCall(API_ENDPOINTS.IMAGES.SET_PRIMARY(propertyId, imageId), { method: 'PATCH' });
  },

  // Reorder images
  reorderImages: async (propertyId, imageIds) => {
    return apiCall(API_ENDPOINTS.IMAGES.REORDER(propertyId), {
      method: 'POST',
      body: JSON.stringify(imageIds),
    });
  },
};

// ========== BUILDER GROUP SERVICES ==========

export const builderGroupService = {
  // Get all builders
  getAllBuilders: async () => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.GET_ALL);
  },

  // Get active builders
  getActiveBuilders: async () => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.GET_ACTIVE);
  },

  // Get builder by ID
  getBuilderById: async (id) => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.GET_BY_ID(id));
  },

  // Create builder
  createBuilder: async (builderData) => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.CREATE, {
      method: 'POST',
      body: JSON.stringify(builderData),
    });
  },

  // Update builder
  updateBuilder: async (id, builderData) => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(builderData),
    });
  },

  // Delete builder
  deleteBuilder: async (id) => {
    return apiCall(API_ENDPOINTS.BUILDER_GROUPS.DELETE(id), { method: 'DELETE' });
  },
};

export default {
  authService,
  favoriteService,
  viewingService,
  imageService,
  builderGroupService,
};
```

---

## 📱 Component Integration Examples

### Example 1: Registration Component

Create file: `src/components/Auth/Registration.jsx`

```javascript
import React, { useState } from 'react';
import { authService } from '../../services/api.service';

export const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'BUYER',
    licenseNumber: '',
    company: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.userType === 'AGENT' && !formData.licenseNumber) {
        throw new Error('License number required for agents');
      }

      // Call backend
      const response = await authService.register(formData);
      
      setSuccess('Registration successful!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        userType: 'BUYER',
        licenseNumber: '',
        company: '',
      });

      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>Register</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <select
          name="userType"
          value={formData.userType}
          onChange={handleChange}
        >
          <option value="BUYER">Buyer</option>
          <option value="AGENT">Agent</option>
        </select>

        {formData.userType === 'AGENT' && (
          <>
            <input
              type="text"
              name="licenseNumber"
              placeholder="License Number (e.g., RE-12345)"
              value={formData.licenseNumber}
              onChange={handleChange}
              pattern="[A-Z]{2}-\d{5}"
            />

            <input
              type="text"
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleChange}
            />
          </>
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};
```

### Example 2: Favorites Component

Create file: `src/components/Property/PropertyCard.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { favoriteService } from '../../services/api.service';

export const PropertyCard = ({ property, userId }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    // Check if property is already favorited
    checkFavoriteStatus();
    // Get favorite count
    getFavoriteCount();
  }, [property.id, userId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavorite(userId, property.id);
      setIsFavorited(response.data.isFavorited);
    } catch (err) {
      console.error('Error checking favorite:', err);
    }
  };

  const getFavoriteCount = async () => {
    try {
      const response = await favoriteService.getFavoriteCount(property.id);
      setFavoriteCount(response.data.favoriteCount);
    } catch (err) {
      console.error('Error getting favorite count:', err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await favoriteService.toggleFavorite(userId, property.id);
      setIsFavorited(!isFavorited);
      getFavoriteCount(); // Refresh count
    } catch (err) {
      alert('Error toggling favorite: ' + err.message);
    }
  };

  const handleScheduleViewing = () => {
    // Navigate to viewing schedule form
    window.location.href = `/schedule-viewing/${property.id}`;
  };

  return (
    <div className="property-card">
      <div className="property-images">
        <img src={property.imageUrl || '/placeholder.jpg'} alt={property.title} />
      </div>

      <div className="property-details">
        <h3>{property.title}</h3>
        <p className="price">${property.price?.toLocaleString()}</p>
        <p className="address">{property.address}, {property.city}</p>

        {property.builderGroup && (
          <p className="builder">Builder: {property.builderGroup.name}</p>
        )}

        <div className="property-specs">
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.squareFeet} sqft</span>
        </div>

        <div className="actions">
          <button
            className={`favorite-btn ${isFavorited ? 'active' : ''}`}
            onClick={handleToggleFavorite}
          >
            ❤️ ({favoriteCount})
          </button>

          <button
            className="schedule-btn"
            onClick={handleScheduleViewing}
          >
            Schedule Viewing
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Example 3: Schedule Viewing Component

Create file: `src/components/Viewing/ScheduleViewing.jsx`

```javascript
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { viewingService } from '../../services/api.service';

export const ScheduleViewing = () => {
  const { propertyId } = useParams();
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    userId: parseInt(userId),
    propertyId: parseInt(propertyId),
    viewingDate: '',
    viewingTime: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await viewingService.scheduleViewing(formData);
      setSuccess('Viewing scheduled successfully!');
      
      setTimeout(() => {
        window.location.href = `/viewings`;
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to schedule viewing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-viewing-container">
      <h2>Schedule Property Viewing</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Viewing Date *</label>
          <input
            type="date"
            name="viewingDate"
            value={formData.viewingDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Viewing Time *</label>
          <input
            type="time"
            name="viewingTime"
            value={formData.viewingTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requests..."
            rows="4"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Viewing'}
        </button>
      </form>
    </div>
  );
};
```

### Example 4: Builder Groups Filter

Create file: `src/components/Filter/BuilderGroupFilter.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { builderGroupService } from '../../services/api.service';

export const BuilderGroupFilter = ({ onFilterChange }) => {
  const [builders, setBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    setLoading(true);
    try {
      const response = await builderGroupService.getActiveBuilders();
      setBuilders(response.data);
    } catch (err) {
      console.error('Error fetching builders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const builderId = e.target.value;
    setSelectedBuilder(builderId);
    onFilterChange(builderId); // Notify parent component
  };

  return (
    <div className="builder-filter">
      <label htmlFor="builder-select">Filter by Builder:</label>
      <select
        id="builder-select"
        value={selectedBuilder}
        onChange={handleChange}
        disabled={loading}
      >
        <option value="">All Builders</option>
        {builders.map(builder => (
          <option key={builder.id} value={builder.id}>
            {builder.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

## 🔐 Authentication Flow

Create file: `src/context/AuthContext.jsx`

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isAgent = false) => {
    try {
      const loginFn = isAgent ? authService.agentLogin : authService.login;
      const response = await loginFn(email, password);
      
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('authToken', 'token_here'); // Add real token if using JWT
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## ❌ Error Handling

Create file: `src/utils/errorHandler.js`

```javascript
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    switch (status) {
      case 400:
        return `Bad Request: ${message}`;
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Forbidden. You do not have access.';
      case 404:
        return 'Resource not found.';
      case 409:
        return `Conflict: ${message}`;
      case 500:
        return 'Server error. Please try again later.';
      default:
        return message;
    }
  } else if (error.request) {
    return 'No response from server. Check your connection.';
  } else {
    return error.message || 'An unknown error occurred';
  }
};

export const validateFormData = (data, rules) => {
  const errors = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];

    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `Invalid ${field}`;
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }

    if (rule.match && value !== data[rule.match]) {
      errors[field] = `${field} does not match`;
    }
  }

  return errors;
};
```

---

## 💻 Complete Code Examples

### Full App.jsx Setup

Create file: `src/App.jsx`

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import { HomePage } from './pages/HomePage';
import { Registration } from './components/Auth/Registration';
import { Login } from './components/Auth/Login';
import { PropertyDetail } from './pages/PropertyDetail';
import { ScheduleViewing } from './components/Viewing/ScheduleViewing';
import { MyFavorites } from './pages/MyFavorites';
import { MyViewings } from './pages/MyViewings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/schedule-viewing/:propertyId" element={<ScheduleViewing />} />
          <Route path="/favorites" element={<MyFavorites />} />
          <Route path="/viewings" element={<MyViewings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## 🚀 Testing the Integration

### Manual Testing Checklist

```
Authentication:
  ☐ Register as BUYER
  ☐ Register as AGENT
  ☐ Agent Login with email/password
  ☐ Regular Login
  ☐ Logout clears session

Favorites:
  ☐ Add property to favorites
  ☐ Remove from favorites
  ☐ View favorites list (paginated)
  ☐ Toggle favorite
  ☐ Favorite count updates

Viewings:
  ☐ Schedule viewing
  ☐ View my viewings
  ☐ Cancel viewing
  ☐ (Agent) Confirm viewing
  ☐ (Agent) Reject viewing

Images:
  ☐ View property images
  ☐ Multiple images display correctly
  ☐ Set primary image

Builders:
  ☐ Filter by builder group
  ☐ Builder list loads
  ☐ Properties show correct builder
```

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Update `.env.production` with real API URL
- [ ] Test all features on production API
- [ ] Update CORS settings in backend if needed
- [ ] Set up proper error logging
- [ ] Implement token refresh logic
- [ ] Add loading states to all API calls
- [ ] Add error boundaries in React
- [ ] Test mobile responsiveness

---

## 🔧 CORS Configuration (Backend)

If you get CORS errors, ensure your backend's `application.properties` has:

```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:3001
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

Or in your backend Java config:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## 📞 Troubleshooting

### Issue: CORS Error
**Solution:** Check backend CORS configuration above

### Issue: 404 Not Found
**Solution:** 
- Verify API URL in `.env` matches backend URL
- Check endpoint paths match API documentation
- Ensure backend is running

### Issue: 401 Unauthorized
**Solution:**
- Add auth token to request headers
- Implement token refresh logic
- Check token expiration

### Issue: Network Error
**Solution:**
- Ensure backend is running (`localhost:8080`)
- Check internet connection
- Verify API endpoint is correct

---

**Last Updated:** January 27, 2026  
**Backend Version:** 1.1.0

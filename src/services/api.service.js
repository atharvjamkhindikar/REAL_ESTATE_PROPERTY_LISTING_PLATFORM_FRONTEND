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
    localStorage.removeItem('userId');
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

// ========== PROPERTY SERVICES ==========

export const propertyService = {
  // Get all properties
  getAllProperties: async () => {
    return apiCall(API_ENDPOINTS.PROPERTIES.GET_ALL);
  },

  // Get property by ID
  getPropertyById: async (id) => {
    return apiCall(API_ENDPOINTS.PROPERTIES.GET_BY_ID(id));
  },

  // Search properties with filters
  searchProperties: async (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const url = `${API_ENDPOINTS.PROPERTIES.SEARCH}?${params.toString()}`;
    return apiCall(url);
  },
};

export default {
  authService,
  favoriteService,
  viewingService,
  imageService,
  builderGroupService,
  propertyService,
};

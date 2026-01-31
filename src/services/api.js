import axios from 'axios';

const API_BASE_URL = 'http://ec2-13-220-57-64.compute-1.amazonaws.com:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTHENTICATION SERVICES ==========
export const authService = {
    // User registration
    register: (userData) =>
        api.post('/auth/register', userData),

    // User login
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    // Agent registration - uses the same endpoint as regular registration with userType: AGENT
    agentRegister: (agentData) =>
        api.post('/auth/register', {
            ...agentData,
            userType: 'AGENT',
            subscriptionType: 'BASIC', // Agents get BASIC by default
            role: 'AGENT'
        }),

    // Agent login
    agentLogin: (email, password) =>
        api.post('/auth/agent-login', { email, password }),

    getCurrentUser: (id) =>
        api.get(`/auth/me/${id}`),
};

// ========== PROPERTY SERVICES ==========
export const propertyService = {
    getAllProperties: (page = 0, size = 10) => api.get(`/properties?page=${page}&size=${size}`),

    getAvailableProperties: (page = 0, size = 10) => api.get(`/properties/available?page=${page}&size=${size}`),

    // IMPORTANT: Used by PropertyDetail, PropertyImages, ScheduleViewing
    getPropertyById: (id) => api.get(`/properties/${id}`),

    // Returns PropertyResponse (DTO) with optional userId
    getPropertyDetails: (id, userId) =>
        api.get(`/properties/${id}/details`, { params: userId ? { userId } : {} }),

    // Paged available properties endpoint from backend
    getAvailablePropertiesPaged: (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') =>
        api.get('/properties/available/paged', { params: { page, size, sortBy, direction } }),

    createProperty: (property) => api.post('/properties', property),
    
    updateProperty: (id, property) => api.put(`/properties/${id}`, property),
    
    deleteProperty: (id) => api.delete(`/properties/${id}`),
    
    getPropertiesByCity: (city) => api.get(`/properties/city/${city}`),
    
    getPropertiesByType: (type) => api.get(`/properties/type/${type}`),
    
    getPropertiesByListingType: (listingType) => api.get(`/properties/listing-type/${listingType}`),
    
    getPropertiesByPriceRange: (minPrice, maxPrice) => 
        api.get(`/properties/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
    
    getPropertiesByBuilderGroup: (builderGroupId) =>
        api.get(`/properties/builder-group/${builderGroupId}`),

    // Advanced search with pagination and sorting
    searchProperties: (searchRequest, userId) =>
        api.post('/properties/search', searchRequest, { params: userId ? { userId } : {} }),

    searchPropertiesGet: (params) => api.get('/properties/search', { params }),
};

// ========== PROPERTY IMAGES SERVICES ==========
export const propertyImageService = {
    getPropertyImages: (propertyId) =>
        api.get(`/properties/${propertyId}/images`),

    addImage: (propertyId, formData) =>
        api.post(`/properties/${propertyId}/images`, formData),

    updateImage: (propertyId, imageId, formData) =>
        api.put(`/properties/${propertyId}/images/${imageId}`, formData),

    deleteImage: (propertyId, imageId) =>
        api.delete(`/properties/${propertyId}/images/${imageId}`),

    setPrimaryImage: (propertyId, imageId) =>
        api.patch(`/properties/${propertyId}/images/${imageId}/primary`),

    reorderImages: (propertyId, imageIds) =>
        api.post(`/properties/${propertyId}/images/reorder`, { imageIds }),
};

// ========== BUILDER GROUPS SERVICES ==========
export const builderGroupService = {
    getAllBuilderGroups: () =>
        api.get('/builder-groups'),

    getActiveBuilderGroups: () =>
        api.get('/builder-groups/active'),

    getBuilderGroupById: (id) =>
        api.get(`/builder-groups/${id}`),

    createBuilderGroup: (data) =>
        api.post('/builder-groups', data),

    updateBuilderGroup: (id, data) =>
        api.put(`/builder-groups/${id}`, data),

    deleteBuilderGroup: (id) =>
        api.delete(`/builder-groups/${id}`),

    getBuilderGroupProperties: (groupId, page = 0, size = 10) =>
        api.get(`/builder-groups/${groupId}/properties?page=${page}&size=${size}`),

    // Builder Group Images - Store in localStorage since backend doesn't have imageUrl field
    uploadBuilderGroupImage: (groupId, formData) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const file = formData.get('file');

            reader.onload = () => {
                try {
                    // Store the Base64 image in localStorage with key: builderGroup_image_{groupId}
                    localStorage.setItem(`builderGroup_image_${groupId}`, reader.result);

                    // Return success response to maintain API consistency
                    resolve({
                        data: {
                            success: true,
                            message: 'Image uploaded successfully',
                            imageUrl: reader.result
                        }
                    });
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            if (file) {
                reader.readAsDataURL(file);
            } else {
                reject(new Error('No file selected'));
            }
        });
    },

    deleteBuilderGroupImage: (groupId) => {
        return new Promise((resolve, reject) => {
            try {
                // Remove the image from localStorage
                localStorage.removeItem(`builderGroup_image_${groupId}`);

                resolve({
                    data: {
                        success: true,
                        message: 'Image deleted successfully'
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    getBuilderGroupImage: (groupId) => {
        return new Promise((resolve, reject) => {
            try {
                const imageUrl = localStorage.getItem(`builderGroup_image_${groupId}`);
                resolve({
                    data: {
                        imageUrl: imageUrl
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    // Add property to builder group (Admin only)
    addPropertyToGroup: (groupId, propertyId) =>
        api.post(`/builder-groups/${groupId}/properties`, { propertyId }),

    removePropertyFromGroup: (groupId, propertyId) =>
        api.delete(`/builder-groups/${groupId}/properties/${propertyId}`),
};

// ========== FAVORITES SERVICES ==========
export const favoriteService = {
    getUserFavorites: (userId, page = 0, size = 10) =>
        api.get(`/favorites/user/${userId}?page=${page}&size=${size}`),

    addFavorite: (userId, propertyId, notes = '') =>
        api.post(`/favorites?userId=${userId}&propertyId=${propertyId}&notes=${encodeURIComponent(notes)}`),

    removeFavorite: (userId, propertyId) =>
        api.delete(`/favorites?userId=${userId}&propertyId=${propertyId}`),

    updateFavoriteNotes: (id, notes) =>
        api.put(`/favorites/${id}/notes?notes=${encodeURIComponent(notes)}`),

    toggleFavorite: (userId, propertyId) =>
        api.post(`/favorites/toggle?userId=${userId}&propertyId=${propertyId}`),

    isFavorite: (userId, propertyId) =>
        api.get(`/favorites/check?userId=${userId}&propertyId=${propertyId}`),

    getFavoriteCount: (propertyId) =>
        api.get(`/favorites/count/${propertyId}`),
};

// ========== SCHEDULE VIEWING SERVICES ==========
export const scheduleViewingService = {
    scheduleViewing: (viewingData) =>
        api.post('/schedule-viewings', viewingData),

    getUserViewings: (userId, page = 0, size = 10) =>
        api.get(`/schedule-viewings/user/${userId}?page=${page}&size=${size}`),

    getPropertyViewings: (propertyId) =>
        api.get(`/schedule-viewings/property/${propertyId}`),

    getViewingById: (id) =>
        api.get(`/schedule-viewings/${id}`),

    updateViewingStatus: (id, status) =>
        api.put(`/schedule-viewings/${id}`, { status }),

    confirmViewing: (id) =>
        api.put(`/schedule-viewings/${id}/confirm`),

    rejectViewing: (id, rejectionReason) =>
        api.put(`/schedule-viewings/${id}/reject`, { rejectionReason }),

    completeViewing: (id) =>
        api.put(`/schedule-viewings/${id}/complete`),

    cancelViewing: (id) =>
        api.put(`/schedule-viewings/${id}/cancel`),

    deleteViewing: (id) =>
        api.delete(`/schedule-viewings/${id}`),

    getUserViewingsPaged: (userId, page = 0, size = 10, sortBy = 'viewingDate', direction = 'DESC') =>
        api.get(`/schedule-viewings/user/${userId}/paged?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

    getUserViewingsByStatus: (userId, status) =>
        api.get(`/schedule-viewings/user/${userId}/status/${status}`),

    getViewingsForOwner: (ownerId) =>
        api.get(`/schedule-viewings/owner/${ownerId}`),

    getViewingsForOwnerByStatus: (ownerId, status) =>
        api.get(`/schedule-viewings/owner/${ownerId}/status/${status}`),

    getViewingsInDateRange: (startDate, endDate) =>
        api.get(`/schedule-viewings/date-range?startDate=${startDate}&endDate=${endDate}`),

    getConfirmedViewingCount: (propertyId) =>
        api.get(`/schedule-viewings/property/${propertyId}/confirmed-count`),
};

// ========== USER SERVICES ==========
export const userService = {
    getAllUsers: (page = 0, size = 10) => 
        api.get(`/users/paged?page=${page}&size=${size}`),
    
    getAllUsersPaged: (page = 0, size = 10, sortBy = 'createdAt', direction = 'DESC') =>
        api.get(`/users/paged?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`),

    getAllUsersSimple: () => api.get('/users'),
    
    getUserById: (id) => api.get(`/users/${id}`),
    
    getUserByEmail: (email) => api.get(`/users/email/${email}`),

    createUser: (user) => api.post('/users', user),
    
    updateUser: (id, user) => api.put(`/users/${id}`, user),
    
    deleteUser: (id) => api.delete(`/users/${id}`),
    
    getUsersByType: (userType) => api.get(`/users/type/${userType}`),

    getActiveUsers: () => api.get('/users/active'),

    activateUser: (id) => api.patch(`/users/${id}/activate`),
    
    deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),

    updateUserRole: (id, role) => api.patch(`/users/${id}/role?role=${role}`),
};

// ========== SEARCH HISTORY SERVICES ==========
export const searchHistoryService = {
    getUserSearchHistory: (userId, page = 0, size = 10) => 
        api.get(`/search-history/user/${userId}?page=${page}&size=${size}`),
    
    saveSearch: (userId, criteria) => 
        api.post('/search-history', { userId, ...criteria }),
    
    deleteSearchHistory: (id) => api.delete(`/search-history/${id}`),
    
    clearUserHistory: (userId) => api.delete(`/search-history/user/${userId}`),
    
    getPopularSearches: (limit = 10) => 
        api.get(`/search-history/popular?limit=${limit}`),
    
    getUserSearchStats: (userId) => 
        api.get(`/search-history/stats/${userId}`),
};

// ========== SUBSCRIPTION SERVICES ==========
export const subscriptionService = {
    // Get all subscriptions with pagination (admin)
    getAllSubscriptions: (page = 0, size = 10) =>
        api.get(`/subscriptions?page=${page}&size=${size}`),
    
    // Get user's subscription
    getUserSubscription: (userId) =>
        api.get(`/subscriptions/user/${userId}`),
    
    // Create new subscription
    createSubscription: (userId, planType) =>
        api.post(`/subscriptions?userId=${userId}&planType=${planType}`),

    // Upgrade subscription to higher plan
    upgradeSubscription: (userId, newPlanType) =>
        api.patch(`/subscriptions/user/${userId}/upgrade?newPlanType=${newPlanType}`),

    // Cancel subscription
    cancelSubscription: (userId) =>
        api.patch(`/subscriptions/user/${userId}/cancel`),

    // Renew subscription
    renewSubscription: (userId) =>
        api.patch(`/subscriptions/user/${userId}/renew`),

    // Toggle auto-renew
    toggleAutoRenew: (userId) =>
        api.patch(`/subscriptions/user/${userId}/auto-renew`),

    // Check if subscription is active
    isSubscriptionActive: (userId) =>
        api.get(`/subscriptions/user/${userId}/active`),

    // Get all active subscriptions
    getActiveSubscriptions: () =>
        api.get('/subscriptions/active'),
    
    // Get subscriptions expiring within days
    getExpiringSubscriptions: (days = 7) =>
        api.get(`/subscriptions/expiring?days=${days}`),

    // Process expired subscriptions
    processExpiredSubscriptions: () =>
        api.post('/subscriptions/process-expired'),
};

// ========== CONTACT AGENT SERVICES ==========
export const contactAgentService = {
    createContact: (contactData) =>
        api.post('/contact-agents', contactData),

    getContactById: (id) =>
        api.get(`/contact-agents/${id}`),

    getUnreadContacts: () =>
        api.get('/contact-agents/unread'),

    getContactsByProperty: (propertyId) =>
        api.get(`/contact-agents/property/${propertyId}`),

    getContactsByUser: (userId) =>
        api.get(`/contact-agents/user/${userId}`),

    getContactsForOwner: (ownerId) =>
        api.get(`/contact-agents/owner/${ownerId}`),

    getUnreadContactsForOwner: (ownerId) =>
        api.get(`/contact-agents/owner/${ownerId}/unread`),

    getUnreadCountForOwner: (ownerId) =>
        api.get(`/contact-agents/owner/${ownerId}/unread-count`),

    markAsRead: (id) =>
        api.patch(`/contact-agents/${id}/read`),

    deleteContact: (id) =>
        api.delete(`/contact-agents/${id}`),
};


export default api;

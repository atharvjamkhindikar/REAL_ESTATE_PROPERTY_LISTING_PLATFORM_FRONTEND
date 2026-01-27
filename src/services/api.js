import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const propertyService = {
    getAllProperties: () => api.get('/properties'),
    
    getAvailableProperties: () => api.get('/properties/available'),
    
    getPropertyById: (id) => api.get(`/properties/${id}`),
    
    createProperty: (property) => api.post('/properties', property),
    
    updateProperty: (id, property) => api.put(`/properties/${id}`, property),
    
    deleteProperty: (id) => api.delete(`/properties/${id}`),
    
    getPropertiesByCity: (city) => api.get(`/properties/city/${city}`),
    
    getPropertiesByType: (type) => api.get(`/properties/type/${type}`),
    
    getPropertiesByListingType: (listingType) => api.get(`/properties/listing-type/${listingType}`),
    
    getPropertiesByPriceRange: (minPrice, maxPrice) => 
        api.get(`/properties/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
    
    // Advanced search with pagination and sorting
    searchProperties: (searchRequest) => api.post('/properties/search', searchRequest),
    
    searchPropertiesGet: (params) => api.get('/properties/search', { params }),
};

export const userService = {
    getAllUsers: (page = 0, size = 10) => 
        api.get(`/users/paged?page=${page}&size=${size}`),
    
    getAllUsersSimple: () => api.get('/users'),
    
    getUserById: (id) => api.get(`/users/${id}`),
    
    createUser: (user) => api.post('/users', user),
    
    updateUser: (id, user) => api.put(`/users/${id}`, user),
    
    deleteUser: (id) => api.delete(`/users/${id}`),
    
    getUserByEmail: (email) => api.get(`/users/email/${email}`),
    
    getUsersByRole: (role) => api.get(`/users/role/${role}`),
    
    activateUser: (id) => api.patch(`/users/${id}/activate`),
    
    deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),
};

export const favoriteService = {
    getUserFavorites: (userId, page = 0, size = 10) => 
        api.get(`/favorites/user/${userId}?page=${page}&size=${size}`),
    
    addFavorite: (userId, propertyId, notes = '') => 
        api.post('/favorites', { userId, propertyId, notes }),
    
    removeFavorite: (id) => api.delete(`/favorites/${id}`),
    
    updateFavoriteNotes: (id, notes) => 
        api.put(`/favorites/${id}/notes`, { notes }),
    
    toggleFavorite: (userId, propertyId) => 
        api.post('/favorites/toggle', { userId, propertyId }),
    
    isFavorite: (userId, propertyId) => 
        api.get(`/favorites/check?userId=${userId}&propertyId=${propertyId}`),
};

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

export const subscriptionService = {
    getAllSubscriptions: (page = 0, size = 10) => 
        api.get(`/subscriptions?page=${page}&size=${size}`),
    
    getUserSubscription: (userId) => 
        api.get(`/subscriptions/user/${userId}`),
    
    createSubscription: (subscription) => 
        api.post('/subscriptions', subscription),
    
    upgradeSubscription: (id, newType) => 
        api.patch(`/subscriptions/${id}/upgrade`, { newType }),
    
    cancelSubscription: (id) => 
        api.patch(`/subscriptions/${id}/cancel`),
    
    renewSubscription: (id) => 
        api.patch(`/subscriptions/${id}/renew`),
    
    getActiveSubscriptions: () => 
        api.get('/subscriptions/active'),
    
    getExpiringSubscriptions: (days = 30) => 
        api.get(`/subscriptions/expiring?days=${days}`),
};

export const authService = {
    login: (email, password) => 
        api.post('/auth/login', { email, password }),
    
    getCurrentUser: (id) => 
        api.get(`/auth/me/${id}`),
};

export default api;

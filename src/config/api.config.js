// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://13.220.57.64:8080/api';

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

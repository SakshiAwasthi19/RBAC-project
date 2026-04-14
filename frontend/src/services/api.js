import axios from 'axios';

// Create Axios Instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Data & 401
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// --- API Groups ---

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/auth/me'),
    changePassword: (data) => api.put('/auth/change-password', data)
};

// Student APIs
export const studentAPI = {
    getProfile: () => api.get('/students/profile'),
    updateProfile: (data) => api.put('/students/profile', data),
    uploadProfilePicture: (formData) => api.post('/students/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDashboard: () => api.get('/students/dashboard'),
    getPointsSummary: () => api.get('/students/points'),
    getActivityLog: (filters) => api.get('/students/activities', { params: filters }),
    addActivity: (data) => api.post('/students/activities', data),
    deleteActivity: (activityId) => api.delete(`/students/activities/${activityId}`),
    uploadCertificate: (activityId, formData) => {
        // Ensure uploadType is included if not already
        if (!formData.has('uploadType')) formData.append('uploadType', 'certificate');

        // Remove any unintentional prefix leading to 404
        const cleanId = typeof activityId === 'string' && activityId.startsWith('a_')
            ? activityId.substring(2)
            : activityId;

        return api.post(`/students/activities/${cleanId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteCertificate: (activityId, certificateId) => {
        const cleanId = typeof activityId === 'string' && activityId.startsWith('a_')
            ? activityId.substring(2)
            : activityId;
        return api.delete(`/students/activities/${cleanId}/certificates/${certificateId}`);
    },
    getCertificates: () => api.get('/students/certificates'),
    getNotifications: () => api.get('/students/notifications'),
    markNotificationsRead: () => api.patch('/students/notifications/read'),
    clearNotifications: () => api.delete('/students/notifications')
};

// Organization APIs
export const organizationAPI = {
    getProfile: () => api.get('/organizations/profile'),
    updateProfile: (data) => api.put('/organizations/profile', data),
    uploadLogo: (formData) => api.post('/organizations/profile/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getDashboard: () => api.get('/organizations/dashboard'),
    createEvent: (formData) => api.post('/organizations/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyEvents: (filters) => api.get('/organizations/events', { params: filters }),
    getEventRegistrations: (eventId) => api.get(`/organizations/events/${eventId}/registrations`),
    deleteEvent: (eventId) => api.delete(`/organizations/events/${eventId}`),
    updateRegistrationStatus: (eventId, studentId, status) => api.patch(`/organizations/events/${eventId}/registrations/${studentId}`, { status }),
    markAttendance: (eventId, studentId, attended) => api.patch(`/organizations/events/${eventId}/attendance/${studentId}`, { attended }),
    reviewActivity: (studentId, activityId, data) => api.patch(`/organizations/review-activity/${studentId}/${activityId}`, data),
};

// Events APIs (Public & Student)
export const eventsAPI = {
    getAllEvents: (filters) => api.get('/events', { params: filters }),
    getNearbyEvents: (params) => api.get('/events/nearby', { params }), // lat, long, radius
    getEventById: (eventId) => api.get(`/events/${eventId}`),
    registerForEvent: (eventId) => api.post(`/events/${eventId}/register`),
    getEventPass: (eventId) => api.get(`/events/${eventId}/pass`)
};
// Admin APIs
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getAllOrganizations: (filters) => api.get('/admin/organizations', { params: filters }),
    updateOrganizationStatus: (orgId, data) => api.patch(`/admin/organizations/${orgId}/status`, data),
    deleteOrganization: (orgId) => api.delete(`/admin/organizations/${orgId}`),
    getAllEvents: (filters) => api.get('/admin/events', { params: filters }),
    deleteEvent: (eventId) => api.delete(`/admin/events/${eventId}`),
    getAllActivities: (filters) => api.get('/admin/activities', { params: filters }),
    updateActivityStatus: (activityId, data) => api.patch(`/admin/activities/${activityId}/status`, data),
};

export default api;

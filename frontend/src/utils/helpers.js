import { format, formatDistanceToNow, isAfter } from 'date-fns';

export const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const timeAgo = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isEventUpcoming = (startDate) => {
    if (!startDate) return false;
    return isAfter(new Date(startDate), new Date());
};

export const isRegistrationOpen = (deadline) => {
    if (!deadline) return false;
    return isAfter(new Date(deadline), new Date());
};

export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.round(percentage * 10) / 10, 100);
};

export const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const getUserLocation = (options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }) => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            options
        );
    });
};

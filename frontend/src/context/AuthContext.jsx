import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch current user profile
    const getCurrentUser = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.success) {
                // Merge user and profile data
                setUser({ ...response.data.user, ...response.data.profile });
            }
        } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Login Function
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            if (response.success) {
                localStorage.setItem('token', response.token);
                // Merge user and profile data
                const fullUser = { ...response.user, ...response.profile };
                setUser(fullUser);
                toast.success('Login Successful!');
                return fullUser;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login Failed';
            toast.error(message);
            throw error;
        }
    };

    // Register Function
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (response.success) {
                localStorage.setItem('token', response.token);
                // Merge user and profile data
                const fullUser = { ...response.user, ...response.profile };
                setUser(fullUser);
                toast.success('Registration Successful!');
                return fullUser;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration Failed';
            toast.error(message);
            throw error;
        }
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        getCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

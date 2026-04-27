import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Setup Axios interceptor
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('token', token);

                try {
                    // Fetch full profile to get savedItems etc.
                    const { data } = await axios.get('/api/users/profile');
                    setUser(data);
                } catch (err) {
                    console.error('Error loading user profile:', err);
                    // If profiling fetching fails (e.g. invalid/expired token), clear it
                    setToken(null);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            setToken(data.token);
            // The reload will happen via token change effect, which fetches full profile
            return true;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('/api/users/register', { name, email, password });
            // We no longer automatically log in after registration. The user must verify their email.
            return data.message;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        setToken(null);
    };

    const toggleSave = async (item) => {
        if (!user) return false;
        const itemId = item._id || item;
        try {
            await axios.post(`/api/items/${itemId}/save`);

            // Update local user state
            setUser(prev => {
                if (!prev) return prev;
                const isSaved = prev.savedItems?.some(itemObj => {
                    if (!itemObj) return false;
                    const id = itemObj._id || itemObj;
                    return id.toString() === itemId.toString();
                });

                let newSavedItems;
                if (isSaved) {
                    newSavedItems = prev.savedItems.filter(itemObj => {
                        if (!itemObj) return false;
                        const id = itemObj._id || itemObj;
                        return id.toString() !== itemId.toString();
                    });
                } else {
                    newSavedItems = [...(prev.savedItems || []), item];
                }
                return { ...prev, savedItems: newSavedItems };
            });
            return true;
        } catch (error) {
            console.error('Error toggling save:', error);
            return false;
        }
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        toggleSave,
        loading
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

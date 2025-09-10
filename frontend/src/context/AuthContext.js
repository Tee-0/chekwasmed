import React, { createContext, useContext, useState, useEffect } from 'react';
//create cotxt obj, other compnets read, e.g user/token, runs side effects
import axios from 'axios'; //axios is a HTTP client for making API calls to your backend

const AuthContext = createContext();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        //Sets default base URL for all axios requests
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    //Check if user is already logged in when app starts
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Get token from localStorage, it usually persists between browser sessions
                const storedToken = localStorage.getItem('chekwasmed_token');
                const storedUser = localStorage.getItem('chekwasmed_user');

                if (storedToken && storedUser) {
                    // Verify the token is still valid by calling backend
                    const response = await axios.get('/auth/me', {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });

                    if (response.data.success) {
                        // Token is valid - restore user session
                        setToken(storedToken);
                        setUser(response.data.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token is invalid - clear storage
                        localStorage.removeItem('chekwasmed_token');
                        localStorage.removeItem('chekwasmed_user');
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear invalid tokens
                localStorage.removeItem('chekwasmed_token');
                localStorage.removeItem('chekwasmed_user');
            } finally {
                setLoading(false); // Done checking
            }
        };

        checkAuthStatus();
    }, []);

    //login function
    const login = async (email, password) => {
        try {
            setLoading(true);

            const response = await axios.post('/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                const { token: newToken, user: newUser } = response.data;

                // Store in state
                setToken(newToken);
                setUser(newUser);
                setIsAuthenticated(true);

                // Store in localStorage for persistence
                localStorage.setItem('chekwasmed_token', newToken);
                localStorage.setItem('chekwasmed_user', JSON.stringify(newUser));

                return { success: true, user: newUser };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);

            // Extract error message from response
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    //register function
    const register = async (userData) => {
        try {
            setLoading(true);

            const response = await axios.post('/auth/register', userData);

            if (response.data.success) {
                const { token: newToken, user: newUser } = response.data;

                // Auto-login after registration
                setToken(newToken);
                setUser(newUser);
                setIsAuthenticated(true);

                // Store in localStorage
                localStorage.setItem('chekwasmed_token', newToken);
                localStorage.setItem('chekwasmed_user', JSON.stringify(newUser));

                return { success: true, user: newUser };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Registration error:', error);

            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    //logout function
    const logout = () => {
        // Clear all auth state
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        // Clear localStorage
        localStorage.removeItem('chekwasmed_token');
        localStorage.removeItem('chekwasmed_user');

        // Remove axios default header
        delete axios.defaults.headers.common['Authorization'];

        console.log('User logged out successfully');
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/auth/profile', profileData);

            if (response.data.success) {
                const updatedUser = response.data.user;
                setUser(updatedUser);

                // Update localStorage
                localStorage.setItem('chekwasmed_user', JSON.stringify(updatedUser));

                return { success: true, user: updatedUser };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const message = error.response?.data?.message || 'Profile update failed.';
            return { success: false, message };
        }
    };

    //Context value- what other components can access
    const contextValue = {
        //State
        user,
        token,
        loading,
        isAuthenticated,

        //functions
        login,
        register,
        logout,
        updateProfile,

        //Computed values
        userRole: user?.role,
        userName: user?.name,
        userEmail: user?.email,
    };

    return(
      <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>  
    );
};
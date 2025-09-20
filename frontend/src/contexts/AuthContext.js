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

    //Configure axios base URL
    useEffect(() => { axios.defaults.baseURL = API_BASE_URL; }, []);

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
                const storedToken = localStorage.getItem('chekwasmed_token');
                const storedUser = localStorage.getItem('chekwasmed_user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));  // Parse the stored user
                    setIsAuthenticated(true);

                    // Optional: Verify token is still valid (but don't loop if it fails)
                    try {
                        const response = await axios.get('/auth/me', {
                            headers: { Authorization: `Bearer ${storedToken}` }
                        });

                        if (!response.data.success) {
                            throw new Error('Token invalid');
                        }
                    } catch (verifyError) {
                        // If verification fails, clear everything but don't loop
                        console.log('Token verification failed, clearing auth');
                        localStorage.removeItem('chekwasmed_token');
                        localStorage.removeItem('chekwasmed_user');
                        setToken(null);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear everything on error
                localStorage.removeItem('chekwasmed_token');
                localStorage.removeItem('chekwasmed_user');
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);  // Always set loading to false
            }
        };

        checkAuthStatus();
    }, []); // Empty dependency array - only run once on mount

    //login function
    const login = async (email, password) => {
        try {
            setLoading(true);

            console.log('Making login request to:', `${API_BASE_URL}/auth/login`); // Debug log

            const response = await axios.post('/auth/login', {
                email,
                password
            });

            console.log('Login API response:', response.data); // Debug log

            if (response.data.success) {
                const { token: newToken, user: newUser } = response.data;

                // Store in state
                setToken(newToken);
                setUser(newUser);
                setIsAuthenticated(true);

                // Store in localStorage for persistence
                localStorage.setItem('chekwasmed_token', newToken);
                localStorage.setItem('chekwasmed_user', JSON.stringify(newUser));

                console.log('Login successful, returning success response'); // Debug log

                return { success: true, user: newUser };
            } else {
                console.log('Login failed:', response.data.message); // Debug log
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            console.log('Error details:', error.response?.data); // Debug log

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

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
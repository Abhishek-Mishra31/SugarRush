import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const API_URL = '/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Error parsing stored user:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password
            });

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };


    const login = async (email, password) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const registerAdmin = async (name, email, password, adminSecret) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.post(`${API_URL}/register/admin`, {
                name,
                email,
                password,
                adminSecret
            });

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Admin registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.post(`${API_URL}/login/admin`, {
                email,
                password
            });

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Admin login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError('');
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        registerAdmin,
        loginAdmin,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

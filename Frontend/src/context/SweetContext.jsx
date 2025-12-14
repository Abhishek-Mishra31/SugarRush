import { createContext, useState, useContext, useCallback } from 'react';
import axios from '../utils/axios';
import PropTypes from 'prop-types';

const SweetContext = createContext();

const API_URL = '/sweets';

export const SweetProvider = ({ children }) => {
    const [sweets, setSweets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSweets = useCallback(async () => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.get(API_URL);

            if (response.data.success) {
                setSweets(response.data.data.sweets);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch sweets';
            setError(errorMessage);
            console.error('Error fetching sweets:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchSweets = async (query) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.get(`${API_URL}/search`, {
                params: query
            });

            if (response.data.success) {
                setSweets(response.data.data.sweets);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Search failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const purchaseSweet = async (id, quantity) => {
        try {
            setError('');

            const response = await axios.post(`${API_URL}/${id}/purchase`, {
                quantity
            });

            if (response.data.success) {
                setSweets(prevSweets =>
                    prevSweets.map(sweet =>
                        sweet._id === id ? response.data.data.sweet : sweet
                    )
                );
                return { success: true, message: response.data.message };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Purchase failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const createSweet = async (sweetData) => {
        try {
            setError('');
            setLoading(true);

            const response = await axios.post(API_URL, sweetData);

            if (response.data.success) {
                setSweets(prevSweets => [...prevSweets, response.data.data.sweet]);
                return { success: true, message: 'Sweet created successfully' };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create sweet';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateSweet = async (id, sweetData) => {
        try {
            setError('');

            const response = await axios.put(`${API_URL}/${id}`, sweetData);

            if (response.data.success) {
                setSweets(prevSweets =>
                    prevSweets.map(sweet =>
                        sweet._id === id ? response.data.data.sweet : sweet
                    )
                );
                return { success: true, message: 'Sweet updated successfully' };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update sweet';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const deleteSweet = async (id) => {
        try {
            setError('');

            const response = await axios.delete(`${API_URL}/${id}`);

            if (response.data.success) {
                setSweets(prevSweets => prevSweets.filter(sweet => sweet._id !== id));
                return { success: true, message: 'Sweet deleted successfully' };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete sweet';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const restockSweet = async (id, quantity) => {
        try {
            setError('');

            const response = await axios.post(`${API_URL}/${id}/restock`, {
                amount: quantity
            });

            if (response.data.success) {
                setSweets(prevSweets =>
                    prevSweets.map(sweet =>
                        sweet._id === id ? response.data.data.sweet : sweet
                    )
                );
                return { success: true, message: response.data.message };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Restock failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        sweets,
        loading,
        error,
        fetchSweets,
        searchSweets,
        purchaseSweet,
        createSweet,
        updateSweet,
        deleteSweet,
        restockSweet
    };

    return <SweetContext.Provider value={value}>{children}</SweetContext.Provider>;
};

SweetProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useSweet = () => {
    const context = useContext(SweetContext);
    if (!context) {
        throw new Error('useSweet must be used within a SweetProvider');
    }
    return context;
};

export default SweetContext;

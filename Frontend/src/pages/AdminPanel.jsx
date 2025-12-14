import { useEffect, useState } from 'react';
import { useSweet } from '../context/SweetContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
    const { sweets, loading, fetchSweets, createSweet, deleteSweet, restockSweet } = useSweet();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        quantity: ''
    });
    const [restockData, setRestockData] = useState({});
    const [message, setMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
        fetchSweets();
    }, [user, navigate, fetchSweets]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await createSweet({
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity)
        });

        if (result.success) {
            setMessage(result.message);
            setFormData({ name: '', category: '', price: '', quantity: '' });
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.error);
        }
    };

    const handleRestock = async (id) => {
        const quantity = parseInt(restockData[id] || 0);

        if (quantity <= 0) {
            setMessage('Please enter a valid quantity');
            return;
        }

        const result = await restockSweet(id, quantity);

        if (result.success) {
            setMessage(result.message);
            setRestockData({ ...restockData, [id]: '' });
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.error);
        }
    };

    const handleDelete = async (id) => {
        const result = await deleteSweet(id);

        if (result.success) {
            setMessage(result.message);
            setShowDeleteConfirm(null);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.error);
        }
    };

    if (user && user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-gray-600">Manage your sweet inventory</p>
                </div>

            
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${message.includes('success') || message.includes('successfully') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {message}
                    </div>
                )}

            
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Sweet</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Sweet name (e.g., Gulab Jamun)"
                                required
                                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Category (e.g., Traditional)"
                                required
                                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Price (₹)"
                                required
                                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="Quantity"
                                required
                                className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Add Sweet
                        </button>
                    </form>
                </div>

               
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Sweet Inventory</h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-gray-600">Loading inventory...</p>
                        </div>
                    ) : sweets.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            No sweets in inventory. Add your first sweet above!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Restock</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sweets.map((sweet) => (
                                        <tr key={sweet._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sweet.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sweet.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">₹{sweet.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`font-semibold ${sweet.quantity === 0 ? 'text-red-500' : sweet.quantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {sweet.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={restockData[sweet._id] || ''}
                                                        onChange={(e) => setRestockData({ ...restockData, [sweet._id]: e.target.value })}
                                                        placeholder="Qty"
                                                        className="w-20 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => handleRestock(sweet._id)}
                                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Restock
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {showDeleteConfirm === sweet._id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleDelete(sweet._id)}
                                                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(sweet._id)}
                                                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

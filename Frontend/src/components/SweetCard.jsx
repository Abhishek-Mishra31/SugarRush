import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSweet } from '../context/SweetContext';

const SweetCard = ({ sweet }) => {
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const { purchaseSweet } = useSweet();

    const handlePurchase = async () => {
        if (quantity <= 0) {
            setMessage('Please enter a valid quantity');
            return;
        }

        if (quantity > sweet.quantity) {
            setMessage('Not enough stock available');
            return;
        }

        const result = await purchaseSweet(sweet._id, quantity);

        if (result.success) {
            setMessage(result.message);
            setQuantity(1);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.error);
        }
    };

    const isOutOfStock = sweet.quantity === 0;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">

            <div className="text-center mb-4">
                <div className="text-5xl mb-2">🧁</div>
            </div>


            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{sweet.name}</h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {sweet.category}
                    </span>
                    <span className="text-xl font-bold text-purple-600">
                        ₹{sweet.price}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                        {sweet.quantity} units
                    </span>
                </div>
            </div>


            <div className="border-t border-gray-200 pt-4">
                {!isOutOfStock ? (
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Quantity:</label>
                            <input
                                type="number"
                                min="1"
                                max={sweet.quantity}
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="w-20 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <button
                            onClick={handlePurchase}
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Purchase
                        </button>
                    </div>
                ) : (
                    <button
                        disabled={true}
                        className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                    >
                        Out of Stock
                    </button>
                )}


                {message && (
                    <div className={`mt-3 text-sm text-center font-medium ${message.includes('success') || message.includes('purchased') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

SweetCard.propTypes = {
    sweet: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        quantity: PropTypes.number.isRequired
    }).isRequired
};

export default SweetCard;

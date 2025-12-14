import { useEffect, useState } from 'react';
import { useSweet } from '../context/SweetContext';
import Navbar from '../components/Navbar';
import SweetCard from '../components/SweetCard';
import Input from '../components/UI/Input';

const Dashboard = () => {
    const { sweets, loading, fetchSweets, searchSweets } = useSweet();
    const [searchQuery, setSearchQuery] = useState({
        name: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchSweets();
    }, [fetchSweets]);

    const handleSearch = async (e) => {
        e.preventDefault();

        const query = {};
        if (searchQuery.name) query.name = searchQuery.name;
        if (searchQuery.category) query.category = searchQuery.category;
        if (searchQuery.minPrice) query.minPrice = searchQuery.minPrice;
        if (searchQuery.maxPrice) query.maxPrice = searchQuery.maxPrice;

        if (Object.keys(query).length > 0) {
            await searchSweets(query);
        } else {
            await fetchSweets();
        }
    };

    const handleReset = () => {
        setSearchQuery({
            name: '',
            category: '',
            minPrice: '',
            maxPrice: ''
        });
        fetchSweets();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">Browse and purchase your favorite sweets</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Sweets</h2>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="text"
                                value={searchQuery.name}
                                onChange={(e) => setSearchQuery({ ...searchQuery, name: e.target.value })}
                                placeholder="Search by name"
                                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                value={searchQuery.category}
                                onChange={(e) => setSearchQuery({ ...searchQuery, category: e.target.value })}
                                placeholder="Search by category"
                                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                value={searchQuery.minPrice}
                                onChange={(e) => setSearchQuery({ ...searchQuery, minPrice: e.target.value })}
                                placeholder="Min price"
                                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                value={searchQuery.maxPrice}
                                onChange={(e) => setSearchQuery({ ...searchQuery, maxPrice: e.target.value })}
                                placeholder="Max price"
                                className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">Loading sweets...</p>
                    </div>
                )}

               
                {!loading && sweets?.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
                        <div className="text-6xl mb-4">🍬</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No sweets found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                )}

              
                {!loading && sweets?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sweets.map((sweet) => (
                            <SweetCard key={sweet._id} sweet={sweet} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

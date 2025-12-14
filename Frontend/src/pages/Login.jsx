import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, loginAdmin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
          
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const loginFunction = isAdmin ? loginAdmin : login;
        const result = await loginFunction(formData.email, formData.password);

        if (result.success) {

        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="grid lg:grid-cols-2 min-h-screen">
                <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
                    <div className="max-w-xl">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            Welcome to SugarRush
                        </h1>
                        <p className="text-xl text-white/90 mb-8 leading-relaxed">
                            Your one-stop destination for delicious traditional and modern sweets.
                            Browse our extensive collection, manage your orders, and enjoy the sweetness of life!
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Wide Selection</h3>
                                    <p className="text-white/80">Browse through our diverse collection of traditional and modern sweets</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Easy Ordering</h3>
                                    <p className="text-white/80">Simple and secure ordering process with real-time stock updates</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-white/20 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Quality Assured</h3>
                                    <p className="text-white/80">Fresh, high-quality sweets delivered with care</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              
                <div className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        
                        <div className="lg:hidden text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Sweet Shop
                            </h1>
                            <p className="text-gray-600">Your favorite sweets, just a click away</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                           
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Login to Your Account
                                </h2>
                                <p className="text-gray-600">Welcome back! Please enter your details</p>
                            </div>

                           
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                          
                            <div className="flex items-center justify-center mb-6">
                                <label className="flex items-center cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                        className="mr-2 w-4 h-4 accent-purple-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Login as Admin</span>
                                </label>
                            </div>

                         
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email address"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                          
                            <div className="mt-6 text-center">
                                <p className="text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700">
                                        Sign up here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

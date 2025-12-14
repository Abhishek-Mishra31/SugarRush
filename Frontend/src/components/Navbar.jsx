import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    <Link
                        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        className="flex items-center space-x-2"
                    >
                        <span className="text-xl font-bold text-gray-800">
                            SugarRush
                        </span>
                    </Link>


                    {user && (
                        <div className="hidden md:flex items-center space-x-6">
                            {user.role !== 'admin' && (
                                <Link
                                    to="/dashboard"
                                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                                >
                                    Admin Panel
                                </Link>
                            )}

                            <div className="flex items-center space-x-4">
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                
                    {user && (
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMobileMenuOpen ? (
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

         
            {user && isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-4 pt-2 pb-4 space-y-3">
                        {user.role !== 'admin' && (
                            <Link
                                to="/dashboard"
                                className="block text-gray-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                        )}
                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="block text-gray-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin Panel
                            </Link>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                            <p className="font-semibold text-gray-800 px-4">{user.name}</p>
                            <p className="text-sm text-gray-500 capitalize mb-3 px-4">{user.role}</p>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

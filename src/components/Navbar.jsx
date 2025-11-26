import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const initial = currentUser?.displayName
        ? currentUser.displayName.charAt(0).toUpperCase()
        : currentUser?.email
            ? currentUser.email.charAt(0).toUpperCase()
            : 'U';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-">C</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                            CodeCoach
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider">
                            Dashboard
                        </Link>
                        <Link to="/history" className="text-gray-300 hover:text-white transition-colors font-medium text-sm uppercase tracking-wider">
                            History
                        </Link>

                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                            {/* Profile Circle */}
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 p-[2px] shadow-lg shadow-blue-500/20">
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{initial}</span>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-16 right-4 w-48 md:hidden bg-gray-950 border border-gray-800 rounded-xl shadow-2xl">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/history"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
                        >
                            History
                        </Link>
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                handleLogout();
                            }}
                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

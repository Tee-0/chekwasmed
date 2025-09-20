import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    PlusCircleIcon,
    ListBulletIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

//Main layout wrapper for authenticated pages
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    //Navigation items

    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            description: 'Overview of your medication and conflicts'
        },
        {
            name: 'Add medication',
            href: '/add-medication',
            icon: PlusCircleIcon,
            description: 'Add medications to your list'
        },
        {
            name: 'My medications',
            href: '/medications',
            icon: ListBulletIcon,
            description: 'View your medications'
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: UserIcon,
            description: 'Update your information'
        }
    ];

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Check if current path is active
    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <ShieldCheckIcon className="h-8 w-8 text-medical-500" />
                                <span className="text-xl font-bold text-gray-900">ChekwasMed</span>
                            </Link>
                        </div>


                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`
                      flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActivePath(item.href)
                                                ? 'bg-medical-100 text-medical-700 border border-medical-200'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }
                                        `}
                                        title={item.description}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* User Info */}
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.role || 'Patient'}
                                </p>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                      ${isActivePath(item.href)
                                                ? 'bg-medical-100 text-medical-700'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }
                    `}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile User Info */}
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user?.email || 'No email'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/**Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <ShieldCheckIcon className="h-6 w-6 text-medical-500" />
                                <span className="text-lg font-bold text-gray-900">ChekwasMed</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                AI-powered medication conflict checking for safer healthcare.
                            </p>
                        </div>

                        {/**Quick Links */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Acions</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/add-medication" className="text-sm text-gray-600 hover:text-medical-600">
                                        Add New Medication
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/medications" className="text-sm text-gray-600 hover:text-medical-600">
                                        View My Medications
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={() => window.location.href = 'tel:911'}
                                        className="text-sm text-danger-600 hover:text-danger-700"
                                    >
                                        Emergency: Call 911
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/**Support */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="mailto:support@chekwasmed.com" className="text-sm text-gray-600 hover:text-medical-600">
                                        Contact Support
                                    </a>
                                </li>
                                <li>
                                    <a href="/privacy" className="text-sm text-gray-600 hover:text-medical-600">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="/terms" className="text-sm text-gray-600 hover:text-medical-600">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200"></div>
                    <p className="text-center text-xs text-gray-500">
                        @2025 ChekwasMed. This tool is for informational purposes only.
                        Always consult your healthcare provider for medical advice.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;


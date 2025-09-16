import React from 'react';

//loading spinner component - shows while API calls are in progress
const LoadingSpinner = ({ size = 'medium', message = 'Loading...', className = '' }) => {
    //Size variants
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    return (
        <div > className={`flex flex-col items-center justify-center p-4 ${className}`}
            {/*Animated Spinner */}
            <div className={`${sizeClasses[size]} border-4 border-medical-200 border-t-medical-500 rounded-full animate-spin`} >
            </div>

            {/**loading message */}
            {message && (
                <p className="mt-2 text-sm text-gray-600 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

// Full-screen loading overlay
export const FullPageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="mt-4 text-lg text-gray-700">{message}</p>
            </div>
        </div>
    );
};

// Inline loader for buttons
export const ButtonLoader = ({ className = '' }) => {
    return (
        <div className={`inline-flex items-center ${className}`}>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2">
            </div>
            Processing...
        </div>
    );
};

export default LoadingSpinner;
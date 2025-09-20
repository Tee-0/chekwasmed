import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Text on leftside of screen */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Welcome to ChekwasMed
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Avoid dangerous medicine conflicts that could lead to potential harm.
          </p>
          <p className="mt-2 text-gray-500">
            Our AI-powered tool helps you quickly check if your medications may interact,
            so you can make safer health decisions — anytime, anywhere.
          </p>
        </div>

        {/* Text on right side of screen Get Started Box */}
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center">
          {!user ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get Started</h2>

              <Link
                to="/register"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mb-4">
                Register
              </Link>

              {/**Login button */}
              <Link
                to="/login"
                className="w-full border border-blue-600 text-blue-600 font-medium py-3 px-4 rounded-lg">
                Login
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Welcome back, {user.name || "User"}!
              </h2>
              <Link
                to="/dashboard"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
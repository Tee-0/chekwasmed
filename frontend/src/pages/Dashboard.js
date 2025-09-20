import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { medicationAPI, userMedicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const Dashboard = () => {
    const { user } = useAuth();
    const [medications, setMedications] = useState([]);
    const [userMedications, setUserMedications] = useState([]);
    const [stats, setStats] = useState({
        totalMedications: 0,
        activeMedications: 0,
        recentlyAdded: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

     useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
     try {
      setLoading(true);
      setError('');
      
      // Fetch both medications and user medications
      const [medsResponse, userMedsResponse] = await Promise.all([
        medicationAPI.getAll(),
        userMedicationAPI.getAll()
      ]);
      
      setMedications(medsResponse.data || []);
      setUserMedications(userMedsResponse.data || []);
      
      // Calculate stats
      const totalMeds = medsResponse.data?.length || 0;
      const activeMeds = userMedsResponse.data?.length || 0;
      
      // Recently added (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentMeds = (medsResponse.data || []).filter(med => 
        new Date(med.createdAt) > sevenDaysAgo
      ).length;
      
      setStats({
        totalMedications: totalMeds,
        activeMedications: activeMeds,
        recentlyAdded: recentMeds
      });
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if(loading) return <LoadingSpinner />;
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your medication management
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMedications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeMedications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recently Added</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentlyAdded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/medications/add" 
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium text-blue-900">Add New Medication</span>
            </Link>
            
            <Link 
              to="/medications" 
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="h-5 w-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-medium text-green-900">View All Medications</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="h-5 w-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-purple-900">Update Profile</span>
            </Link>
          </div>
        </div>

        {/* Recent Medications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Medications</h2>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medications yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first medication.</p>
              <Link 
                to="/medications/add"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Medication
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.slice(0, 3).map((med) => (
                <div key={med._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-500">{med.category || 'General'}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(med.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {medications.length > 3 && (
                <Link 
                  to="/medications" 
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-2"
                >
                  View all {medications.length} medications →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
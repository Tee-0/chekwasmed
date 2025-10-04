import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { medicationAPI } from '../services/api';
import { userMedicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const MedicationList = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching user medications...');
      const response = await userMedicationAPI.getAll();
      console.log('Response received:', response); // ADD THIS
      console.log('Medications data:', response.medications); // ADD THIS
      setMedications(response.medications|| []);
    } catch (err) {
      console.error('fetch medications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await userMedicationAPI.delete(id);
      setMedications(prev => prev.filter(med => med._id !== id));
    } catch (err) {
      console.error('Delete medication error:', err);
      setError('Failed to delete medication. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/userMedications/edit/${id}`);
  };

  //filter medications based on search term and category
  const filteredMedications = medications.filter(med => {
    const medicationName = med.medicationId?.genericName || '';
    const matchesSearch = medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || med.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  //Get unique categories for filter dropdown
  const categories = [...new Set(medications.map(med => med.medicationId?.drugClass).filter(Boolean))];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600 mt-1">Manage your medication data</p>
        </div>
        <Link
          to="/medications/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Medication
        </Link>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search medications</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search medications..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <label htmlFor="category" className="sr-only">Filter by category</label>
            <select
              id="category"
              className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredMedications.length} of {medications.length} medications
        </div>
      </div>

      {/* Medications Grid/List */}
      {filteredMedications.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {medications.length === 0 ? 'No medications found' : 'No medications match your search'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {medications.length === 0
              ? 'Get started by adding your first medication.'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
          {medications.length === 0 && (
            <div className="mt-6">
              <Link
                to="/medications/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add your first medication
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((medication) => (
            <div key={medication._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {medication.medicationId?.genericName || 'Unknown Medication'}
                    </h3>
                    {medication.medicationId?.drugClass && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                       {medication.medicationId.drugClass} 
                      </span>
                    )}
                  </div>
                </div>

                {medication.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {medication.description}
                  </p>
                )}

                {/* Medication details */}
                <div className="mt-4 space-y-2">
                  {medication.dosage && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>Dosage: {medication.dosage}</span>
                    </div>
                  )}

                  {medication.sideEffects && medication.sideEffects.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>{medication.sideEffects.length} side effects</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Added {new Date(medication.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(medication._id)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(medication._id, medication.name)}
                      disabled={deleteLoading === medication._id}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                    >
                      {deleteLoading === medication._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicationList;
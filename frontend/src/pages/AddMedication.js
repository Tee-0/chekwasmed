import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userMedicationAPI, medicationAPI } from '../services/api';
import Alert from '../components/Alert';

const AddMedication = () => {
  const [formData, setFormData] = useState({
    medicationId: '',
    dosage: '',
    frequency: '',
    prescribedBy: '',
    startDate: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, medicationName: query }));

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await medicationAPI.search(query); // uses your existing /medications/search endpoint
      setSearchResults(res.medications);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const selectMedication = (med) => {
    console.log('selectMedication called with:', med); // ← ADD THIS
    console.log('med._id is:', med._id); // ← AND THIS

    setFormData(prev => ({
      ...prev,
      medicationName: med.genericName,
      medicationId: med._id // store the ObjectId here for backend
    }));
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted! FormData:', formData); // ← ADD THIS LINE

    if (!formData.medicationId || !formData.dosage || !formData.frequency) {
      setError('Medication ID, dosage, and frequency are required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await userMedicationAPI.add(
        formData.medicationId,
        formData.dosage,      // just the string here
        formData.frequency
      );

      setSuccess('Medication added successfully!');
      setTimeout(() => navigate('/medications'), 1500);
    } catch (err) {
      console.error('Add medication error:', err);
      setError(err.response?.data?.message || 'Failed to add medication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link to="/medications" className="text-blue-600 hover:text-blue-800 mr-4">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Medication</h1>
        </div>
        <p className="text-gray-600">Enter the details for the medication you are taking</p>
      </div>

      {error && <Alert type="error" message={error} className="mb-6" />}
      {success && <Alert type="success" message={success} className="mb-6" />}

      <div className="bg-white rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medication Name*
            </label>
            <input
              type="text"
              name="medicationName"
              value={formData.medicationName || ''}
              onChange={handleSearchChange}
              placeholder="Type medication name"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            {searchResults.length > 0 && (
              <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto">
                {searchResults.map((med) => (
                  <li
                    key={med._id}
                    className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectMedication(med)}
                  >
                    {med.genericName} {med.brandNames?.length ? `(${med.brandNames.join(', ')})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              placeholder="e.g., 500mg twice daily"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              placeholder="e.g., twice daily"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescribed By
            </label>
            <input
              type="text"
              name="prescribedBy"
              value={formData.prescribedBy}
              onChange={handleInputChange}
              placeholder="Doctor or pharmacist"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Optional notes about this medication"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Link
              to="/medications"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedication;

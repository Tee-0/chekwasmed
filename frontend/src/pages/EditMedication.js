import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { medicationAPI } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const EditMedication = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        dosage: '',
        sideEffects: [],
        interactions: []
    });

    const [currentSideEffect, setCurrentSideEffect] = useState('');
    const [currentInteraction, setCurrentInteraction] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const categories = [
        'Pain Relief',
        'Antibiotics',
        'Antiviral',
        'Cardiovascular',
        'Diabetes',
        'Mental Health',
        'Allergy',
        'Respiratory',
        'Digestive',
        'Skin Care',
        'Vitamins & Supplements',
        'Other'
    ];

    useEffect(() => {
        if (id) {
            fetchMedication();
        }
    }, [id]);

    const fetchMedication = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await medicationAPI.getById(id);
            const medication = response.data;

            setFormData({
                name: medication.name || '',
                category: medication.category || '',
                description: medication.description || '',
                dosagee: medication.dosage || '',
                sideEffects: medication.sideEffects || [],
                interactions: medication.interactions || []
            });
        } catch (err) {
            console.error('Fetch medication error:', err);
            setError('Failed to load medication. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };



    const addToArray = (arrayName, value, setter) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [arrayName]: [...prev[arrayName], value.trim()]
            }));
            setter('');
        }
    };

    const removeFromArray = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) {
            setError('Medication name is required');
            return;
        }

        try {
            setSubmitLoading(true);
            setError('');
            setSuccess('');

            // Clean up the data before sending
            const cleanedData = {
                ...formData,
                name: formData.name.trim(),
                category: formData.category || undefined,
                description: formData.description.trim() || undefined,
                dosage: formData.dosage.trim() || undefined,
                sideEffects: formData.sideEffects.filter(se => se.trim()),
                interactions: formData.interactions.filter(int => int.trim()),
                contraindications: formData.contraindications.filter(con => con.trim())
            };

            await medicationAPI.update(id, cleanedData);
            setSuccess('Medication updated successfully!');

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/medications');
            }, 1500);

        } catch (err) {
            console.error('Update medication error:', err);
            setError(err.response?.data?.message || 'Failed to update medication. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Link
                        to="/medications"
                        className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Medication</h1>
                </div>
                <p className="text-gray-600">Update the medication details</p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}
            {success && <Alert type="success" message={success} className="mb-6" />}

            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Medication Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Aspirin"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>


                        <div className="mt-4">
                            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage Information
                            </label>
                            <input
                                type="text"
                                id="dosage"
                                name="dosage"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 500mg twice daily"
                                value={formData.dosage}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Brief description of the medication and its uses..."
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Side Effects */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Side Effects</h3>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter a side effect"
                                value={currentSideEffect}
                                onChange={(e) => setCurrentSideEffect(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addToArray('sideEffects', currentSideEffect, setCurrentSideEffect);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => addToArray('sideEffects', currentSideEffect, setCurrentSideEffect)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add
                            </button>
                        </div>

                        {formData.sideEffects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.sideEffects.map((effect, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                                        {effect}
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('sideEffects', index)}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Drug Interactions */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Drug Interactions</h3>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter a drug interaction"
                                value={currentInteraction}
                                onChange={(e) => setCurrentInteraction(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addToArray('interactions', currentInteraction, setCurrentInteraction);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => addToArray('interactions', currentInteraction, setCurrentInteraction)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Add
                            </button>
                        </div>

                        {formData.interactions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.interactions.map((interaction, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                                        {interaction}
                                        <button
                                            type="button"
                                            onClick={() => removeFromArray('interactions', index)}
                                            className="ml-2 text-yellow-600 hover:text-yellow-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                        <Link
                            to="/medications"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitLoading ? 'Updating...' : 'Update Medication'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMedication;
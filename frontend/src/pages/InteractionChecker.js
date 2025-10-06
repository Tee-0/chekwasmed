import React, { useState, useEffect } from 'react';
import { userMedicationAPI, medicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const InteractionChecker = () => {
    const [myMedications, setMyMedications] = useState([]);
    const [allMedications, setAllMedications] = useState([]);
    const [selectedMeds, setSelectedMeds] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [medsResponse, myMedsResponse] = await Promise.all([
                medicationAPI.getAll(),
                userMedicationAPI.getAll()
            ]);

            setAllMedications(medsResponse.data || []);

            const myMeds = myMedsResponse.medications || [];
            setMyMedications(myMeds);

            const currentMedIds = myMeds.map(um => um.medicationId?._id)
                .filter(Boolean);
            setSelectedMeds(currentMedIds);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const checkInteractions = () => {
        setChecking(true);
        const foundInteractions = [];

        // Get selected medication objects
        const selectedMedications = allMedications.filter(med =>
            selectedMeds.includes(med._id)
        );

        for (let i = 0; i < selectedMedications.length; i++) {
            const med1 = selectedMedications[i];

            for (let j = i + 1; j < selectedMedications.length; j++) {
                const med2 = selectedMedications[j];


                //Check if med1 lists med2 as an interaction
                const med1InteratctsWithMed2 = med1.interactions?.some(interaction =>
                    med2.genericName?.toLowerCase().includes(interaction.toLowerCase()) ||
                    interaction.toLowerCase().includes(med2.genericName?.toLowerCase() || '')
                );

                // Check if med2 lists med1 as an interaction
                const med2InteractsWithMed1 = med2.interactions?.some(interaction =>
                    med1.genericName?.toLowerCase().includes(interaction.toLowerCase()) ||
                    interaction.toLowerCase().includes(med1.genericName?.toLowerCase() || '')
                );

                if (med1InteratctsWithMed2 || med2InteractsWithMed1) {
                    foundInteractions.push({
                        med1: med1.genericName,
                        med2: med2.genericName,
                        severity: 'moderate',
                        severity: 'moderate',
                        description: `${med1.genericName} may interact with ${med2.genericName}. Consult your healthcare provider`
                    });
                }
            }

        }

        setInteractions(foundInteractions);
        setChecking(false);
    };

    useEffect(() => {
        if (selectedMeds.length >= 2) {
            checkInteractions();
        } else {
            setInteractions([]);
        }
    }, [selectedMeds]);

    const toggleMedication = (medId) => {
        setSelectedMeds(prev => {
            if (prev.includes(medId)) {
                return prev.filter(id => id !== medId);
            } else {
                return [...prev, medId];
            }
        });
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 border-red-300 text-red-800';
            case 'moderate':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'low':
                return 'bg-blue-100 border-blue-300 text-blue-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'high':
                return (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'moderate':
                return (
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Drug Interaction Checker</h1>
                <p className="text-gray-600 mt-1">Check for potential interactions between medications</p>
            </div>

            {error && <Alert type="error" message={error} className="mb-6" />}

            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Medical Disclaimer:</strong> This tool provides basic interaction information based on medication data.
                            Always consult with your healthcare provider or pharmacist before starting, stopping, or changing any medications.
                            This is not a substitute for professional medical advice.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Medication Selection Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Medications</h2>

                        {myMedications.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Currently Taking:</p>
                                <div className="space-y-2">
                                    {myMedications.map(userMed => {
                                        const med = userMed.medicationId; // FIXED: Changed from userMed.medication
                                        if (!med) return null;
                                        return (
                                            <label key={med._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMeds.includes(med._id)}
                                                    onChange={() => toggleMedication(med._id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-900">{med.genericName}</span> {/* FIXED: Changed from med.name */}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {allMedications.length > myMedications.length && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Other Available Medications:</p>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {allMedications
                                        .filter(med => !myMedications.some(um => um.medicationId?._id === med._id)) // FIXED: Changed from um.medication
                                        .map(med => (
                                            <label key={med._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMeds.includes(med._id)}
                                                    onChange={() => toggleMedication(med._id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-gray-900">{med.genericName}</span> {/* FIXED: Changed from med.name */}
                                                {med.category && (
                                                    <span className="ml-auto text-xs text-gray-500">{med.category}</span>
                                                )}
                                            </label>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                            <div className="text-sm text-gray-600">
                                <p className="font-medium">Selected: {selectedMeds.length} medication(s)</p>
                                {selectedMeds.length < 2 && (
                                    <p className="text-xs text-gray-500 mt-1">Select at least 2 medications to check for interactions</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Interaction Results</h2>

                        {selectedMeds.length < 2 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No medications selected</h3>
                                <p className="mt-1 text-sm text-gray-500">Select at least 2 medications from the left panel to check for interactions</p>
                            </div>
                        ) : checking ? (
                            <div className="text-center py-12">
                                <LoadingSpinner message="Checking for interactions..." />
                            </div>
                        ) : interactions.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No known interactions found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    The selected medications do not have documented interactions in our database.
                                    However, always consult your healthcare provider.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                {interactions.length} potential interaction(s) found
                                            </h3>
                                            <p className="mt-1 text-sm text-red-700">
                                                Please consult your healthcare provider about these interactions.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {interactions.map((interaction, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                {getSeverityIcon(interaction.severity)}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h4 className="text-sm font-medium">
                                                    {interaction.med1} ⚠️ {interaction.med2}
                                                </h4>
                                                <p className="mt-1 text-sm">
                                                    {interaction.description}
                                                </p>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${interaction.severity === 'high' ? 'bg-red-200 text-red-800' :
                                                        interaction.severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                                                            'bg-blue-200 text-blue-800'
                                                        }`}>
                                                        {interaction.severity.toUpperCase()} SEVERITY
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractionChecker;




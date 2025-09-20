import React, { useState } from 'react';
import { authAPI, medicationAPI } from '../services/api';
import Alert from '../components/alert';

const TestConnection = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const runTest = async (testName, testFunction) => {
        setLoading(true);
        try {
            const result = await testFunction();
            setResults(prev => ({
                ...prev,
                [testName]: { success: true, data: result }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [testName]: { success: false, error: error.message }
            }));
        }
        setLoading(false);

    };

    const test = [
        {
            name: 'Profile',
            description: 'Test getting user profile',
            function: () => authAPI.getProfile()
        },
        {
            name: 'Medications',
            description: 'Test getting medications list',
            function: () => medicationAPI.getAll()
        }
    ];

    return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">API Connection Test</h1>
        
        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{test.name}</h3>
                <button
                  onClick={() => runTest(test.name, test.function)}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              
              {results[test.name] && (
                <div className="mt-3">
                  {results[test.name].success ? (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-green-800 font-medium">✅ Success!</p>
                      <pre className="text-xs text-green-700 mt-2 overflow-auto">
                        {JSON.stringify(results[test.name].data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-800 font-medium">❌ Failed</p>
                      <p className="text-red-700 text-sm mt-1">
                        {results[test.name].error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestConnection;

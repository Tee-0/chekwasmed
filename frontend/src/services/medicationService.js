//instead of making axios calls directly in components, we create a service layer
import axios from 'axios';

//Medication serive handles all medication-related API calls
class MedicationService {
    constructor() {
        //Base URL for medication endpoints
        this.baseURL = '/medications';
    }

    //general error handler
    handleError(error) {
        console.error('API Error:', error);

        if (error.response?.status === 401) {
            // Token expired or invalid - redirect to login
            localStorage.removeItem('chekwasmed_token');
            localStorage.removeItem('chekwasmed_user');
            window.location.href = '/login';
            return { success: false, message: 'Session expired. Please log in again.' };
        }

        const message = error.response?.data?.message || 'An unexpected error occurred';
        return { success: false, message };
    }

    //search for medications in the database
    async searchMedications(searchTerm) {
        try {
            if (!searchTerm || searchTerm.length < 2) {
                return { success: true, medications: [] };
            }
            const response = await axios.get(`${this.baseURL}/search`, {
                params: { q: searchTerm }
            });

            return {
                success: 'true',
                medications: response.data.medications,
                count: response.data.count
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async addUserMedication(medicationData) {
        try {
            const response = await axios.post(`${this.baseURL}/user-medications`, {
                medicationId: medicationData.medicationId,
                dosage: medicationData.dosage,
                frequency: medicationData.frequency,
                prescribedBy: medicationData.prescribedBy,
                startDate: medicationData.startDate,
                notes: medicationData.notes
            });

            return {
                success: true,
                userMedication: response.data.userMedication,
                message: response.data.message
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Update user's medication
    async updateUserMedication(medicationId, updateData) {
        try {
            const response = await axios.put(`${this.baseURL}/user-medications/${medicationId}`, updateData);

            return {
                success: true,
                userMedication: response.data.userMedication,
                message: response.data.message
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    //remove medication from user's list
    async removeUserMedication(medicationId) {
        try {
            const response = await axios.delete(`${this.baseURL}/user-medications/${medicationId}`);

            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Check for drug conflicts
    async checkConflicts() {
        try {
            const response = await axios.post(`${this.baseURL}/check-conflicts`);

            return {
                success: true,
                conflicts: response.data.conflicts,
                conflictsFound: response.data.conflictsFound,
                medicationCount: response.data.medicationCount,
                riskLevel: response.data.riskLevel
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get medication details by ID
    async getMedicationDetails(medicationId) {
        try {
            const response = await axios.get(`${this.baseURL}/${medicationId}`);

            return {
                success: true,
                medication: response.data.medication
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Bulk import medications from a list
    async importMedications(medicationList) {
        try {
            const response = await axios.post(`${this.baseURL}/import`, {
                medications: medicationList
            });

            return {
                success: true,
                imported: response.data.imported,
                failed: response.data.failed,
                message: response.data.message
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Get medication interaction history
    async getInteractionHistory() {
        try {
            const response = await axios.get(`${this.baseURL}/interaction-history`);

            return {
                success: true,
                history: response.data.history
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    //Helper function: format medication for display
    formatMedicationForDisplay(medication) {
        return {
            id: medication.id,
            name: medication.medication?.name || 'Unknown medication',
            brandNames: medication.medication?.brandNames?.join(', ') || '',
            dosage: medication.dosage,
            frequency: medication.frequency,
            startDate: new Date(medication.startDate).toLocaleDateString(),
            prescribedBy: medication.prescribedBy || 'Not specified',
            drugClass: medication.medication?.drugClass || 'Unknown',
            therapeuticArea: medication.medication?.therapeuticArea || 'Unknown'
        };
    }

    //Helper function: Validate medication data before sending
    validateMedicationData(data) {
        const errors = [];

        if (!data.medicationId) {
            errors.push('Please select a medication');
        }

        if (!data.dosage || !data.dosage.amount || !data.dosage.unit) {
            errors.push('Please specify dosage, amount and unit');
        }

        if (!data.frequency || !data.frequency.timesPerDay) {
            errors.push('Please specify how often to take this medication');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Helper function: Get risk level color for UI
    getRiskLevelColor(riskLevel) {
        switch (riskLevel) {
            case 'low':
                return 'text-safe-600 bg-safe-100';
            case 'low-moderate':
                return 'text-warning-600 bg-warning-100';
            case 'moderate':
                return 'text-warning-700 bg-warning-200';
            case 'high':
                return 'text-danger-600 bg-danger-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    }

    // Helper function: Get conflict severity color for UI
    getConflictSeverityColor(severity) {
        switch (severity) {
            case 'minor':
                return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'moderate':
                return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'major':
                return 'text-red-600 bg-red-100 border-red-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    }
}

//Export singleton instance
export default new MedicationService();
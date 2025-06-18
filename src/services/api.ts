import { API_BASE_URL } from '@env';

const API_URL = API_BASE_URL;

console.log('API_BASE_URL:', API_URL);

export const api = {

    getUserProfile: async (uid: string) => {
        const response = await fetch(`${API_URL}/api/users/${uid}`);
        return response.json();
    },

    //User configuration file 
    updateUserProfile: async (uid: string, profileData: any) => {
        const cleanProfileData = Object.fromEntries(
            Object.entries(profileData).filter(([_, v]) => v !== undefined)
        );
        const response = await fetch(`${API_URL}/api/user/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, ...cleanProfileData })
        });
        return response.json();
    },

    // food record 
    recordDiet: async (dietData: any) => {
        const response = await fetch(`${API_URL}/api/diet/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dietData)
        });
        return response.json();
    },

    // Get diet records (optional date filtering)
    getDietRecords: async (uid: string, startDate?: string, endDate?: string) => {
        if (!uid) {
            return { success: false, message: 'User ID is required' };
        }
        try {
            let url = `${API_URL}/api/diet/records/${uid}`;
            if (startDate && endDate) {
                url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get diet records');
            }
            return data;
        } catch (error: any) {
            console.error('Error getting diet records:', error);
            return { success: false, message: error.message || 'Failed to get diet records' };
        }
    },

    // Sports records 
    recordExercise: async (exerciseData: any) => {
        const response = await fetch(`${API_URL}/api/exercise/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exerciseData)
        });
        return response.json();
    },

    // Get exercise records (optional date filtering)
    getExerciseRecords: async (uid: string, startDate?: string, endDate?: string) => {
        if (!uid) {
            return { success: false, message: 'User ID is required' };
        }
        try {
            let url = `${API_URL}/api/exercise/records/${uid}`;
            if (startDate && endDate) {
                url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to get exercise records');
            }
            return data;
        } catch (error: any) {
            console.error('Error getting exercise records:', error);
            return { success: false, message: error.message || 'Failed to get exercise records' };
        }
    },

    // Reminder notification 
    createNotification: async (notificationData: any) => {
        const response = await fetch(`${API_URL}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData)
        });
        return response.json();
    },

    // Get reminder 
    getNotifications: async (uid: string) => {
        if (!uid) {
            return { success: false, message: 'User ID is required' };
        }
        try {
            const response = await fetch(`${API_URL}/api/notifications/${uid}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                return { success: false, message: errorText || 'Failed to fetch notifications' };
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Network or unknown error in getNotifications:', error);
            return { success: false, message: 'Unable to connect to the server' };
        }
    },

    // Delete reminder 
    deleteNotification: async (id: string) => {
        const response = await fetch(`${API_URL}/api/notifications/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    //Data synchronization 
    syncData: async (uid: string) => {
        if (!uid) {
            return { success: false, message: 'User ID is required' };
        }
        try {
            const response = await fetch(`${API_URL}/api/data/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, lastSyncTime: new Date().toISOString() })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Sync failed');
            }
            return data;
        } catch (error: any) {
            console.error('Sync error:', error);
            return { success: false, message: error.message || 'Failed to sync data' };
        }
    },

    // Get statistics 
    getStatistics: async (uid: string, startDate: string, endDate: string) => {
        const response = await fetch(`${API_URL}/api/statistics/${uid}?startDate=${startDate}&endDate=${endDate}`);
        return response.json();
    },

    // Get nearby healthy restaurants
    getNearbyHealthyRestaurants: async (latitude: number, longitude: number, radius?: number) => {
        try {
            const response = await fetch(
                `${API_URL}/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius || 1500}`
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting nearby restaurants:', error);
            throw new Error('Failed to get nearby restaurants');
        }
    },

    // Get restaurant details
    getRestaurantDetails: async (placeId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/places/details/${placeId}`);
            return response.json();
        } catch (error) {
            console.error('Error getting restaurant details:', error);
            throw new Error('Failed to get restaurant details');
        }
    },

    //Biometric related API 
    updateBiometricStatus: async (uid: string, biometricEnabled: boolean) => {
        try {
            const response = await fetch(`${API_URL}/api/user/biometric`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    biometricEnabled,
                    biometricUpdatedAt: new Date().toISOString()
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Update Face ID status failed');
            }
            return data;
        } catch (error) {
            console.error('Update Face ID status error:', error);
            throw new Error('Update Face ID status failed');
        }
    },
};
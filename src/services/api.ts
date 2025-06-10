import { API_BASE_URL } from '@env';

const API_URL = API_BASE_URL;

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
        try {
            let url = `${API_URL}/api/diet/records/${uid}`;
            if (startDate && endDate) {
                url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
            }
            const response = await fetch(url);
            return response.json();
        } catch (error) {
            console.error('Error getting diet records:', error);
            throw new Error('Failed to get diet records, please try again later.');
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
        try {
            let url = `${API_URL}/api/exercise/records/${uid}`;
            if (startDate && endDate) {
                url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
            }
            const response = await fetch(url);
            return response.json();
        } catch (error) {
            console.error('Error getting exercise records:', error);
            throw new Error('Failed to get exercise records, please try again later.');
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
        try {
            const response = await fetch(`${API_URL}/api/notifications/${uid}`);
            // 檢查回應是否成功，或是否有內容
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                return { success: false, message: errorText || 'Failed to fetch notifications' };
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                // 如果解析失敗，說明伺服器返回的不是合法的 JSON
                console.error("Error parsing JSON from getNotifications:", e, "Response text:", text);
                return { success: false, message: text || 'Invalid JSON response from server' };
            }
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
        const response = await fetch(`${API_URL}/api/data/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, lastSyncTime: new Date().toISOString() })
        });
        return response.json();
    },

    // Get statistics 
    getStatistics: async (uid: string, startDate: string, endDate: string) => {
        const response = await fetch(`${API_URL}/api/statistics/${uid}?startDate=${startDate}&endDate=${endDate}`);
        return response.json();
    }
};
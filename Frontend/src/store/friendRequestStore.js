import { create } from 'zustand'
import { devtools } from 'zustand/middleware';
import axiosInstance from '../axios/axiosInstance'

const useFriendRequestStore = create(devtools((set, get) => ({
    friendStatus: {},

    setFriendStatus: (userId, status) => {
        if (!userId) return; // Add check for userId
        set((state) => ({ 
            friendStatus: { ...state.friendStatus, [userId]: status } 
        }));
    },

    fetchFriendStatus: async (userId) => {
        // Add validation check
        if (!userId) {
            console.warn('fetchFriendStatus called with invalid userId');
            return;
        }

        try {
            const res = await axiosInstance.get(`/friend-request/status/${userId}`);
            set((state) => ({
                friendStatus: {
                    ...state.friendStatus,
                    [userId]: res.data.status,
                }
            }));
        } catch (err) {
            console.error("Error fetching friends status", err);
            // Add error state if needed
            set((state) => ({
                friendStatus: {
                    ...state.friendStatus,
                    [userId]: 'error'
                }
            }));
        }
    }
}), { name: 'FriendRequestStore' }));

export default useFriendRequestStore;

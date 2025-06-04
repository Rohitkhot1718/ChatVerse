import { create } from 'zustand'
import { devtools } from 'zustand/middleware';
import axiosInstance from '../axios/axiosInstance'

const useFriendRequestStore = create(devtools((set, get) => ({
    friendStatus: {},

    setFriendStatus: (userId, status) =>
        set((state) => ({ friendStatus: { ...state.friendStatus, [userId]: status } })),

    fetchFriendStatus: async (userId) => {
        try {
            const res = await axiosInstance.get(`/friend-request/status/${userId}`)
            set((state) => ({
                friendStatus: {
                    ...state.friendStatus,
                    [userId]: res.data.status,
                }
            }));
        } catch (err) {
            console.error("Error fetching friends status", err);
        }
    }

}), { name: 'FriendRequestStore' }))

export default useFriendRequestStore;

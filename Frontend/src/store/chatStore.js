import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axiosInstance from "../axios/axiosInstance";

const useChatStore = create(
  devtools(
    persist(
      (set, get) => ({
        selectedUser: null,
        users: [],
        lastMessages: {},
        unreadMessages: {},
        
        setUnreadMessages: (userId) =>
          set((state) => ({
            unreadMessages: {
              ...state.unreadMessages,
              [userId]: (Number(state.unreadMessages[userId]) || 0) + 1
            }
          })),

        clearUnreadMessages: (userId) =>
          set((state) => ({
            unreadMessages: {
              ...state.unreadMessages,
              [userId]: 0
            }
          })),

        setSelectedUser: (user) => {
          set({ selectedUser: user });
          if (user) {
            set((state) => ({
              unreadMessages: {
                ...state.unreadMessages,
                [user._id]: 0
              }
            }));
          }
        },

        fetchUsers: async () => {
          try {
            const res = await axiosInstance.get("/messages/getUsers");
            const messageData = res.data.reduce((acc, user) => {
              const existingUnreadCount = get().unreadMessages[user._id] || 0;
              const serverUnreadCount = Number(user.unreadCount || 0);

              acc.lastMessages[user._id] = user.lastMessage || null;
              acc.unreadMessages[user._id] = Math.max(existingUnreadCount, serverUnreadCount);
              return acc;
            }, { lastMessages: {}, unreadMessages: {} });

            set({
              users: res.data,
              lastMessages: messageData.lastMessages,
              unreadMessages: {
                ...get().unreadMessages,
                ...messageData.unreadMessages
              }
            });
          } catch (err) {
            console.error("Error fetching user list", err);
          }
        },

        updateLastMessage: (friendId, messageObj) =>
          set((state) => ({
            lastMessages: {
              ...state.lastMessages,
              [friendId]: messageObj
            },
          })),
      }),
      {
        name: 'chat-store',
        getStorage: () => localStorage,
        partialize: (state) => ({
          unreadMessages: state.unreadMessages,
          lastMessages: state.lastMessages
        })
      }
    )
  )
);

export default useChatStore;
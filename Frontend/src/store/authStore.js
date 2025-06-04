import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware';

const useAuthStore = create(devtools(persist((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) =>
        set({ user, isAuthenticated: true }),

    signOut: () => {
        set({ user: null, isAuthenticated: false })
    }
}), {
    name: 'authStore',
    getStorage: () => localStorage,
})))

export default useAuthStore;

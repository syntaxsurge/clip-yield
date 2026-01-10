import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { RandomUsers } from '../types';
import useGetRandomUsers from '../hooks/useGetRandomUsers';
  
interface GeneralStore {
    isEditProfileOpen: boolean
    isFeedMuted: boolean
    randomUsers: RandomUsers[]
    setIsEditProfileOpen: (val: boolean) => void
    setIsFeedMuted: (val: boolean) => void
    toggleFeedMuted: () => void
    setRandomUsers: () => void,
}

export const useGeneralStore = create<GeneralStore>()( 
    devtools(
        persist(
            (set) => ({
                isEditProfileOpen: false,
                isFeedMuted: false,
                randomUsers: [],

                setIsEditProfileOpen: (val: boolean) => set({ isEditProfileOpen: val }),
                setIsFeedMuted: (val: boolean) => set({ isFeedMuted: val }),
                toggleFeedMuted: () =>
                    set((state) => ({ isFeedMuted: !state.isFeedMuted })),
                setRandomUsers: async () => {
                    const result = await useGetRandomUsers()
                    set({ randomUsers: result })
                },
            }),
            { 
                name: 'store', 
                storage: createJSONStorage(() => localStorage) 
            }
        )
    )
)

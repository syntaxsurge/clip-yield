import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { RandomUsers } from '../types';
import useGetRandomUsers from '../hooks/useGetRandomUsers';
  
interface GeneralStore {
    isEditProfileOpen: boolean
    randomUsers: RandomUsers[]
    setIsEditProfileOpen: (val: boolean) => void
    setRandomUsers: () => void,
}

export const useGeneralStore = create<GeneralStore>()( 
    devtools(
        persist(
            (set) => ({
                isEditProfileOpen: false,
                randomUsers: [],

                setIsEditProfileOpen: (val: boolean) => set({ isEditProfileOpen: val }),
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

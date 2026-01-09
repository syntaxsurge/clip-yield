import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { RandomUsers } from '../types';
import useGetRandomUsers from '../hooks/useGetRandomUsers';
  
interface GeneralStore {
    randomUsers: RandomUsers[]
    setRandomUsers: () => void,
}

export const useGeneralStore = create<GeneralStore>()( 
    devtools(
        persist(
            (set) => ({
                randomUsers: [],

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

type AsyncStorageValue = string | null;

const AsyncStorage = {
  getItem: async (_key: string): Promise<AsyncStorageValue> => null,
  setItem: async (_key: string, _value: string): Promise<void> => {},
  removeItem: async (_key: string): Promise<void> => {},
  multiGet: async (_keys: string[]): Promise<[string, AsyncStorageValue][]> => [],
  multiSet: async (_entries: [string, string][]): Promise<void> => {},
  multiRemove: async (_keys: string[]): Promise<void> => {},
  clear: async (): Promise<void> => {},
};

export default AsyncStorage;
export const getItem = AsyncStorage.getItem;
export const setItem = AsyncStorage.setItem;
export const removeItem = AsyncStorage.removeItem;
export const multiGet = AsyncStorage.multiGet;
export const multiSet = AsyncStorage.multiSet;
export const multiRemove = AsyncStorage.multiRemove;
export const clear = AsyncStorage.clear;

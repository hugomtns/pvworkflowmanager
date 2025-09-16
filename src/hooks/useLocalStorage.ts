/**
 * useLocalStorage Hook
 * Wraps localStorage operations with error handling and type safety
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Serialization options for localStorage
 */
export interface SerializationOptions {
  /** Custom serializer function */
  serialize?: (value: any) => string;
  /** Custom deserializer function */
  deserialize?: (value: string) => any;
}

/**
 * Default JSON serialization with Date handling
 */
const defaultSerialize = (value: any): string => {
  return JSON.stringify(value, (key, val) => {
    // Convert Date objects to ISO strings
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  });
};

/**
 * Default JSON deserialization with Date parsing
 */
const defaultDeserialize = (value: string): any => {
  return JSON.parse(value, (key, val) => {
    // Convert ISO strings back to Date objects
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      return new Date(val);
    }
    return val;
  });
};

/**
 * Hook for managing localStorage with React state synchronization
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: SerializationOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const { serialize = defaultSerialize, deserialize = defaultDeserialize } = options;

  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serialize(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing arrays in localStorage (common pattern in the app)
 */
export const useLocalStorageArray = <T>(
  key: string,
  initialValue: T[] = [],
  options: SerializationOptions = {}
): [
  T[],
  (items: T[] | ((prev: T[]) => T[])) => void,
  (item: T) => void,
  (predicate: (item: T) => boolean) => void,
  (index: number, item: T) => void,
  () => void
] => {
  const [items, setItems, removeItems] = useLocalStorage<T[]>(key, initialValue, options);

  // Add item to array
  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  // Remove items matching predicate
  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, [setItems]);

  // Update item at specific index
  const updateItem = useCallback((index: number, item: T) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = item;
      return newItems;
    });
  }, [setItems]);

  return [items, setItems, addItem, removeItem, updateItem, removeItems];
};

/**
 * Hook for managing objects in localStorage
 */
export const useLocalStorageObject = <T extends Record<string, any>>(
  key: string,
  initialValue: T,
  options: SerializationOptions = {}
): [
  T,
  (obj: T | ((prev: T) => T)) => void,
  (field: keyof T, value: T[keyof T]) => void,
  () => void
] => {
  const [obj, setObj, removeObj] = useLocalStorage<T>(key, initialValue, options);

  // Update specific field in object
  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setObj(prev => ({ ...prev, [field]: value }));
  }, [setObj]);

  return [obj, setObj, updateField, removeObj];
};

/**
 * Hook for localStorage with versioning (used in dataAccess.ts)
 */
export const useVersionedLocalStorage = <T>(
  key: string,
  version: string,
  initialValue: T,
  options: SerializationOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void, string | null] => {
  const versionKey = `${key}_version`;
  const [storedVersion, setStoredVersion] = useLocalStorage<string | null>(versionKey, null);
  const [data, setData, removeData] = useLocalStorage<T>(key, initialValue, options);

  // Check if version matches and reset if not
  useEffect(() => {
    if (storedVersion !== version) {
      setData(initialValue);
      setStoredVersion(version);
    }
  }, [version, storedVersion, initialValue, setData, setStoredVersion]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setData(value);
    setStoredVersion(version);
  }, [setData, setStoredVersion, version]);

  const removeValue = useCallback(() => {
    removeData();
    setStoredVersion(null);
  }, [removeData, setStoredVersion]);

  return [data, setValue, removeValue, storedVersion];
};

/**
 * Hook for managing localStorage with automatic sync across tabs
 */
export const useSyncedLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: SerializationOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue, options);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const { serialize, deserialize = defaultDeserialize } = options;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setValue(newValue);
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, setValue, options]);

  return [value, setValue, removeValue];
};

/**
 * Hook for localStorage with debounced writes (useful for frequent updates)
 */
export const useDebouncedLocalStorage = <T>(
  key: string,
  initialValue: T,
  delay: number = 500,
  options: SerializationOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const { deserialize = defaultDeserialize } = options;
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Debounced effect to save to localStorage
  useEffect(() => {
    const { serialize = defaultSerialize } = options;

    const timeoutId = setTimeout(() => {
      try {
        window.localStorage.setItem(key, serialize(value));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay, options]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  }, []);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [value, updateValue, removeValue];
};

/**
 * Hook for checking localStorage availability and quota
 */
export const useLocalStorageInfo = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [quota, setQuota] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    // Check localStorage availability
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      setIsAvailable(true);
    } catch (error) {
      setIsAvailable(false);
    }

    // Get storage quota information (if available)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setQuota({
            used: estimate.usage,
            total: estimate.quota
          });
        }
      }).catch(error => {
        console.warn('Could not estimate storage quota:', error);
      });
    }
  }, []);

  return {
    isAvailable,
    quota
  };
};
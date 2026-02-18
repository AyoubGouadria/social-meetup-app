import { STORAGE_KEYS } from './constants';

/**
 * Local Storage wrapper with type safety
 */
class Storage {
  /**
   * Get item from localStorage
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  // Typed getters for common keys
  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  }

  removeToken(): void {
    this.remove(STORAGE_KEYS.TOKEN);
  }

  getUser<T>(): T | null {
    return this.get<T>(STORAGE_KEYS.USER);
  }

  setUser<T>(user: T): void {
    this.set(STORAGE_KEYS.USER, user);
  }

  removeUser(): void {
    this.remove(STORAGE_KEYS.USER);
  }

  getLanguage(): string | null {
    return this.get(STORAGE_KEYS.LANGUAGE);
  }

  setLanguage(language: string): void {
    this.set(STORAGE_KEYS.LANGUAGE, language);
  }
}

export const storage = new Storage();
export default storage;

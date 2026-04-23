import { Injectable } from '@angular/core';

/**
 * StorageService — centralized abstraction over browser localStorage.
 * All localStorage access across the application MUST go through this service
 * to enable testability and maintain a single point of control.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /**
   * Stores a value in localStorage. Strings are stored as-is;
   * objects and arrays are serialized to JSON.
   * @param key - The storage key.
   * @param value - The value to store (string, object, array, number, boolean).
   */
  setItem(key: string, value: string | number | boolean | object): void {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  }

  /**
   * Retrieves and deserializes a value from localStorage.
   * JSON strings are automatically parsed; plain strings are returned as-is.
   * @param key - The storage key.
   * @returns The deserialized value of type T, or null if the key doesn't exist.
   */
  getItem<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      // If it looks like JSON, parse it.
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value) as T;
      }
      return value as unknown as T;
    } catch {
      return value as unknown as T;
    }
  }

  /** Removes a single item from localStorage by key. */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /** Clears all items from localStorage. Use with caution. */
  clear(): void {
    localStorage.clear();
  }
}

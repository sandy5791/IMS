
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  setItem(key: string, value: any): void {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  }

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

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

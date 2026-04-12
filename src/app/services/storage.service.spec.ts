import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Mock localStorage
    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      for (const key in store) {
        delete store[key];
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setItem should store a string directly', () => {
    service.setItem('testKey', 'testValue');
    expect(localStorage.setItem).toHaveBeenCalledWith('testKey', 'testValue');
  });

  it('setItem should serialize an object to JSON string', () => {
    const obj = { id: 1, name: 'Item' };
    service.setItem('objKey', obj);
    expect(localStorage.setItem).toHaveBeenCalledWith('objKey', JSON.stringify(obj));
  });

  it('getItem should retrieve a stored string', () => {
    service.setItem('testKey', 'testValue');
    const value = service.getItem<string>('testKey');
    expect(value).toBe('testValue');
  });

  it('getItem should parse and retrieve a stored object', () => {
    const obj = { id: 1, name: 'Item' };
    service.setItem('objKey', obj);
    const value = service.getItem<{id: number, name: string}>('objKey');
    expect(value).toEqual(obj);
  });

  it('getItem should return null for a non-existent key', () => {
    const value = service.getItem('missingKey');
    expect(value).toBeNull();
  });

  it('removeItem should delete the specified key', () => {
    service.setItem('testKey', 'testValue');
    service.removeItem('testKey');
    const value = service.getItem('testKey');
    expect(value).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
  });

  it('clear should remove all stored keys', () => {
    service.setItem('key1', 'value1');
    service.setItem('key2', 'value2');
    service.clear();
    expect(service.getItem('key1')).toBeNull();
    expect(service.getItem('key2')).toBeNull();
    expect(localStorage.clear).toHaveBeenCalled();
  });
});

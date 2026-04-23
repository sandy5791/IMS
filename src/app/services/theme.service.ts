import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'ims-theme';
  
  /** Signal containing the current theme state (true = light, false = dark). */
  readonly isLightThemeSignal = signal<boolean>(false);

  constructor(private storage: StorageService) {
    const savedTheme = this.storage.getItem<string>(this.storageKey);
    this.isLightThemeSignal.set(savedTheme === 'light');
    this.applyTheme(this.isLightThemeSignal());
  }

  get isLightTheme(): boolean {
    return this.isLightThemeSignal();
  }

  toggleTheme(): void {
    this.isLightThemeSignal.update(v => !v);
    this.storage.setItem(this.storageKey, this.isLightThemeSignal() ? 'light' : 'dark');
    this.applyTheme(this.isLightThemeSignal());
  }

  private applyTheme(isLight: boolean): void {
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}

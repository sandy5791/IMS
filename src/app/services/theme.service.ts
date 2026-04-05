import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'ims-theme';
  private isLightThemeSubject!: BehaviorSubject<boolean>;

  /** Observable stream of the current theme state (true = light, false = dark). */
  isLightTheme$!: Observable<boolean>;

  constructor(private storage: StorageService) {
    const savedTheme = this.storage.getItem<string>(this.storageKey);
    this.isLightThemeSubject = new BehaviorSubject<boolean>(savedTheme === 'light');
    this.isLightTheme$ = this.isLightThemeSubject.asObservable();
    this.applyTheme(this.isLightThemeSubject.value);
  }

  get isLightTheme(): boolean {
    return this.isLightThemeSubject.value;
  }

  toggleTheme(): void {
    const newValue = !this.isLightThemeSubject.value;
    this.isLightThemeSubject.next(newValue);
    this.storage.setItem(this.storageKey, newValue ? 'light' : 'dark');
    this.applyTheme(newValue);
  }

  private applyTheme(isLight: boolean): void {
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}

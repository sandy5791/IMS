import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { StorageService } from './storage.service';

/** Shape of a translation file — nested key-value pairs. */
type TranslationMap = Record<string, string | TranslationMap>;

/**
 * TranslationService — dynamic multi-language translation pipeline.
 * Loads JSON translation files from assets/i18n/ and provides
 * dot-notation key lookups for template consumption.
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private readonly langSignal = signal<string>('en');

  /** Observable stream of the current language for reactive consumers. */
  public currentLang$: Observable<string> = toObservable(this.langSignal);

  private readonly translationsSignal = signal<TranslationMap>({});

  /** Signal indicating whether translations have been loaded and are ready. */
  public readonly loadedSignal = signal<boolean>(false);

  constructor() {
    const savedLang = this.storage.getItem<string>('ims-lang') || 'en';
    this.langSignal.set(savedLang);
    this.use(savedLang);
  }

  /**
   * Loads a translation file for the given language and updates internal state.
   * Persists the selected language to StorageService.
   * @param lang - ISO language code (e.g. 'en', 'es', 'hi').
   */
  use(lang: string): void {
    this.http.get<TranslationMap>(`./assets/i18n/${lang}.json`).subscribe({
      next: (res: TranslationMap) => {
        this.translationsSignal.set(res);
        this.langSignal.set(lang);
        this.storage.setItem('ims-lang', lang);
        this.loadedSignal.set(true);
      },
      error: () => {
        console.error(`Failed to load translation file for language: ${lang}`);
      }
    });
  }

  /** Returns the current active language code. */
  get currentLanguage(): string {
    return this.langSignal();
  }

  /**
   * Retrieves a translated string by dot-notation key path.
   * Falls back to the key itself if the translation is not found.
   * @param key - Dot-separated key path (e.g. 'dashboard.title').
   * @returns The translated string, or the key as fallback.
   */
  getTranslation(key: string): string {
    const result = key.split('.').reduce<TranslationMap | string | undefined>((obj, property) => {
      if (obj && typeof obj === 'object') {
        return (obj as TranslationMap)[property];
      }
      return undefined;
    }, this.translationsSignal());
    return (typeof result === 'string' ? result : key);
  }

  /** Returns the loadedSignal for consumers to check if translations are ready. */
  onTranslationsLoaded() {
    return this.loadedSignal;
  }
}

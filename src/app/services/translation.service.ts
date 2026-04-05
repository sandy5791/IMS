import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang: BehaviorSubject<string>;
  public currentLang$: Observable<string>;

  private translations: { [key: string]: any } = {};
  private translationsLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private storage: StorageService) {
    const savedLang = this.storage.getItem<string>('ims-lang') || 'en';
    this.currentLang = new BehaviorSubject<string>(savedLang);
    this.currentLang$ = this.currentLang.asObservable();
    this.use(savedLang);
  }

  use(lang: string): void {
    this.http.get<{ [key: string]: any }>(`./assets/i18n/${lang}.json`).subscribe({
      next: (res) => {
        this.translations = res;
        this.currentLang.next(lang);
        this.storage.setItem('ims-lang', lang);
        this.translationsLoaded.next(true);
      },
      error: () => {
        console.error(`Failed to load translation file for language: ${lang}`);
      }
    });
  }

  get currentLanguage(): string {
    return this.currentLang.value;
  }

  getTranslation(key: string): any {
    return key.split('.').reduce((obj, property) => {
      return obj ? obj[property] : null;
    }, this.translations) || key;
  }

  onTranslationsLoaded(): Observable<boolean> {
    return this.translationsLoaded.asObservable();
  }
}

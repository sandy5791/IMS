import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impure to automatically trigger CD on language change
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private value: string = '';
  private lastKey: string = '';
  private subscription!: Subscription;

  constructor(private translationService: TranslationService, private ref: ChangeDetectorRef) {
    this.subscription = this.translationService.currentLang$.subscribe(() => {
      if (this.lastKey) {
        this.value = this.translationService.getTranslation(this.lastKey);
        this.ref.markForCheck();
      }
    });
  }

  transform(key: string): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.value = this.translationService.getTranslation(key);
    }
    return this.value;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

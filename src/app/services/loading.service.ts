import { Injectable, signal, computed } from '@angular/core';

/**
 * LoadingService — centralized HTTP loading state using Angular Signals.
 * The interceptor increments/decrements the counter for each HTTP request.
 * Components bind to `isLoading()` signal — no subscriptions needed.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = signal(0);

  /** True whenever any HTTP request is in-flight. */
  readonly isLoading = computed(() => this.count() > 0);

  show(): void { this.count.update(n => n + 1); }
  hide(): void { this.count.update(n => Math.max(0, n - 1)); }
  reset(): void { this.count.set(0); }
}

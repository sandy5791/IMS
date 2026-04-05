import { Directive, HostListener, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appBackToTop]',
  standalone: true
})
export class BackToTopDirective implements OnInit {

  @Input() scrollContainer!: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setButtonVisibility(false);
    if (this.scrollContainer) {
      this.renderer.listen(this.scrollContainer, 'scroll', () => this.onScroll());
    }
  }

  private setButtonVisibility(show: boolean): void {
    const button = this.el.nativeElement;
    if (show) {
      this.renderer.setStyle(button, 'opacity', '1');
      this.renderer.setStyle(button, 'visibility', 'visible');
    } else {
      this.renderer.setStyle(button, 'opacity', '0');
      this.renderer.setStyle(button, 'visibility', 'hidden');
    }
  }

  private onScroll(): void {
    if (this.scrollContainer) {
      const scrollPosition = this.scrollContainer.scrollTop;
      this.setButtonVisibility(scrollPosition > 100);
    }
  }

  @HostListener('click')
  onClick(): void {
    this.scrollToTop();
  }

  private scrollToTop(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

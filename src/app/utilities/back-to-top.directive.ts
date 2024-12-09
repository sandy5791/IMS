import { Directive, HostListener, ElementRef, Renderer2, OnInit, ChangeDetectorRef, Input } from '@angular/core';

@Directive({
  selector: '[appBackToTop]'
})
export class BackToTopDirective implements OnInit {

  @Input() scrollContainer!: HTMLElement; // Target container to scroll to top

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize button visibility
    this.setButtonVisibility(false);
    if (this.scrollContainer) {
      // Listen for scroll on the specific container
      this.renderer.listen(this.scrollContainer, 'scroll', () => this.onScroll());
    }
  }

  // Function to show or hide the button based on scroll position
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

  // This method triggers on every scroll event of the container
  private onScroll(): void {
    if (this.scrollContainer) {
      const scrollPosition = this.scrollContainer.scrollTop;

      // Show the button when scrolled more than 100px
      if (scrollPosition > 100) {
        this.setButtonVisibility(true);
      } else {
        this.setButtonVisibility(false);
      }
    }
  }

  @HostListener('click')
  onClick(): void {
    this.scrollToTop();
  }

  // Scroll to top function
  private scrollToTop(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

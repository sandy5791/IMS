import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-icon',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  templateUrl: './animated-icon.component.html',
  styleUrls: ['./animated-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimatedIconComponent implements OnInit {
  @Input() path = '';
  @Input() width = '32px';
  @Input() height = '32px';
  @Input() trigger: 'hover' | 'loop' | 'none' = 'hover';
  @Input() loop = true;
  @Input() autoplay = false;

  @Output() animationLoaded = new EventEmitter<AnimationItem>();

  options!: AnimationOptions;
  private animationItem: AnimationItem | undefined;

  ngOnInit(): void {
    this.options = {
      path: this.path,
      loop: this.loop,
      autoplay: this.trigger === 'loop' || this.autoplay
    };
  }

  animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
    this.animationLoaded.emit(animationItem);

    if (this.trigger === 'hover' && !this.autoplay) {
      this.animationItem.stop();
    }
  }

  onHover(): void {
    if (this.trigger === 'hover' && this.animationItem) {
      this.animationItem.play();
    }
  }

  onHoverOut(): void {
    if (this.trigger === 'hover' && this.animationItem) {
      if (this.loop) {
        this.animationItem.stop();
      }
    }
  }

  play(): void {
    this.animationItem?.play();
  }

  pause(): void {
    this.animationItem?.pause();
  }

  stop(): void {
    this.animationItem?.stop();
  }
}

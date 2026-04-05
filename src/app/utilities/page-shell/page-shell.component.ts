import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { fadeInOnEnter } from '@ngverse/motion/animatecss';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  templateUrl: './page-shell.component.html',
  styleUrls: ['./page-shell.component.scss'],
  imports: [CommonModule, RouterModule],
  animations: [fadeInOnEnter({ duration: 400 })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() breadcrumbs: { label: string; link?: string }[] = [];
  @Input() showBackButton = true;
  @Input() backRoute = '/dashboard';
}
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { zoomInOnEnter, fadeInUpOnEnter } from '@ngverse/motion/animatecss';

@Component({
  selector: 'app-dashboard-menus',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard-menus.component.html',
  styleUrls: ['./dashboard-menus.component.scss'],
  animations: [
    zoomInOnEnter({ duration: 500 }),
    fadeInUpOnEnter({ duration: 600 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardMenusComponent {
  menuItems = [
    { name: 'Sales', icon: 'fas fa-chart-line', path: '/dashboard/sales' },
    { name: 'Purchases', icon: 'fas fa-box', path: '/dashboard/purchases' },
    { name: 'Reports', icon: 'fas fa-file-alt', path: '/dashboard/reports' },
    { name: 'Inventory', icon: 'fas fa-cogs', path: '/dashboard/inventory' },
    { name: 'Customers', icon: 'fas fa-users', path: '/dashboard/customers' },
    { name: 'Vendors', icon: 'fas fa-truck', path: '/dashboard/vendors' },
    { name: 'Logs', icon: 'fas fa-shield-alt', path: '/dashboard/logs' },
    { name: 'Portal', icon: 'fas fa-id-card', path: '/dashboard/portal' }
  ];

  constructor(private router: Router) {}

  trackByPath(_index: number, item: { path: string }): string {
    return item.path;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}

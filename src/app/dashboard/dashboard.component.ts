import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fadeInOnEnter, zoomInOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { AuthService } from '../services/auth-service/auth-service.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { TranslationService } from '../services/translation.service';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';

interface DashboardMenuItem {
  name: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    fadeInOnEnter({ duration: 300 }),
    zoomInOnEnter({ duration: 500 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  isSidebarCollapsed = false;
  isDropdownOpen = false;
  isLightTheme = false;
  searchQuery = '';
  showSuggestions = false;
  filteredSuggestions: DashboardMenuItem[] = [];
  activeLink = '';
  loggedInUser = '';
  currentLanguage: string;

  menuItems: DashboardMenuItem[] = [
    { name: 'Dashboard', icon: 'fas fa-chart-pie', path: '/dashboard' },
    { name: 'Menus', icon: 'fas fa-th-large', path: '/dashboard/menus' },
    { name: 'Sales', icon: 'fas fa-chart-line', path: '/dashboard/sales' },
    { name: 'Purchases', icon: 'fas fa-box', path: '/dashboard/purchases' },
    { name: 'Reports', icon: 'fas fa-file-alt', path: '/dashboard/reports' },
    { name: 'Inventory', icon: 'fas fa-cogs', path: '/dashboard/inventory' },
    { name: 'Customers', icon: 'fas fa-users', path: '/dashboard/customers' },
    { name: 'Vendors', icon: 'fas fa-truck', path: '/dashboard/vendors' },
    { name: 'Logs', icon: 'fas fa-shield-alt', path: '/dashboard/logs' },
    { name: 'Portal', icon: 'fas fa-id-card', path: '/dashboard/portal' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService,
    private storage: StorageService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentLanguage = this.translationService.currentLanguage;
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.urlAfterRedirects;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.isLightTheme = this.themeService.isLightTheme;
    this.loggedInUser = this.storage.getItem<string>('LoggedInUser') || 'User';
  }

  trackByMenuPath(_index: number, item: DashboardMenuItem): string {
    return item.path;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setActive(link: string): void {
    this.activeLink = link;
  }

  collapseSidebar(): void {
    this.isSidebarCollapsed = true;
  }

  onSearchFocus(): void {
    if (!this.searchQuery) {
      this.filteredSuggestions = this.menuItems.slice(0, 5);
      this.showSuggestions = true;
    }
  }

  filterSuggestions(): void {
    if (!this.searchQuery) {
      this.showSuggestions = false;
      return;
    }
    this.filteredSuggestions = this.menuItems.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.showSuggestions = this.filteredSuggestions.length > 0;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.searchQuery = '';
    this.showSuggestions = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isLightTheme = this.themeService.isLightTheme;
  }

  logout(): void {
    this.authService.logout();
  }

  switchLanguage(lang: string): void {
    this.translationService.use(lang);
    this.currentLanguage = lang;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      document.getElementById('global-search')?.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.global-search-container')) {
      this.showSuggestions = false;
    }
    if (!clickedElement.closest('.user-controls')) {
      this.isDropdownOpen = false;
    }
  }
}

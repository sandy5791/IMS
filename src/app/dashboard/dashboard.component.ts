
import { Component, ElementRef, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/authService/auth-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isSidebarCollapsed: boolean = false;
  isDropdownOpen: Boolean = false;
  searchQuery = '';
  filteredSuggestions: any[] = [];

  menuItems = [
    { name: 'Sales', icon: 'fas fa-chart-line', path: '/dashboard/sales' },
    { name: 'Purchases', icon: 'fas fa-box', path: '/dashboard/purchases' },
    { name: 'Reports', icon: 'fas fa-file-alt', path: '/dashboard/reports' },
    { name: 'Inventory', icon: 'fas fa-cogs', path: '/dashboard/inventory' }
  ];
showSuggestions: any;
  showSearch: boolean = true;

  constructor(private authService: AuthService, private router: Router,private elementRef: ElementRef) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActive(this.router.url);
        this.showSearch = !['/dashboard/sales', '/dashboard/purchases', '/dashboard/reports', '/dashboard/inventory'].includes(event.url);
      }
    });
   }
  activeLink: string = '';
  LogedInUser = localStorage.getItem('LogedInUser')
  setActive(link: string) {
    this.activeLink = link;
  }
  logout() {
    this.authService.logout(); // Clear authentication data
    this.router.navigate(['/login']); // Redirect to login
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  collapseSidebar() {
    this.isSidebarCollapsed = true; // Auto-collapse sidebar after selection
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  filterSuggestions() {
    if (this.searchQuery.length == 0) {
      this.filteredSuggestions = []
     this .showSuggestions = false;
    }
    else {
      this.filteredSuggestions = this.menuItems.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      if(this.filteredSuggestions.length > 0)
      {
        this .showSuggestions = true;
      }
      else 
      {
        this .showSuggestions = false;
      }
    }
  }

  navigateTo(menu: any) {
    this.router.navigate([menu.path]);
    this.searchQuery = ''; // Clear search query after navigation
    this.filteredSuggestions = []; // Clear suggestions
  }
  goHome() {
    // Optional: You can do any other action here before routing
    this.router.navigate(['/dashboard']); // Navigate to the dashboard
}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    if (
      clickedElement.id !== 'search-box' &&
      clickedElement.id !== 'suggestions-list' &&
      !clickedElement.closest('#suggestions-list')
    ) {
      this.showSuggestions = false;
    }
    if(clickedElement.id !== 'User-dropDown' && clickedElement.id !== 'users')
    {
      this.isDropdownOpen = false;
    }
  
  }
}

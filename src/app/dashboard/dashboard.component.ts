
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/authService/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isSidebarCollapsed: boolean = false;
  isDropdownOpen: Boolean = false;
  constructor(private authService: AuthService, private router: Router) {}
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
}

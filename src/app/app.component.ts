import { Component } from '@angular/core';
import {  RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './Login/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet]
})
export class AppComponent {
  title = 'IMS';
  constructor() { console.log('entered app componet') }
}

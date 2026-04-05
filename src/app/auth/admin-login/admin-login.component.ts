import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLoginComponent {}

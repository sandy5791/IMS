import {  Routes } from '@angular/router';
import { LoginComponent } from './Login/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './services/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SalesOrderComponent } from './project/sales-order/sales-order.component';
import { PurchaseOrderComponent } from './project/purchase-order/purchase-order.component';
import { InventoryComponent } from './project/inventory/inventory.component';
import { ReportComponent } from './project/report/report.component';
export const routes: Routes = [
    {
      path: 'dashboard',
      loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      canActivate:[authGuard],
      canActivateChild:[authGuard],
      children: [
        { path: 'sales', component: SalesOrderComponent },
        { path: 'purchases', component: PurchaseOrderComponent },
        { path: 'reports', component: ReportComponent },
        { path: 'inventory', component: InventoryComponent },
      ]
    },
    {
      path: 'login',
      loadComponent: () => import('./Login/login/login.component').then(m => m.LoginComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
  ];

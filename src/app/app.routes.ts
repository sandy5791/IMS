import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { canDeactivateGuard } from './services/can-deactivate.guard';

export const routes: Routes = [
    {
      path: 'dashboard',
      loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      canActivate: [authGuard],
      canActivateChild: [authGuard],
      children: [
        { path: '', loadComponent: () => import('./dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent) },
        { path: 'menus', loadComponent: () => import('./dashboard/dashboard-menus/dashboard-menus.component').then(m => m.DashboardMenusComponent) },
        { path: 'sales', loadComponent: () => import('./project/sales-order/sales-order.component').then(m => m.SalesOrderComponent), canDeactivate: [canDeactivateGuard] },
        { path: 'purchases', loadComponent: () => import('./project/purchase-order/purchase-order.component').then(m => m.PurchaseOrderComponent), canDeactivate: [canDeactivateGuard] },
        { path: 'reports', loadComponent: () => import('./project/report/report.component').then(m => m.ReportComponent) },
        { path: 'inventory', loadComponent: () => import('./project/inventory/inventory.component').then(m => m.InventoryComponent) },
        { path: 'customers', loadComponent: () => import('./project/customers/customers.component').then(m => m.CustomersComponent) },
        { path: 'vendors', loadComponent: () => import('./project/vendors/vendors.component').then(m => m.VendorsComponent) },
        { path: 'logs', loadComponent: () => import('./project/logs/logs.component').then(m => m.LogsComponent) },
        { path: 'portal', loadComponent: () => import('./project/portal/portal.component').then(m => m.PortalComponent) },
      ]
    },
    {
      path: 'login',
      loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
      path: 'admin',
      loadComponent: () => import('./auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
      path: '**',
      loadComponent: () => import('./page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
    }
  ];

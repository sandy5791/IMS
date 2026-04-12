import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { fadeInUpOnEnter, zoomInOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';

import { ImsApiService, ApiSalesOrder, ApiPurchaseOrder, DashboardKpi } from '../../services/ims-api.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 600 }),
    zoomInOnEnter({ duration: 500, delay: 200 }),
    slideInLeftOnEnter({ duration: 500, delay: 400 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  totalSales = 0;
  totalPurchases = 0;
  totalInventoryValue = 0;
  lowStockItemsCount = 0;
  totalCustomers = 0;
  totalVendors = 0;
  monthlyRevenue = 0;
  recentSales: ApiSalesOrder[] = [];
  recentPurchases: ApiPurchaseOrder[] = [];
  isLoading = true;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [], label: 'Sales ($)', fill: true, tension: 0.5,
      borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.2)'
    }]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  constructor(private api: ImsApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Load dashboard KPI from the dedicated API endpoint
    this.api.getDashboardKpi()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (kpi: DashboardKpi) => {
          this.totalSales         = kpi.totalRevenue;
          this.totalPurchases     = kpi.totalPurchaseOrders;
          this.totalInventoryValue = kpi.totalInventoryItems;
          this.lowStockItemsCount = kpi.lowStockCount;
          this.totalCustomers     = kpi.totalCustomers;
          this.totalVendors       = kpi.totalVendors;
          this.monthlyRevenue     = kpi.monthlyRevenue;
          this.cdr.markForCheck();
        }
      });

    // Load recent orders for activity feed via forkJoin
    forkJoin({
      sales: this.api.getSalesOrders(1, 5),
      purchases: this.api.getPurchaseOrders(1, 5)
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sales, purchases }) => {
          this.recentSales = sales.items;
          this.recentPurchases = purchases.items;
          this.isLoading = false;
          this.updateSalesChart(sales.items);
          this.cdr.markForCheck();
        },
        error: () => { this.isLoading = false; this.cdr.markForCheck(); }
      });
  }

  trackBySaleId(_index: number, item: ApiSalesOrder): string {
    return item.orderId ?? String(_index);
  }

  trackByPurchaseId(_index: number, item: ApiPurchaseOrder): string {
    return item.orderId ?? String(_index);
  }

  private updateSalesChart(sales: ApiSalesOrder[]): void {
    this.lineChartData = {
      ...this.lineChartData,
      labels: sales.map(s => s.orderDate),
      datasets: [{ ...this.lineChartData.datasets[0], data: sales.map(s => s.totalAmount) }]
    };
  }
}

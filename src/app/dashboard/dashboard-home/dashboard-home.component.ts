import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { fadeInUpOnEnter, zoomInOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { CoreDataService, SalesRecord, PurchaseRecord } from '../../services/core-data.service';
import { InventoryItem } from '../../project/models/model';

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
  recentSales: SalesRecord[] = [];
  recentPurchases: PurchaseRecord[] = [];

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Sales ($)',
        fill: true,
        tension: 0.5,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  constructor(
    private coreData: CoreDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.coreData.sales$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((sales: SalesRecord[]) => {
      this.recentSales = sales.slice(-5).reverse();
      this.totalSales = sales.reduce((sum: number, s: SalesRecord) => sum + s.totalAmount, 0);
      this.updateSalesChart(sales);
      this.cdr.markForCheck();
    });

    this.coreData.purchases$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((purchases: PurchaseRecord[]) => {
      this.recentPurchases = purchases.slice(-5).reverse();
      this.totalPurchases = purchases.reduce((sum: number, p: PurchaseRecord) => sum + p.totalAmount, 0);
      this.cdr.markForCheck();
    });

    this.coreData.inventory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items: InventoryItem[]) => {
      this.lowStockItemsCount = items.filter((i: InventoryItem) => i.stockQty <= i.reorderLevel).length;
      this.totalInventoryValue = items.reduce((sum: number, i: InventoryItem) => sum + (i.stockQty * 50), 0);
      this.cdr.markForCheck();
    });
  }

  trackBySaleId(_index: number, item: SalesRecord): string {
    return item.orderId;
  }

  trackByPurchaseId(_index: number, item: PurchaseRecord): string {
    return item.orderId;
  }

  private updateSalesChart(sales: SalesRecord[]): void {
    const labels = sales.map(s => s.date).slice(-7);
    const data = sales.map(s => s.totalAmount).slice(-7);
    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = data;
  }
}

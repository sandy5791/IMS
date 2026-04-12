import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { forkJoin } from 'rxjs';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { ImsApiService, ApiSalesOrder, ApiPurchaseOrder } from '../../services/ims-api.service';
import { ExportService } from '../../services/export.service';

interface ReportItem {
  itemId: string;
  itemName: string;
  type: 'Purchase' | 'Sales';
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageShellComponent, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  filterMode: 'date' | 'month' | 'year' = 'date';
  selectedType: 'All' | 'Purchase' | 'Sales' = 'All';
  fromDate = '';
  toDate = '';
  month = '';
  year = '';
  searchText = '';
  isLoading = false;
  reportItems: ReportItem[] = [];
  filteredItems: ReportItem[] = [];

  displayedColumns: string[] = ['index', 'itemId', 'itemName', 'type', 'quantity', 'unitPrice', 'total', 'date', 'actions'];
  dataSource = new MatTableDataSource<ReportItem>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ImsApiService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadReport(): void {
    this.isLoading = true;
    forkJoin({
      sales: this.api.getSalesOrders(1, 500),
      purchases: this.api.getPurchaseOrders(1, 500)
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ sales, purchases }) => {
          const salesItems: ReportItem[] = (sales.items as ApiSalesOrder[]).flatMap(s =>
            s.items.map(i => ({
              itemId: i.itemId, itemName: i.itemName,
              type: 'Sales' as const,
              quantity: i.quantity, unitPrice: i.price,
              total: i.quantity * i.price,
              date: s.orderDate
            }))
          );

          const purchaseItems: ReportItem[] = (purchases.items as ApiPurchaseOrder[]).flatMap(p =>
            p.items.map(i => ({
              itemId: i.itemId, itemName: i.itemName,
              type: 'Purchase' as const,
              quantity: i.quantity, unitPrice: i.unitPrice,
              total: i.quantity * i.unitPrice,
              date: p.orderDate
            }))
          );

          this.reportItems = [...salesItems, ...purchaseItems]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          this.isLoading = false;
          this.applyFilter();
          this.cdr.markForCheck();
        },
        error: () => { this.isLoading = false; this.cdr.markForCheck(); }
      });
  }

  trackByIndex(index: number): number { return index; }

  applyFilter(): void {
    this.filteredItems = this.reportItems.filter(item => {
      if (this.selectedType !== 'All' && item.type !== this.selectedType) return false;

      const itemDate = new Date(item.date);
      if (this.filterMode === 'date') {
        if (this.fromDate && itemDate < new Date(this.fromDate)) return false;
        if (this.toDate && itemDate > new Date(this.toDate)) return false;
      } else if (this.filterMode === 'month') {
        if (this.month) {
          const [y, m] = this.month.split('-').map(Number);
          if (itemDate.getFullYear() !== y || itemDate.getMonth() + 1 !== m) return false;
        }
      } else if (this.filterMode === 'year') {
        if (this.year && itemDate.getFullYear() !== Number(this.year)) return false;
      }

      if (this.searchText) {
        const q = this.searchText.toLowerCase();
        return item.itemId.toLowerCase().includes(q) ||
               item.itemName.toLowerCase().includes(q) ||
               item.type.toLowerCase().includes(q);
      }
      return true;
    });

    this.dataSource.data = this.filteredItems;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  onSearchChange(): void { this.applyFilter(); }
  updateRow(item: ReportItem): void { item.total = Number((item.quantity * item.unitPrice).toFixed(2)); this.applyFilter(); }
  removeItem(item: ReportItem): void { this.reportItems = this.reportItems.filter(r => r !== item); this.applyFilter(); }
  getRowClass(item: ReportItem): string { return item.type === 'Purchase' ? 'table-light' : ''; }

  get purchaseTotal(): number { return this.filteredItems.filter(i => i.type === 'Purchase').reduce((s, i) => s + i.total, 0); }
  get salesTotal(): number { return this.filteredItems.filter(i => i.type === 'Sales').reduce((s, i) => s + i.total, 0); }
  get totalAll(): number { return this.filteredItems.reduce((s, i) => s + i.total, 0); }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Type', 'Quantity', 'Unit Price', 'Total', 'Date'];
    const rows = this.filteredItems.map(item => [
      item.itemId, item.itemName, item.type,
      item.quantity.toString(), item.unitPrice.toString(),
      item.total.toString(), item.date
    ]);
    this.exportService.exportToCsv(headers, rows, `report_${new Date().toISOString().split('T')[0]}`);
  }
}

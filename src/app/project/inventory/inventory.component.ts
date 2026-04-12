import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { finalize } from 'rxjs';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { ImsApiService, ApiInventoryItem } from '../../services/ims-api.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, PageShellComponent,
    MatTableModule, MatCheckboxModule, MatPaginatorModule, MatSortModule
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  inventoryForm: FormGroup;
  inventoryItems: ApiInventoryItem[] = [];
  lowStockCount = 0;
  nearExpiryCount = 0;
  searchText = '';
  isLoading = false;

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'category', 'stockQty', 'reorderLevel', 'batchNumber', 'expiryDate', 'location', 'actions'];
  dataSource = new MatTableDataSource<ApiInventoryItem>([]);
  selection = new SelectionModel<ApiInventoryItem>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private api: ImsApiService,
    private exportService: ExportService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.inventoryForm = this.fb.group({
      itemName:     ['', Validators.required],
      category:     ['', Validators.required],
      stockQty:     [0, Validators.required],
      reorderLevel: [0, Validators.required],
      location:     ['', Validators.required],
      batchNumber:  [''],
      expiryDate:   [''],
      unitPrice:    [0]
    });
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInventory(search?: string): void {
    this.isLoading = true;
    this.api.getInventory(1, 200, search)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          this.inventoryItems = result.items;
          this.dataSource.data = result.items;
          this.lowStockCount = result.items.filter(i => i.stockQty <= i.reorderLevel).length;
          this.nearExpiryCount = result.items.filter(i => i.expiryDate && this.isNearExpiry(i)).length;
          this.selection.clear();
          this.cdr.markForCheck();
        },
        error: () => this.toastr.error('Failed to load inventory.', 'Error')
      });
  }

  trackByItemId(_index: number, item: ApiInventoryItem): string {
    return item.itemId;
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  addInventoryItem(): void {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }
    this.api.createInventoryItem(this.inventoryForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Inventory item added.', 'Success');
          this.inventoryForm.reset({ stockQty: 0, reorderLevel: 0, unitPrice: 0 });
          this.loadInventory();
        },
        error: () => this.toastr.error('Failed to add item.', 'Error')
      });
  }

  manualAdjustment(item: ApiInventoryItem, delta: number): void {
    this.api.adjustStock(item.itemId, delta, delta > 0 ? 'Manual increase' : 'Manual decrease')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.toastr.info(`Stock adjusted by ${delta}.`, 'Adjustment'); this.loadInventory(); },
        error: () => this.toastr.error('Failed to adjust stock.', 'Error')
      });
  }

  removeSelectedItems(): void {
    const selected = this.selection.selected;
    if (!selected.length) return;
    let done = 0;
    selected.forEach(item => {
      this.api.deleteInventoryItem(item.itemId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { done++; if (done === selected.length) { this.toastr.success('Deleted.', 'Success'); this.loadInventory(); } },
        error: () => this.toastr.error('Failed to delete items.', 'Error')
      });
    });
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  isLowStock(item: ApiInventoryItem): boolean {
    return item.stockQty <= item.reorderLevel;
  }

  // Random stock scan simulation — picks a random item and deducts 1 unit
  simulateScan(): void {
    if (!this.inventoryItems.length) return;
    const item = this.inventoryItems[Math.floor(Math.random() * this.inventoryItems.length)];
    this.manualAdjustment(item, -1);
  }

  isNearExpiry(item: ApiInventoryItem): boolean {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Category', 'Stock Qty', 'Reorder Level', 'Unit Price', 'Location'];
    const rows = this.inventoryItems.map(item => [
      item.itemId, item.itemName, item.category,
      item.stockQty.toString(), item.reorderLevel.toString(),
      item.unitPrice.toFixed(2), item.location
    ]);
    this.exportService.exportToCsv(headers, rows, 'inventory');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

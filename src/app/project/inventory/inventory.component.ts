import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { InventoryItem } from '../models/model';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { CoreDataService } from '../../services/core-data.service';
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
export class InventoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  inventoryForm: FormGroup;
  inventoryItems: InventoryItem[] = [];
  lowStockCount = 0;
  nearExpiryCount = 0;
  searchText = '';

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'category', 'stockQty', 'reorderLevel', 'batchNumber', 'expiryDate', 'location', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>(this.inventoryItems);
  selection = new SelectionModel<InventoryItem>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreData: CoreDataService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.inventoryForm = this.fb.group({
      itemId: ['', Validators.required],
      itemName: ['', Validators.required],
      category: ['', Validators.required],
      stockQty: [0, Validators.required],
      reorderLevel: [0, Validators.required],
      location: ['', Validators.required],
      batchNumber: [''],
      expiryDate: ['']
    });
  }

  ngOnInit(): void {
    this.coreData.inventory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.inventoryItems = data;
      this.refreshData();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  trackByItemId(_index: number, item: InventoryItem): string {
    return item.itemId;
  }

  private refreshData(): void {
    this.dataSource.data = this.inventoryItems;
    this.lowStockCount = this.inventoryItems.filter(item => item.stockQty <= item.reorderLevel).length;
    this.nearExpiryCount = this.inventoryItems.filter(item => item.expiryDate && this.isNearExpiry(item)).length;
    this.selection.clear();
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
    const item = new InventoryItem(this.inventoryForm.value);
    this.coreData.addInventoryItem(item);
    this.coreData.logAudit('Add Item', 'Inventory', `New item ${item.itemName} (${item.itemId}) added to stock.`, 'info');
    this.inventoryForm.reset();
  }

  manualAdjustment(item: InventoryItem, delta: number): void {
    item.stockQty += delta;
    if (item.stockQty < 0) item.stockQty = 0;
    this.coreData.setInventory([...this.inventoryItems]);
    this.coreData.logAudit('Stock Adjustment', 'Inventory', `Manual adjustment for ${item.itemName}: ${delta > 0 ? '+' : ''}${delta}. New Qty: ${item.stockQty}`, 'warning');
  }

  simulateScan(): void {
    if (this.inventoryItems.length === 0) return;
    const randomItem = this.inventoryItems[Math.floor(Math.random() * this.inventoryItems.length)];
    this.manualAdjustment(randomItem, -1);
    this.coreData.logAudit('Barcode Scan', 'Inventory', `Simulated scan for ${randomItem.itemName}. Stock deducted.`, 'info');
  }

  removeSelectedItems(): void {
    const selected = this.selection.selected;
    const remaining = this.inventoryItems.filter(item => !selected.includes(item));
    this.coreData.setInventory(remaining);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  isLowStock(item: InventoryItem): boolean {
    return item.stockQty <= item.reorderLevel;
  }

  isNearExpiry(item: InventoryItem): boolean {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow;
  }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Category', 'Stock Qty', 'Reorder Level', 'Location'];
    const rows = this.inventoryItems.map(item => [
      item.itemId, item.itemName, item.category,
      item.stockQty.toString(), item.reorderLevel.toString(), item.location
    ]);
    this.exportService.exportToCsv(headers, rows, 'inventory');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

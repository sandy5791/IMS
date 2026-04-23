import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { finalize } from 'rxjs';

import { ImsApiService, ApiPurchaseOrder, ApiPurchaseItem, ApiVendor, ApiInventoryItem } from '../../services/ims-api.service';
import { ExportService } from '../../services/export.service';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { EntityLookupComponent } from '../../utilities/entity-lookup/entity-lookup.component';
import { CanComponentDeactivate } from '../../services/can-deactivate.guard';

interface PurchaseRow {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, PageShellComponent,
    MatTableModule, MatCheckboxModule, MatPaginatorModule, EntityLookupComponent
  ],
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOrderComponent implements OnInit, CanComponentDeactivate, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  purchaseForm: FormGroup;
  purchaseItems: PurchaseRow[] = [];
  searchText = '';
  isLoading = false;

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'quantity', 'unitPrice', 'total'];
  dataSource = new MatTableDataSource<PurchaseRow>(this.purchaseItems);
  selection = new SelectionModel<PurchaseRow>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('vendorLookup') vendorLookup!: EntityLookupComponent;

  vendors: ApiVendor[] = [];
  inventory: ApiInventoryItem[] = [];
  selectedVendorId: string | null = null;
  existingOrders: ApiPurchaseOrder[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: NotificationService,
    private api: ImsApiService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.purchaseForm = this.fb.group({
      vendor:           ['', Validators.required],
      poNumber:         ['', [Validators.required]],
      orderDate:        [new Date().toISOString().slice(0, 10)],
      expectedDelivery: [''],
      status:           ['Pending'],
      remarks:          [''],
      paymentMode:      ['Cash'],
    });
  }

  ngOnInit(): void {
    this.api.getVendors(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.vendors = r.items; this.cdr.markForCheck(); }
    });
    this.api.getInventory(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.inventory = r.items; this.cdr.markForCheck(); }
    });
    this.api.getPurchaseOrders(1, 50).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.existingOrders = r.items; this.cdr.markForCheck(); }
    });

    this.purchaseItems = [{ itemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 }];
    this.updateRowData();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.purchaseForm.dirty) { $event.preventDefault(); }
  }

  canDeactivate(): boolean {
    if (this.purchaseForm.dirty) {
      return confirm('You have unsaved changes in your Purchase Order. Do you want to leave?');
    }
    return true;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  trackByItemId(_index: number, item: PurchaseRow): string {
    return item.itemId || String(_index);
  }

  updateRowData(): void {
    const filtered = this.purchaseItems.filter(item =>
      !this.searchText ||
      item.itemId.toLowerCase().includes(this.searchText.toLowerCase()) ||
      item.itemName.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.dataSource.data = filtered;
    this.selection.clear();
    this.cdr.markForCheck();
  }

  onSearchChange(): void { this.updateRowData(); }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) { this.selection.clear(); }
    else { this.dataSource.data.forEach(row => this.selection.select(row)); }
  }

  addRow(): void {
    this.purchaseItems.push({ itemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 });
    this.updateRowData();
  }

  onItemSelect(item: PurchaseRow, itemId: string): void {
    const inv = this.inventory.find(i => i.itemId === itemId);
    if (inv) { item.itemId = inv.itemId; item.itemName = inv.itemName; item.unitPrice = inv.unitPrice; }
  }

  removeSelectedRows(): void {
    if (!this.selection.selected.length) return;
    this.purchaseItems = this.purchaseItems.filter(item => !this.selection.selected.includes(item));
    this.updateRowData();
  }

  hasSelectedRows(): boolean { return this.selection.selected.length > 0; }

  computeItemTotal(item: PurchaseRow): number {
    return Number((item.quantity * item.unitPrice).toFixed(2));
  }

  get grandTotal(): number {
    return this.purchaseItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  }

  onVendorBlur(): void {
    const entered = this.purchaseForm.value.vendor;
    if (!entered) return;
    const match = this.vendors.find(v =>
      v.name.toLowerCase() === entered.toLowerCase() || v.vendorId.toLowerCase() === entered.toLowerCase()
    );
    if (match) {
      this.purchaseForm.patchValue({ vendor: match.name });
      this.selectedVendorId = match.vendorId;
    } else { this.selectedVendorId = null; }
  }

  openVendorModal(): void { this.vendorLookup.open(); }

  selectModalVendor(v: ApiVendor): void {
    this.purchaseForm.patchValue({ vendor: v.name });
    this.selectedVendorId = v.vendorId;
  }

  submitPurchase(): void {
    if (!this.purchaseForm.valid) {
      this.purchaseForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }
    const validItems = this.purchaseItems.filter(i => i.itemId);
    if (!validItems.length) {
      this.toastr.error('Please add at least one item.', 'Validation Error');
      return;
    }

    const items: ApiPurchaseItem[] = validItems.map(i => ({
      itemId: i.itemId, itemName: i.itemName,
      quantity: i.quantity, unitPrice: i.unitPrice,
      total: this.computeItemTotal(i)
    }));

    const order: ApiPurchaseOrder = {
      vendorId:    this.selectedVendorId || '',
      vendorName:  this.purchaseForm.value.vendor,
      orderDate:   this.purchaseForm.value.orderDate,
      paymentMode: this.purchaseForm.value.paymentMode,
      remarks:     this.purchaseForm.value.remarks || '',
      totalAmount: this.grandTotal,
      items
    };

    this.isLoading = true;
    this.api.createPurchaseOrder(order)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.toastr.success('Purchase order created. Inventory replenished.', 'Success');
          this.resetForm();
        },
        error: err => this.toastr.error(err?.error?.message || 'Failed to submit order.', 'Error')
      });
  }

  resetForm(): void {
    this.purchaseForm.reset({ orderDate: new Date().toISOString().slice(0, 10), status: 'Pending', paymentMode: 'Cash' });
    this.purchaseItems = [{ itemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 }];
    this.selectedVendorId = null;
    this.updateRowData();
    this.api.getPurchaseOrders(1, 50).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.existingOrders = r.items; this.cdr.markForCheck(); }
    });
  }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Quantity', 'Unit Price', 'Total'];
    const rows = this.purchaseItems.map(item => [
      item.itemId, item.itemName, item.quantity.toString(),
      item.unitPrice.toFixed(2), this.computeItemTotal(item).toFixed(2)
    ]);
    this.exportService.exportToCsv(headers, rows, `purchase_order_${new Date().toISOString().split('T')[0]}`);
  }

  goBack(): void { this.router.navigate(['/dashboard']); }
}

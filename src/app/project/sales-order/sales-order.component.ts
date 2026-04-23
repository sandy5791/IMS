import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { finalize } from 'rxjs';

import { CanComponentDeactivate } from '../../services/can-deactivate.guard';
import { StorageService } from '../../services/storage.service';
import { ExportService } from '../../services/export.service';
import { ImsApiService, ApiSalesOrder, ApiSaleItem, ApiInventoryItem, ApiCustomer } from '../../services/ims-api.service';
import { BackToTopDirective } from '../../utilities/back-to-top.directive';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { EntityLookupComponent } from '../../utilities/entity-lookup/entity-lookup.component';

interface SaleRow {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, BackToTopDirective, PageShellComponent,
    MatTableModule, MatCheckboxModule, MatPaginatorModule, EntityLookupComponent
  ],
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrderComponent implements OnInit, CanComponentDeactivate, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  salesOrderForm!: FormGroup;
  searchText = '';
  isLoading = false;
  private barcodeBuffer = '';

  salesDtlArr: SaleRow[] = [
    { itemId: '', itemName: '', quantity: 1, price: 0, discount: 0, total: 0 }
  ];

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'quantity', 'price', 'discount', 'total'];
  dataSource = new MatTableDataSource<SaleRow>(this.salesDtlArr);
  selection = new SelectionModel<SaleRow>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('customerLookup') customerLookup!: EntityLookupComponent;

  isBackToTopVisible = false;
  scrollContainer!: HTMLElement;
  customers: ApiCustomer[] = [];
  inventory: ApiInventoryItem[] = [];
  selectedCustomerId: string | null = null;
  existingSalesOrders: ApiSalesOrder[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: NotificationService,
    private api: ImsApiService,
    private storage: StorageService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.salesOrderForm = this.fb.group({
      Name:        ['', [Validators.required]],
      contact:     ['', [Validators.required]],
      email:       ['', [Validators.email]],
      loyaltyNo:   [''],
      OrderDate:   [new Date().toISOString().slice(0, 10)],
      paymentMode: ['', [Validators.required]],
      SalePerson:  [this.storage.getItem<string>('LoggedInUser') || ''],
      discount:    [0],
      taxDetails:  [''],
      Remarks:     [''],
    });
  }

  ngOnInit(): void {
    // Load customers and inventory from API for lookups
    this.api.getCustomers(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.customers = r.items; this.cdr.markForCheck(); }
    });
    this.api.getInventory(1, 500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.inventory = r.items; this.cdr.markForCheck(); }
    });
    // Load existing orders
    this.api.getSalesOrders(1, 50).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.existingSalesOrders = r.items; this.cdr.markForCheck(); }
    });
    this.updateRowData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  canDeactivate(): boolean {
    if (this.salesOrderForm.dirty) {
      return confirm('You have unsaved changes. Do you want to leave?');
    }
    return true;
  }

  trackByItemId(_index: number, item: SaleRow): string {
    return item.itemId || String(_index);
  }

  @HostListener('document:keydown', ['$event'])
  handleScannerInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 2) { this.processScannedBarcode(this.barcodeBuffer); }
      this.barcodeBuffer = '';
    } else if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
      if (this.barcodeBuffer.length > 20) this.barcodeBuffer = '';
    }
  }

  processScannedBarcode(barcode: string): void {
    const item = this.inventory.find(i => i.itemId.toLowerCase() === barcode.toLowerCase());
    if (item) {
      this.toastr.success(`Scanned: ${item.itemName}`, 'Barcode Detected');
      this.addSalesItem();
      const last = this.salesDtlArr[this.salesDtlArr.length - 1];
      last.itemId = item.itemId; last.itemName = item.itemName; last.price = item.unitPrice;
      this.updateRowData();
    }
  }

  updateRowData(): void {
    const filtered = this.salesDtlArr.filter(item =>
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

  addSalesItem(): void {
    this.salesDtlArr.push({ itemId: '', itemName: '', quantity: 1, price: 0, discount: 0, total: 0 });
    this.updateRowData();
  }

  removeSelectedRows(): void {
    if (!this.selection.selected.length) return;
    this.salesDtlArr = this.salesDtlArr.filter(item => !this.selection.selected.includes(item));
    this.updateRowData();
  }

  hasSelectedRows(): boolean { return this.selection.selected.length > 0; }

  computeItemTotal(item: SaleRow): number {
    return Number((item.quantity * item.price * (1 - (item.discount || 0) / 100)).toFixed(2));
  }

  computeOrderTotal(): number {
    return this.salesDtlArr.reduce((sum, item) => {
      const t = item.quantity * item.price * (1 - (item.discount || 0) / 100);
      return sum + (isNaN(t) ? 0 : t);
    }, 0);
  }

  onCustomerBlur(): void {
    const entered = this.salesOrderForm.value.Name;
    if (!entered) return;
    const customer = this.customers.find(c =>
      c.name.toLowerCase() === entered.toLowerCase() ||
      c.customerId.toLowerCase() === entered.toLowerCase()
    );
    if (customer) {
      this.salesOrderForm.patchValue({ Name: customer.name, contact: customer.phone, email: customer.email, loyaltyNo: customer.loyaltyPoints.toString() });
      this.selectedCustomerId = customer.customerId;
    } else { this.selectedCustomerId = null; }
  }

  openCustomerModal(): void { this.customerLookup.open(); }

  selectModalCustomer(c: ApiCustomer): void {
    this.salesOrderForm.patchValue({ Name: c.name, contact: c.phone || '', email: c.email || '', loyaltyNo: c.loyaltyPoints?.toString() || '' });
    this.selectedCustomerId = c.customerId;
  }

  onItemSelect(item: SaleRow, itemId: string): void {
    const inv = this.inventory.find(i => i.itemId === itemId);
    if (inv) { item.itemId = inv.itemId; item.itemName = inv.itemName; item.price = inv.unitPrice; }
  }

  goBack(): void { this.router.navigate(['/dashboard']); }

  submitForm(): void {
    if (!this.salesOrderForm.valid) {
      this.salesOrderForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }
    if (this.salesDtlArr.length === 0 || !this.salesDtlArr.some(i => i.itemId)) {
      this.toastr.error('Please add at least one item.', 'Validation Error');
      return;
    }

    const items: ApiSaleItem[] = this.salesDtlArr
      .filter(i => i.itemId)
      .map(i => ({
        itemId: i.itemId, itemName: i.itemName,
        quantity: i.quantity, price: i.price,
        discount: i.discount, total: this.computeItemTotal(i)
      }));

    const order: ApiSalesOrder = {
      customerId:   this.selectedCustomerId || '',
      customerName: this.salesOrderForm.value.Name,
      contact:      this.salesOrderForm.value.contact,
      email:        this.salesOrderForm.value.email || '',
      orderDate:    this.salesOrderForm.value.OrderDate,
      paymentMode:  this.salesOrderForm.value.paymentMode,
      salesPerson:  this.salesOrderForm.value.SalePerson || '',
      discount:     this.salesOrderForm.value.discount || 0,
      taxDetails:   this.salesOrderForm.value.taxDetails || '',
      remarks:      this.salesOrderForm.value.Remarks || '',
      totalAmount:  this.computeOrderTotal(),
      items
    };

    this.isLoading = true;
    this.api.createSalesOrder(order)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.toastr.success('Sales order submitted. Inventory deducted.', 'Success');
          this.resetForm();
        },
        error: err => this.toastr.error(err?.error?.message || 'Failed to submit order.', 'Error')
      });
  }

  resetForm(): void {
    this.salesOrderForm.reset({ OrderDate: new Date().toISOString().slice(0, 10), SalePerson: this.storage.getItem('LoggedInUser') || '', discount: 0 });
    this.salesDtlArr = [{ itemId: '', itemName: '', quantity: 1, price: 0, discount: 0, total: 0 }];
    this.selectedCustomerId = null;
    this.updateRowData();
    // Reload the orders list
    this.api.getSalesOrders(1, 50).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: r => { this.existingSalesOrders = r.items; this.cdr.markForCheck(); }
    });
  }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Quantity', 'Price', 'Discount (%)', 'Total'];
    const rows = this.salesDtlArr.map(item => [
      item.itemId, item.itemName, item.quantity.toString(),
      item.price.toFixed(2), (item.discount || 0).toString(),
      this.computeItemTotal(item).toFixed(2)
    ]);
    this.exportService.exportToCsv(headers, rows, `sales_order_${new Date().toISOString().split('T')[0]}`);
  }

  onBackToTopVisibility(isVisible: boolean): void {
    this.isBackToTopVisible = isVisible;
  }
}

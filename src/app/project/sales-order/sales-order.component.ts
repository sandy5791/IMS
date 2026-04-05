import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { CanComponentDeactivate } from '../../services/can-deactivate.guard';
import { StorageService } from '../../services/storage.service';
import { CoreDataService, SalesRecord } from '../../services/core-data.service';
import { ExportService } from '../../services/export.service';
import { SaleDetails, Customer, InventoryItem } from '../models/model';
import { BackToTopDirective } from '../../utilities/back-to-top.directive';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { EntityLookupComponent } from '../../utilities/entity-lookup/entity-lookup.component';

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
export class SalesOrderComponent implements OnInit, CanComponentDeactivate {
  private readonly destroyRef = inject(DestroyRef);

  salesOrderForm!: FormGroup;
  searchText = '';
  scrollContainer: any;
  private barcodeBuffer = '';

  salesDtlArr: SaleDetails[] = [
    new SaleDetails({ itemId: 'I-001', itemName: 'Widget A', quantity: 1, price: 100, discount: 0, total: 100 }),
    new SaleDetails({ itemId: 'I-002', itemName: 'Component B', quantity: 2, price: 250, discount: 5, total: 475 }),
    new SaleDetails({ itemId: 'I-004', itemName: 'Titanium Bolt 10mm', quantity: 50, price: 5, discount: 0, total: 250 }),
    new SaleDetails({ itemId: 'I-005', itemName: 'Circuit Board v2', quantity: 1, price: 80, discount: 0, total: 80 }),
    new SaleDetails({ itemId: 'I-007', itemName: 'Cooling Fan 120mm', quantity: 3, price: 15, discount: 0, total: 45 }),
    new SaleDetails({ itemId: 'I-010', itemName: 'Copper Wire 100m', quantity: 2, price: 40, discount: 0, total: 80 }),
    new SaleDetails({ itemId: 'I-013', itemName: 'Steel Rod 2m', quantity: 5, price: 60, discount: 10, total: 270 }),
    new SaleDetails({ itemId: 'I-006', itemName: 'Power Supply 500W', quantity: 1, price: 120, discount: 0, total: 120 }),
    new SaleDetails({ itemId: 'I-008', itemName: 'LED Panel 4K', quantity: 1, price: 350, discount: 0, total: 350 }),
    new SaleDetails({ itemId: 'I-015', itemName: 'Laser Diode', quantity: 2, price: 90, discount: 5, total: 171 })
  ];

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'quantity', 'price', 'discount', 'total'];
  dataSource = new MatTableDataSource<SaleDetails>(this.salesDtlArr);
  selection = new SelectionModel<SaleDetails>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('customerLookup') customerLookup!: EntityLookupComponent;

  isBackToTopVisible = false;
  customers: Customer[] = [];
  inventory: InventoryItem[] = [];
  selectedCustomerId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private coreData: CoreDataService,
    private storage: StorageService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.salesOrderForm = this.fb.group({
      Name: ['', [Validators.required]],
      contact: ['', [Validators.required]],
      email: ['', [Validators.email]],
      loyaltyNo: [''],
      OrderDate: [new Date().toISOString().slice(0, 10)],
      paymentMode: ['', [Validators.required]],
      SalePerson: [''],
      discount: [0],
      taxDetails: [''],
      Remarks: [''],
    });
  }

  ngOnInit(): void {
    this.coreData.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.customers = data;
      this.cdr.markForCheck();
    });
    this.coreData.inventory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.inventory = data;
      this.cdr.markForCheck();
    });
    this.updateRowData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  canDeactivate(): boolean {
    if (this.salesOrderForm.dirty || this.salesDtlArr.length > 10) {
      return confirm('You have unsaved changes. Do you want to leave? Your changes will be lost.');
    }
    return true;
  }

  /** trackBy for mat-table rows — prevents unnecessary DOM re-renders. */
  trackByItemId(_index: number, item: SaleDetails): string {
    return item.itemId;
  }

  @HostListener('document:keydown', ['$event'])
  handleScannerInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 2) {
        this.processScannedBarcode(this.barcodeBuffer);
      }
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
      const lastItem = this.salesDtlArr[this.salesDtlArr.length - 1];
      lastItem.itemId = item.itemId;
      lastItem.itemName = item.itemName;
      lastItem.price = 50;
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

  onSearchChange(): void {
    this.updateRowData();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  addSalesItem(): void {
    this.salesDtlArr.push(new SaleDetails({
      itemId: '',
      itemName: '',
      quantity: 1,
      price: 0,
      discount: 0,
      total: 0
    }));
    this.updateRowData();
  }

  removeSelectedRows(): void {
    const selected = this.selection.selected;
    if (!selected.length) { return; }
    this.salesDtlArr = this.salesDtlArr.filter(item => !selected.includes(item));
    this.updateRowData();
  }

  hasSelectedRows(): boolean {
    return this.selection.selected.length > 0;
  }

  computeItemTotal(item: SaleDetails): number {
    return Number((item.quantity * item.price * (1 - (item.discount || 0) / 100)).toFixed(2));
  }

  computeOrderTotal(): number {
    return this.salesDtlArr.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price * (1 - (item.discount || 0) / 100);
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
  }

  onCustomerBlur(): void {
    const enteredName = this.salesOrderForm.value.Name;
    if (!enteredName) return;

    const customer = this.customers.find((c: Customer) =>
      c.name.toLowerCase() === enteredName.toLowerCase() ||
      c.customerId.toLowerCase() === enteredName.toLowerCase()
    );

    if (customer) {
      this.salesOrderForm.patchValue({
        Name: customer.name,
        contact: customer.phone,
        email: customer.email,
        loyaltyNo: customer.loyaltyPoints.toString()
      });
      this.selectedCustomerId = customer.customerId;
    } else {
      this.selectedCustomerId = null;
    }
  }

  openCustomerModal(): void {
    this.customerLookup.open();
  }

  selectModalCustomer(c: any): void {
    this.salesOrderForm.patchValue({
      Name: c.name,
      contact: c.phone || '',
      email: c.email || '',
      loyaltyNo: c.loyaltyPoints?.toString() || ''
    });
    this.selectedCustomerId = c.customerId;
  }

  onItemSelect(item: SaleDetails, itemId: string): void {
    const invItem = this.inventory.find((i: InventoryItem) => i.itemId === itemId);
    if (invItem) {
      item.itemId = invItem.itemId;
      item.itemName = invItem.itemName;
      item.price = 50;
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  submitForm(): void {
    if (!this.salesOrderForm.valid) {
      this.salesOrderForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    if (this.salesDtlArr.length === 0) {
      this.toastr.error('Please add at least one item to the order.', 'Validation Error');
      return;
    }

    let customerIdToUse = this.selectedCustomerId;
    const customerNameToUse = this.salesOrderForm.value.Name;

    if (!customerIdToUse) {
      const newCustomer = new Customer({
        customerId: 'CUST-' + Math.floor(Math.random() * 90000 + 10000),
        name: customerNameToUse,
        email: this.salesOrderForm.value.email || '',
        phone: this.salesOrderForm.value.contact || '',
        address: 'Added from Sales directly',
        loyaltyPoints: 0
      });
      this.coreData.addCustomer(newCustomer);
      customerIdToUse = newCustomer.customerId;
    }

    const orderRecord: SalesRecord = {
      orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
      customerId: customerIdToUse,
      customerName: customerNameToUse,
      date: this.salesOrderForm.value.OrderDate,
      totalAmount: this.computeOrderTotal(),
      items: this.salesDtlArr
    };

    this.coreData.processSale(orderRecord);
    this.toastr.success('Sales order submitted successfully. Inventory deducted.', 'Success');
    this.resetForm();
  }

  resetForm(): void {
    this.salesOrderForm.reset({
      OrderDate: new Date().toISOString().slice(0, 10),
      SalePerson: this.storage.getItem('LoggedInUser') || '',
      discount: 0
    });
    this.salesDtlArr = [new SaleDetails({ itemId: '', itemName: '', quantity: 1, price: 0, discount: 0, total: 0 })];
    this.updateRowData();
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

  onBackToTopVisibility(isVisible: any): void {
    this.isBackToTopVisible = isVisible;
  }
}

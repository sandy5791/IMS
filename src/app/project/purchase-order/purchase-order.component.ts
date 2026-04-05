import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { CoreDataService, PurchaseRecord } from '../../services/core-data.service';
import { ExportService } from '../../services/export.service';
import { Vendor, InventoryItem } from '../models/model';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { EntityLookupComponent } from '../../utilities/entity-lookup/entity-lookup.component';
import { CanComponentDeactivate } from '../../services/can-deactivate.guard';

interface PurchaseItem {
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
export class PurchaseOrderComponent implements OnInit, CanComponentDeactivate {
  private readonly destroyRef = inject(DestroyRef);

  purchaseForm: FormGroup;
  purchaseItems: PurchaseItem[] = [];
  searchText = '';

  displayedColumns: string[] = ['select', 'index', 'itemId', 'itemName', 'quantity', 'unitPrice', 'total'];
  dataSource = new MatTableDataSource<PurchaseItem>(this.purchaseItems);
  selection = new SelectionModel<PurchaseItem>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('vendorLookup') vendorLookup!: EntityLookupComponent;

  vendors: Vendor[] = [];
  inventory: InventoryItem[] = [];
  selectedVendorId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private coreData: CoreDataService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.purchaseForm = this.fb.group({
      vendor: ['', Validators.required],
      poNumber: ['', [Validators.required]],
      orderDate: [new Date().toISOString().slice(0, 10)],
      expectedDelivery: [''],
      status: ['Pending'],
      remarks: [''],
      paymentMode: ['Cash'],
    });
  }

  ngOnInit(): void {
    this.coreData.vendors$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.vendors = data;
      this.cdr.markForCheck();
    });
    this.coreData.inventory$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.inventory = data;
      this.cdr.markForCheck();
    });

    this.purchaseItems = [
      { itemId: 'I-001', itemName: 'Widget A', quantity: 5, unitPrice: 10, total: 50 },
      { itemId: 'I-003', itemName: 'Sensor Module X', quantity: 10, unitPrice: 20, total: 200 },
      { itemId: 'I-004', itemName: 'Titanium Bolt 10mm', quantity: 100, unitPrice: 2, total: 200 },
      { itemId: 'I-006', itemName: 'Power Supply 500W', quantity: 5, unitPrice: 80, total: 400 },
      { itemId: 'I-007', itemName: 'Cooling Fan 120mm', quantity: 20, unitPrice: 8, total: 160 },
      { itemId: 'I-010', itemName: 'Copper Wire 100m', quantity: 15, unitPrice: 25, total: 375 },
      { itemId: 'I-012', itemName: 'Silicon Sealant', quantity: 8, unitPrice: 12, total: 96 },
      { itemId: 'I-014', itemName: 'Thermal Paste', quantity: 12, unitPrice: 5, total: 60 },
      { itemId: 'I-002', itemName: 'Component B', quantity: 25, unitPrice: 15, total: 375 },
      { itemId: 'I-009', itemName: 'Logic Controller', quantity: 2, unitPrice: 150, total: 300 }
    ];
    this.updateRowData();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (!this.canDeactivate()) {
      $event.preventDefault();
    }
  }

  canDeactivate(): boolean {
    if (this.purchaseForm.dirty || this.purchaseItems.length > 0) {
      return confirm('You have unsaved changes in your Purchase Order. Do you want to leave?');
    }
    return true;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  trackByItemId(_index: number, item: PurchaseItem): string {
    return item.itemId;
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

  addRow(): void {
    this.purchaseItems.push({ itemId: '', itemName: 'New Item', quantity: 1, unitPrice: 0, total: 0 });
    this.updateRowData();
  }

  onItemSelect(item: PurchaseItem, itemId: string): void {
    const invItem = this.inventory.find(i => i.itemId === itemId);
    if (invItem) {
      item.itemId = invItem.itemId;
      item.itemName = invItem.itemName;
      item.unitPrice = 10;
    }
  }

  removeSelectedRows(): void {
    const selected = this.selection.selected;
    if (!selected.length) { return; }
    this.purchaseItems = this.purchaseItems.filter(item => !selected.includes(item));
    this.updateRowData();
  }

  hasSelectedRows(): boolean {
    return this.selection.selected.length > 0;
  }

  computeItemTotal(item: PurchaseItem): number {
    return Number((item.quantity * item.unitPrice).toFixed(2));
  }

  get grandTotal(): number {
    return this.purchaseItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  }

  onVendorBlur(): void {
    const enteredVendor = this.purchaseForm.value.vendor;
    if (!enteredVendor) return;

    const vendorMatch = this.vendors.find(v =>
      v.name.toLowerCase() === enteredVendor.toLowerCase() ||
      v.vendorId.toLowerCase() === enteredVendor.toLowerCase()
    );

    if (vendorMatch) {
      this.purchaseForm.patchValue({ vendor: vendorMatch.name });
      this.selectedVendorId = vendorMatch.vendorId;
    } else {
      this.selectedVendorId = null;
    }
  }

  openVendorModal(): void {
    this.vendorLookup.open();
  }

  selectModalVendor(v: any): void {
    this.purchaseForm.patchValue({ vendor: v.name });
    this.selectedVendorId = v.vendorId;
  }

  submitPurchase(): void {
    if (!this.purchaseForm.valid) {
      this.purchaseForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    let vendorIdToUse = this.selectedVendorId;
    const vendorNameToUse = this.purchaseForm.value.vendor;

    if (!vendorIdToUse) {
      const newVendor = new Vendor({
        vendorId: 'VND-' + Math.floor(Math.random() * 90000 + 10000),
        name: vendorNameToUse,
        email: 'N/A',
        phone: 'N/A',
        address: 'Added from PO',
        rating: 5
      });
      this.coreData.addVendor(newVendor);
      vendorIdToUse = newVendor.vendorId;
    }

    const orderRecord: PurchaseRecord = {
      orderId: 'PO-' + Math.floor(Math.random() * 1000000),
      vendorId: vendorIdToUse,
      vendorName: vendorNameToUse,
      date: this.purchaseForm.value.orderDate,
      totalAmount: this.grandTotal,
      items: this.purchaseItems
    };

    this.coreData.processPurchase(orderRecord);
    this.toastr.success('Purchase order created successfully. Inventory increased.', 'Success');
    this.resetForm();
  }

  resetForm(): void {
    this.purchaseForm.reset({
      orderDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      paymentMode: 'Cash'
    });
    this.purchaseItems = [{ itemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 }];
    this.updateRowData();
  }

  exportToCsv(): void {
    const headers = ['Item ID', 'Item Name', 'Quantity', 'Unit Price', 'Total'];
    const rows = this.purchaseItems.map(item => [
      item.itemId, item.itemName, item.quantity.toString(),
      item.unitPrice.toFixed(2), this.computeItemTotal(item).toFixed(2)
    ]);
    this.exportService.exportToCsv(headers, rows, `purchase_order_${new Date().toISOString().split('T')[0]}`);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

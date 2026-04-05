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

import { Customer } from '../models/model';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { CoreDataService } from '../../services/core-data.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, PageShellComponent,
    MatTableModule, MatCheckboxModule, MatPaginatorModule, MatSortModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  customerForm: FormGroup;
  customersList: Customer[] = [];
  searchText = '';

  displayedColumns: string[] = ['select', 'index', 'customerId', 'name', 'email', 'phone', 'address', 'loyaltyPoints'];
  dataSource = new MatTableDataSource<Customer>(this.customersList);
  selection = new SelectionModel<Customer>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreData: CoreDataService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      customerId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      loyaltyPoints: [0, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    this.coreData.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.customersList = data;
      this.refreshData();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  trackByCustomerId(_index: number, item: Customer): string {
    return item.customerId;
  }

  private refreshData(): void {
    this.dataSource.data = this.customersList;
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

  addCustomer(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    const customer = new Customer(this.customerForm.value);
    this.coreData.addCustomer(customer);
    this.customerForm.reset();
  }

  removeSelected(): void {
    const selected = this.selection.selected;
    const remaining = this.customersList.filter(item => !selected.includes(item));
    this.coreData.setCustomers(remaining);
    this.selection.clear();
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  exportToCsv(): void {
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Loyalty Points'];
    const rows = this.customersList.map(c => [
      c.customerId, c.name, c.email, c.phone, c.address, c.loyaltyPoints.toString()
    ]);
    this.exportService.exportToCsv(headers, rows, 'customers');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

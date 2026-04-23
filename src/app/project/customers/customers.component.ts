import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationService } from '../../services/notification.service';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { finalize } from 'rxjs';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { ImsApiService, ApiCustomer } from '../../services/ims-api.service';
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
export class CustomersComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  customerForm: FormGroup;
  customersList: ApiCustomer[] = [];
  searchText = '';
  isLoading = false;

  displayedColumns: string[] = ['select', 'index', 'customerId', 'name', 'email', 'phone', 'address', 'loyaltyPoints'];
  dataSource = new MatTableDataSource<ApiCustomer>([]);
  selection = new SelectionModel<ApiCustomer>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private api: ImsApiService,
    private exportService: ExportService,
    private toastr: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      name:          ['', Validators.required],
      email:         ['', [Validators.required, Validators.email]],
      phone:         ['', Validators.required],
      address:       ['', Validators.required],
      loyaltyPoints: [0, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCustomers(search?: string): void {
    this.isLoading = true;
    this.api.getCustomers(1, 200, search)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          this.customersList = result.items;
          this.dataSource.data = result.items;
          this.selection.clear();
          this.cdr.markForCheck();
        },
        error: () => this.toastr.error('Failed to load customers.', 'Error')
      });
  }

  trackByCustomerId(_index: number, item: ApiCustomer): string {
    return item.customerId;
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
    this.api.createCustomer(this.customerForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Customer created.', 'Success');
          this.customerForm.reset({ loyaltyPoints: 0 });
          this.loadCustomers();
        },
        error: () => this.toastr.error('Failed to create customer.', 'Error')
      });
  }

  removeSelected(): void {
    const selected = this.selection.selected;
    if (!selected.length) return;
    const deletes = selected.map(c =>
      this.api.deleteCustomer(c.customerId).pipe(takeUntilDestroyed(this.destroyRef))
    );
    let done = 0;
    deletes.forEach(obs => obs.subscribe({
      next: () => { done++; if (done === deletes.length) { this.toastr.success('Deleted.', 'Success'); this.loadCustomers(); } },
      error: () => this.toastr.error('Failed to delete one or more customers.', 'Error')
    }));
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  exportToCsv(): void {
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Loyalty Points'];
    const rows = this.customersList.map(c => [
      c.customerId, c.name, c.email ?? '', c.phone ?? '', c.address ?? '', c.loyaltyPoints.toString()
    ]);
    this.exportService.exportToCsv(headers, rows, 'customers');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

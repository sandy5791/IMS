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
import { ImsApiService, ApiVendor } from '../../services/ims-api.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, CommonModule, PageShellComponent,
    MatTableModule, MatCheckboxModule, MatPaginatorModule, MatSortModule
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500, delay: 100 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  vendorForm: FormGroup;
  vendorsList: ApiVendor[] = [];
  searchText = '';
  isLoading = false;

  displayedColumns: string[] = ['select', 'index', 'vendorId', 'name', 'email', 'phone', 'address', 'rating'];
  dataSource = new MatTableDataSource<ApiVendor>([]);
  selection = new SelectionModel<ApiVendor>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private api: ImsApiService,
    private exportService: ExportService,
    private toastr: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.vendorForm = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      phone:   ['', Validators.required],
      address: ['', Validators.required],
      rating:  [5, [Validators.min(0), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVendors(search?: string): void {
    this.isLoading = true;
    this.api.getVendors(1, 200, search)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          this.vendorsList = result.items;
          this.dataSource.data = result.items;
          this.selection.clear();
          this.cdr.markForCheck();
        },
        error: () => this.toastr.error('Failed to load vendors.', 'Error')
      });
  }

  trackByVendorId(_index: number, item: ApiVendor): string {
    return item.vendorId;
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

  addVendor(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    this.api.createVendor(this.vendorForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success('Vendor created.', 'Success');
          this.vendorForm.reset({ rating: 5 });
          this.loadVendors();
        },
        error: () => this.toastr.error('Failed to create vendor.', 'Error')
      });
  }

  removeSelected(): void {
    const selected = this.selection.selected;
    if (!selected.length) return;
    let done = 0;
    selected.forEach(v => {
      this.api.deleteVendor(v.vendorId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { done++; if (done === selected.length) { this.toastr.success('Deleted.', 'Success'); this.loadVendors(); } },
        error: () => this.toastr.error('Failed to delete one or more vendors.', 'Error')
      });
    });
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  exportToCsv(): void {
    const headers = ['Vendor ID', 'Name', 'Email', 'Phone', 'Address', 'Rating'];
    const rows = this.vendorsList.map(v => [
      v.vendorId, v.name, v.email ?? '', v.phone ?? '', v.address ?? '', v.rating.toString()
    ]);
    this.exportService.exportToCsv(headers, rows, 'vendors');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

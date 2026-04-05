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

import { Vendor } from '../models/model';
import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { CoreDataService } from '../../services/core-data.service';
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
export class VendorsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  vendorForm: FormGroup;
  vendorsList: Vendor[] = [];
  searchText = '';

  displayedColumns: string[] = ['select', 'index', 'vendorId', 'name', 'email', 'phone', 'address', 'rating'];
  dataSource = new MatTableDataSource<Vendor>(this.vendorsList);
  selection = new SelectionModel<Vendor>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coreData: CoreDataService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.vendorForm = this.fb.group({
      vendorId: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      rating: [5, [Validators.min(0), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.coreData.vendors$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.vendorsList = data;
      this.refreshData();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  trackByVendorId(_index: number, item: Vendor): string {
    return item.vendorId;
  }

  private refreshData(): void {
    this.dataSource.data = this.vendorsList;
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

  addVendor(): void {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }
    const vendor = new Vendor(this.vendorForm.value);
    this.coreData.addVendor(vendor);
    this.vendorForm.reset();
  }

  removeSelected(): void {
    const selected = this.selection.selected;
    const remaining = this.vendorsList.filter(item => !selected.includes(item));
    this.coreData.setVendors(remaining);
    this.selection.clear();
  }

  onSearchChange(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  exportToCsv(): void {
    const headers = ['Vendor ID', 'Name', 'Email', 'Phone', 'Address', 'Rating'];
    const rows = this.vendorsList.map(v => [
      v.vendorId, v.name, v.email, v.phone, v.address, v.rating.toString()
    ]);
    this.exportService.exportToCsv(headers, rows, 'vendors');
  }

  hasSelectedItems(): boolean {
    return this.selection.selected.length > 0;
  }
}

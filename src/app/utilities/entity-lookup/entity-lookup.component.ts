import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { fadeInUpOnEnter } from '@ngverse/motion/animatecss';

import { ApiCustomer, ApiVendor, ImsApiService } from '../../services/ims-api.service';

@Component({
  selector: 'app-entity-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './entity-lookup.component.html',
  styleUrls: ['./entity-lookup.component.scss'],
  animations: [fadeInUpOnEnter({ duration: 400 })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityLookupComponent {
  @Input() type: 'customer' | 'vendor' = 'customer';
  @Output() entitySelected = new EventEmitter<any>();

  isVisible = false;
  lookupMode: 'search' | 'create' = 'search';
  searchText = '';
  sortOrder: 'latest' | 'name-asc' | 'name-desc' = 'latest';

  filteredItems: Array<ApiCustomer | ApiVendor> = [];
  entityForm: FormGroup;

  constructor(private fb: FormBuilder, private imsApi: ImsApiService, private cdr: ChangeDetectorRef) {
    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      email: ['']
    });
  }

  get title(): string {
    return this.type === 'customer' ? 'Customer Lookup' : 'Vendor Lookup';
  }

  get iconClass(): string {
    return this.type === 'customer' ? 'fas fa-users' : 'fas fa-building';
  }

  trackByEntityId(_index: number, item: any): string {
    return this.type === 'customer' ? item.customerId : item.vendorId;
  }

  open(): void {
    this.isVisible = true;
    this.lookupMode = 'search';
    this.searchText = '';
    this.entityForm.reset();
    this.filterData();
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
  }

  close(): void {
    this.isVisible = false;
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  filterData(): void {
    // Basic search on API
    if (this.type === 'customer') {
      this.imsApi.getCustomers(1, 20, this.searchText).subscribe({
        next: (res) => {
          this.filteredItems = this.sortItems(res.items);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.imsApi.getVendors(1, 20, this.searchText).subscribe({
        next: (res) => {
          this.filteredItems = this.sortItems(res.items);
          this.cdr.markForCheck();
        }
      });
    }
  }

  onSearchChange(): void {
    this.filterData();
  }

  onSortChange(): void {
    this.filteredItems = this.sortItems(this.filteredItems);
    this.cdr.markForCheck();
  }

  selectItem(item: ApiCustomer | ApiVendor): void {
    this.entitySelected.emit(item);
    this.close();
  }

  getIdField(item: ApiCustomer | ApiVendor): string {
    return 'customerId' in item ? item.customerId : item.vendorId;
  }

  private sortItems(items: Array<ApiCustomer | ApiVendor>): Array<ApiCustomer | ApiVendor> {
    if (this.sortOrder === 'latest') {
      return [...items];
    }

    const direction = this.sortOrder === 'name-desc' ? -1 : 1;
    return [...items].sort((left, right) =>
      left.name.localeCompare(right.name) * direction
    );
  }

  createEntity(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      return;
    }
    const vals = this.entityForm.value;

    if (this.type === 'customer') {
      this.imsApi.createCustomer({
        name: vals.name,
        email: vals.email || 'N/A',
        phone: vals.phone || 'N/A',
        address: 'N/A',
        loyaltyPoints: 0
      }).subscribe(newCust => {
        this.selectItem(newCust);
      });
    } else {
      this.imsApi.createVendor({
        name: vals.name,
        email: vals.email || 'N/A',
        phone: vals.phone || 'N/A',
        address: 'N/A',
        rating: 5
      }).subscribe(newVend => {
        this.selectItem(newVend);
      });
    }
  }
}

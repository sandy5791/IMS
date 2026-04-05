import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { fadeInUpOnEnter } from '@ngverse/motion/animatecss';

import { CoreDataService } from '../../services/core-data.service';
import { Customer, Vendor } from '../../project/models/model';

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
  sortOrder: 'name-asc' | 'name-desc' | 'latest' = 'latest';

  filteredItems: any[] = [];
  entityForm: FormGroup;

  constructor(private fb: FormBuilder, private coreData: CoreDataService) {
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
    const s = this.searchText.toLowerCase();
    const sourceArr = this.type === 'customer' ? this.coreData.getCustomers() : this.coreData.getVendors();

    this.filteredItems = sourceArr.filter(item => {
      const matchName = item.name?.toLowerCase().includes(s);
      const matchPhone = item.phone?.toLowerCase().includes(s);
      const idField = this.getIdField(item);
      const matchId = idField ? idField.toLowerCase().includes(s) : false;
      return matchName || matchPhone || matchId;
    });

    this.filteredItems.sort((a, b) => {
      if (this.sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (this.sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }

  onSortChange(): void {
    this.filterData();
  }

  selectItem(item: any): void {
    this.entitySelected.emit(item);
    this.close();
  }

  getIdField(item: any): string {
    return this.type === 'customer' ? item.customerId : item.vendorId;
  }

  createEntity(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      return;
    }
    const vals = this.entityForm.value;

    if (this.type === 'customer') {
      const newCust = new Customer({
        customerId: 'CUST-' + Math.floor(Math.random() * 90000 + 10000),
        name: vals.name,
        phone: vals.phone || 'N/A',
        email: vals.email || 'N/A',
        address: '',
        loyaltyPoints: 0
      });
      this.coreData.addCustomer(newCust);
      this.selectItem(newCust);
    } else {
      const newVend = new Vendor({
        vendorId: 'VND-' + Math.floor(Math.random() * 90000 + 10000),
        name: vals.name,
        phone: vals.phone || 'N/A',
        email: vals.email || 'N/A',
        address: '',
        rating: 5
      });
      this.coreData.addVendor(newVend);
      this.selectItem(newVend);
    }
  }
}

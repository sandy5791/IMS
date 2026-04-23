import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { ImsApiService } from '../../services/ims-api.service';
import { StorageService } from '../../services/storage.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, PageShellComponent, MatTableModule, MatPaginatorModule],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortalComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  userName: string;
  isVendor = false;
  portalTitle = 'Customer Portal';
  portalSubtitle = 'Manage your orders and loyalty rewards';
  loyaltyPoints = 0;
  totalVolume = 0;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['orderId', 'date', 'amount', 'status'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private imsApi: ImsApiService,
    private storage: StorageService,
    private cdr: ChangeDetectorRef
  ) {
    this.userName = this.storage.getItem<string>('LoggedInUser') || 'Portal Guest';
  }

  ngOnInit(): void {
    // Attempt to figure out if it's a vendor or customer
    forkJoin({
      vendors: this.imsApi.getVendors(1, 100, this.userName),
      customers: this.imsApi.getCustomers(1, 100, this.userName)
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const foundVendor = res.vendors.items.find(v => v.name.toLowerCase() === this.userName.toLowerCase());
        
        if (foundVendor) {
          this.isVendor = true;
          this.portalTitle = 'Vendor Portal';
          this.portalSubtitle = 'Manage your supplies and invoices';
          this.loadVendorData(foundVendor.vendorId);
        } else {
          const foundCustomer = res.customers.items.find(c => c.name.toLowerCase() === this.userName.toLowerCase());
          if (foundCustomer) {
             this.loadCustomerData(foundCustomer);
          }
        }
        this.cdr.markForCheck();
      }
    });
  }

  private loadCustomerData(customer: any): void {
    this.loyaltyPoints = customer.loyaltyPoints;
    // Assuming search by customer name
    this.imsApi.getSalesOrders(1, 100, customer.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const mySales = res.items.filter(s => s.customerId === customer.customerId);
      this.dataSource.data = mySales;
      this.totalVolume = mySales.reduce((sum, s) => sum + s.totalAmount, 0);
      this.cdr.markForCheck();
    });
  }

  private loadVendorData(vId: string): void {
    // Assuming search by vendor id or we just fetch and filter locally
    this.imsApi.getPurchaseOrders(1, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const myPurchases = res.items.filter(p => p.vendorId === vId);
      this.dataSource.data = myPurchases;
      this.totalVolume = myPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}

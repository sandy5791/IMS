import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { CoreDataService } from '../../services/core-data.service';
import { StorageService } from '../../services/storage.service';

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
    private coreData: CoreDataService,
    private storage: StorageService,
    private cdr: ChangeDetectorRef
  ) {
    this.userName = this.storage.getItem<string>('LoggedInUser') || 'Portal Guest';
  }

  ngOnInit(): void {
    this.coreData.vendors$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(vendors => {
      const found = vendors.find(v => v.name.toLowerCase() === this.userName.toLowerCase());
      if (found) {
        this.isVendor = true;
        this.portalTitle = 'Vendor Portal';
        this.portalSubtitle = 'Manage your supplies and invoices';
        this.loadVendorData(found.vendorId);
      } else {
        this.loadCustomerData();
      }
      this.cdr.markForCheck();
    });
  }

  private loadCustomerData(): void {
    this.coreData.customers$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(customers => {
      const found = customers.find(c => c.name.toLowerCase() === this.userName.toLowerCase());
      if (found) {
        this.loyaltyPoints = found.loyaltyPoints;
        this.coreData.sales$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(sales => {
          const mySales = sales.filter(s => s.customerId === found.customerId);
          this.dataSource.data = mySales;
          this.totalVolume = mySales.reduce((sum, s) => sum + s.totalAmount, 0);
          this.cdr.markForCheck();
        });
      }
    });
  }

  private loadVendorData(vId: string): void {
    this.coreData.purchases$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(purchases => {
      const myPurchases = purchases.filter(p => p.vendorId === vId);
      this.dataSource.data = myPurchases;
      this.totalVolume = myPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}

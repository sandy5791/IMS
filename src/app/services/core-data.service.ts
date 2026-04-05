import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer, Vendor, InventoryItem, SaleDetails, PurchaseOrderItem } from '../project/models/model';
import { AuditLogService } from './audit-log.service';
import { StorageService } from './storage.service';

export interface SalesRecord {
  orderId: string;
  customerId: string;
  customerName: string;
  date: string;
  totalAmount: number;
  items: SaleDetails[];
}

export interface PurchaseRecord {
  orderId: string;
  vendorId: string;
  vendorName: string;
  date: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CoreDataService {

  // Initial Seed Data
  private initialCustomers: Customer[] = [
    new Customer({ customerId: 'CUST-001', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0199', address: '123 Business Rd', loyaltyPoints: 150 }),
    new Customer({ customerId: 'CUST-002', name: 'TechFlow Ltd', email: 'billing@techflow.io', phone: '555-8822', address: '404 Valley Way', loyaltyPoints: 40 }),
    new Customer({ customerId: 'CUST-003', name: 'Stellar Solutions', email: 'info@stellar.com', phone: '555-1234', address: '99 Galaxy Dr', loyaltyPoints: 500 }),
    new Customer({ customerId: 'CUST-004', name: 'Nexus Designs', email: 'hi@nexus.net', phone: '555-4321', address: '12 Creative St', loyaltyPoints: 120 }),
    new Customer({ customerId: 'CUST-005', name: 'Global Logistics', email: 'ops@globallog.com', phone: '555-9000', address: '55 Port Way', loyaltyPoints: 340 }),
    new Customer({ customerId: 'CUST-006', name: 'Future Systems', email: 'sales@future.com', phone: '555-1111', address: '1 Tech Blvd', loyaltyPoints: 200 }),
    new Customer({ customerId: 'CUST-007', name: 'Echo Park Ent', email: 'hello@echopark.com', phone: '555-2222', address: '88 Green Gln', loyaltyPoints: 850 }),
    new Customer({ customerId: 'CUST-008', name: 'Zion Industries', email: 'admin@zion.org', phone: '555-3333', address: '7 Iron Range', loyaltyPoints: 15 }),
    new Customer({ customerId: 'CUST-009', name: 'Summit Retail', email: 'support@summit.com', phone: '555-4444', address: '22 Peak Rd', loyaltyPoints: 95 }),
    new Customer({ customerId: 'CUST-010', name: 'Oceanic Group', email: 'main@oceanic.io', phone: '555-5555', address: '10 Shore Ave', loyaltyPoints: 410 }),
    new Customer({ customerId: 'CUST-011', name: 'Liberty Services', email: 'help@liberty.com', phone: '555-6666', address: '1776 Freedom Way', loyaltyPoints: 75 }),
    new Customer({ customerId: 'CUST-012', name: 'Metro Partners', email: 'city@metro.net', phone: '555-7777', address: '500 Downtown Dr', loyaltyPoints: 1100 }),
    new Customer({ customerId: 'CUST-013', name: 'Pioneer Works', email: 'craft@pioneer.com', phone: '555-8888', address: '3 Frontier Rd', loyaltyPoints: 22 }),
    new Customer({ customerId: 'CUST-014', name: 'Velocity Tech', email: 'fast@velocity.com', phone: '555-9999', address: '180 Turbo Lane', loyaltyPoints: 630 }),
    new Customer({ customerId: 'CUST-015', name: 'Apex Mountain', email: 'climb@apex.com', phone: '444-1111', address: '1 Everest St', loyaltyPoints: 50 })
  ];

  private initialVendors: Vendor[] = [
    new Vendor({ vendorId: 'VND-100', name: 'Global Supplies Inc', email: 'sales@globalsup.com', phone: '800-444-2222', address: '400 Industrial Way', rating: 4.8 }),
    new Vendor({ vendorId: 'VND-200', name: 'Prime Manufacturing', email: 'orders@primemfg.com', phone: '800-555-1111', address: '11 Forge St', rating: 4.2 }),
    new Vendor({ vendorId: 'VND-300', name: 'MicroChip Central', email: 'parts@mcchips.com', phone: '555-9090', address: 'Silicon Valley', rating: 4.9 }),
    new Vendor({ vendorId: 'VND-400', name: 'Heavy Metal Foundry', email: 'steel@hmfoundry.com', phone: '555-4040', address: 'Industrial Zone', rating: 3.5 }),
    new Vendor({ vendorId: 'VND-500', name: 'Plastic Pro Co', email: 'info@plasticpro.com', phone: '800-123-4567', address: '42 Resin Ave', rating: 4.0 }),
    new Vendor({ vendorId: 'VND-600', name: 'Logistics Plus', email: 'ship@logiplus.com', phone: '800-999-0000', address: 'Dock 7', rating: 4.5 }),
    new Vendor({ vendorId: 'VND-700', name: 'Office Depot Master', email: 'contract@odm.com', phone: '800-888-7777', address: '99 Paper St', rating: 4.1 }),
    new Vendor({ vendorId: 'VND-800', name: 'Elite Hardware', email: 'pro@elitehw.com', phone: '555-1010', address: '1 Master Pl', rating: 4.7 })
  ];

  private initialInventory: InventoryItem[] = [
    new InventoryItem({ itemId: 'I-001', itemName: 'Widget A', category: 'Hardware', stockQty: 50, reorderLevel: 20, location: 'A1', batchNumber: 'BAT-001', expiryDate: '2027-12-31' }),
    new InventoryItem({ itemId: 'I-002', itemName: 'Component B', category: 'Electronics', stockQty: 15, reorderLevel: 20, location: 'B2', batchNumber: 'BAT-002', expiryDate: '2026-06-15' }),
    new InventoryItem({ itemId: 'I-003', itemName: 'Sensor Module X', category: 'Electronics', stockQty: 100, reorderLevel: 30, location: 'C1', batchNumber: 'BAT-003', expiryDate: '2025-01-01' }),
    new InventoryItem({ itemId: 'I-004', itemName: 'Titanium Bolt 10mm', category: 'Hardware', stockQty: 500, reorderLevel: 100, location: 'A5' }),
    new InventoryItem({ itemId: 'I-005', itemName: 'Circuit Board v2', category: 'Electronics', stockQty: 40, reorderLevel: 50, location: 'B3' }),
    new InventoryItem({ itemId: 'I-006', itemName: 'Power Supply 500W', category: 'Power', stockQty: 25, reorderLevel: 10, location: 'D1' }),
    new InventoryItem({ itemId: 'I-007', itemName: 'Cooling Fan 120mm', category: 'Hardware', stockQty: 80, reorderLevel: 25, location: 'D4' }),
    new InventoryItem({ itemId: 'I-008', itemName: 'LED Panel 4K', category: 'Displays', stockQty: 12, reorderLevel: 5, location: 'E2' }),
    new InventoryItem({ itemId: 'I-009', itemName: 'Logic Controller', category: 'Electronics', stockQty: 5, reorderLevel: 10, location: 'C4' }),
    new InventoryItem({ itemId: 'I-010', itemName: 'Copper Wire 100m', category: 'Hardware', stockQty: 200, reorderLevel: 50, location: 'A2' }),
    new InventoryItem({ itemId: 'I-011', itemName: 'Glass Casing S', category: 'Packaging', stockQty: 30, reorderLevel: 15, location: 'F1' }),
    new InventoryItem({ itemId: 'I-012', itemName: 'Silicon Sealant', category: 'Chemicals', stockQty: 45, reorderLevel: 10, location: 'F5' }),
    new InventoryItem({ itemId: 'I-013', itemName: 'Steel Rod 2m', category: 'Hardware', stockQty: 150, reorderLevel: 40, location: 'A3' }),
    new InventoryItem({ itemId: 'I-014', itemName: 'Thermal Paste', category: 'Electronics', stockQty: 60, reorderLevel: 20, location: 'B4' }),
    new InventoryItem({ itemId: 'I-015', itemName: 'Laser Diode', category: 'Optics', stockQty: 20, reorderLevel: 5, location: 'G1' })
  ];

  // Observables
  private customersSubject = new BehaviorSubject<Customer[]>(this.initialCustomers);
  private vendorsSubject = new BehaviorSubject<Vendor[]>(this.initialVendors);
  private inventorySubject = new BehaviorSubject<InventoryItem[]>(this.initialInventory);
  private salesSubject = new BehaviorSubject<SalesRecord[]>([
    { orderId: 'ORD-501', customerId: 'CUST-001', customerName: 'Acme Corp', date: '2026-03-20', totalAmount: 450.00, items: [] },
    { orderId: 'ORD-502', customerId: 'CUST-003', customerName: 'Stellar Solutions', date: '2026-03-21', totalAmount: 1200.50, items: [] },
    { orderId: 'ORD-503', customerId: 'CUST-007', customerName: 'Echo Park Ent', date: '2026-03-22', totalAmount: 85.00, items: [] },
    { orderId: 'ORD-504', customerId: 'CUST-012', customerName: 'Metro Partners', date: '2026-03-23', totalAmount: 3200.00, items: [] },
    { orderId: 'ORD-505', customerId: 'CUST-005', customerName: 'Global Logistics', date: '2026-03-24', totalAmount: 150.75, items: [] }
  ]);
  private purchasesSubject = new BehaviorSubject<PurchaseRecord[]>([
    { orderId: 'PO-901', vendorId: 'VND-100', vendorName: 'Global Supplies Inc', date: '2026-03-15', totalAmount: 5000, items: [] },
    { orderId: 'PO-902', vendorId: 'VND-300', vendorName: 'MicroChip Central', date: '2026-03-16', totalAmount: 2400, items: [] },
    { orderId: 'PO-903', vendorId: 'VND-200', vendorName: 'Prime Manufacturing', date: '2026-03-18', totalAmount: 800, items: [] },
    { orderId: 'PO-904', vendorId: 'VND-800', vendorName: 'Elite Hardware', date: '2026-03-19', totalAmount: 120, items: [] }
  ]);

  customers$ = this.customersSubject.asObservable();
  vendors$ = this.vendorsSubject.asObservable();
  inventory$ = this.inventorySubject.asObservable();
  sales$ = this.salesSubject.asObservable();
  purchases$ = this.purchasesSubject.asObservable();

  constructor(private auditLog: AuditLogService, private storage: StorageService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const savedCustomers = this.storage.getItem<Customer[]>('ims_customers');
    if (savedCustomers) this.customersSubject.next(savedCustomers);

    const savedVendors = this.storage.getItem<Vendor[]>('ims_vendors');
    if (savedVendors) this.vendorsSubject.next(savedVendors);

    const savedInventory = this.storage.getItem<InventoryItem[]>('ims_inventory');
    if (savedInventory) this.inventorySubject.next(savedInventory);

    const savedSales = this.storage.getItem<SalesRecord[]>('ims_sales');
    if (savedSales) this.salesSubject.next(savedSales);

    const savedPurchases = this.storage.getItem<PurchaseRecord[]>('ims_purchases');
    if (savedPurchases) this.purchasesSubject.next(savedPurchases);
  }

  private persist(): void {
    this.storage.setItem('ims_customers', this.customersSubject.getValue());
    this.storage.setItem('ims_vendors', this.vendorsSubject.getValue());
    this.storage.setItem('ims_inventory', this.inventorySubject.getValue());
    this.storage.setItem('ims_sales', this.salesSubject.getValue());
    this.storage.setItem('ims_purchases', this.purchasesSubject.getValue());
  }

  // Customer Actions
  getCustomers(): Customer[] {
    return this.customersSubject.getValue();
  }
  setCustomers(customers: Customer[]): void {
    this.customersSubject.next(customers);
    this.persist();
  }
  addCustomer(customer: Customer): void {
    this.setCustomers([...this.getCustomers(), customer]);
  }

  // Vendor Actions
  getVendors(): Vendor[] {
    return this.vendorsSubject.getValue();
  }
  setVendors(vendors: Vendor[]): void {
    this.vendorsSubject.next(vendors);
    this.persist();
  }
  addVendor(vendor: Vendor): void {
    this.setVendors([...this.getVendors(), vendor]);
  }

  // Inventory Actions
  getInventory(): InventoryItem[] {
    return this.inventorySubject.getValue();
  }
  setInventory(items: InventoryItem[]): void {
    this.inventorySubject.next(items);
    this.persist();
  }
  addInventoryItem(item: InventoryItem): void {
    this.setInventory([...this.getInventory(), item]);
  }

  /** Public audit logging access — use this instead of accessing auditLog directly. */
  logAudit(action: string, module: string, details: string, severity: 'info' | 'warning' | 'error' = 'info'): void {
    this.auditLog.log(action, module, details, severity);
  }

  // Transaction Helpers that update inventory automatically
  processSale(sale: SalesRecord): void {
    const currentSales = this.salesSubject.getValue();
    this.salesSubject.next([...currentSales, sale]);
    this.persist();

    this.auditLog.log('Create Sale', 'Sales', `Sale ${sale.orderId} processed for ${sale.customerName}. Total: $${sale.totalAmount}`, 'info');

    // Deduct Inventory Stock
    const inventory = [...this.getInventory()];
    sale.items.forEach(soldItem => {
      const itemIndex = inventory.findIndex(inv => inv.itemId === soldItem.itemId);
      if (itemIndex > -1) {
        inventory[itemIndex].stockQty -= soldItem.quantity;
        if (inventory[itemIndex].stockQty < 0) inventory[itemIndex].stockQty = 0;
      }
    });

    // Increment Customer Loyalty (1 point per $10 spent)
    const customers = [...this.getCustomers()];
    const custIndex = customers.findIndex(c => c.customerId === sale.customerId);
    if (custIndex > -1) {
      customers[custIndex].loyaltyPoints += Math.floor(sale.totalAmount / 10);
      this.setCustomers(customers);
    }

    this.setInventory(inventory);
  }

  processPurchase(purchase: PurchaseRecord): void {
    const currentPurchases = this.purchasesSubject.getValue();
    this.purchasesSubject.next([...currentPurchases, purchase]);
    this.persist();

    this.auditLog.log('Create Purchase', 'Purchases', `Purchase ${purchase.orderId} created from ${purchase.vendorName}. Total: $${purchase.totalAmount}`, 'info');

    // Increase Inventory Stock
    const inventory = [...this.getInventory()];
    purchase.items.forEach(purchasedItem => {
      const itemIndex = inventory.findIndex(inv => inv.itemId === purchasedItem.itemId);
      if (itemIndex > -1) {
        inventory[itemIndex].stockQty += purchasedItem.quantity;
      }
    });
    this.setInventory(inventory);
  }
}

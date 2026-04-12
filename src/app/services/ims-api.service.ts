import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { HttpserviceService } from './httpservice.service';

/** Generic API response envelope matching C# ApiResponse<T> */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}

/** Generic paginated result matching C# PagedResult<T> */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Domain Types ──────────────────────────────────────────────
export interface ApiCustomer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  createdAt?: string;
}

export interface ApiVendor {
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  createdAt?: string;
}

export interface ApiInventoryItem {
  itemId: string;
  itemName: string;
  category: string;
  stockQty: number;
  reorderLevel: number;
  location: string;
  batchNumber: string;
  expiryDate?: string;
  unitPrice: number;
  updatedAt?: string;
}

export interface ApiSaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface ApiSalesOrder {
  orderId?: string;
  customerId: string;
  customerName: string;
  contact: string;
  email: string;
  loyaltyPoints?: number;
  orderDate: string;
  paymentMode: string;
  salesPerson?: string;
  discount?: number;
  taxDetails?: string;
  remarks?: string;
  totalAmount: number;
  status?: string;
  createdAt?: string;
  items: ApiSaleItem[];
}

export interface ApiPurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ApiPurchaseOrder {
  orderId?: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  paymentMode?: string;
  remarks?: string;
  totalAmount: number;
  status?: string;
  createdAt?: string;
  items: ApiPurchaseItem[];
}

export interface ApiAuditLog {
  id: number;
  action: string;
  module: string;
  details: string;
  severity: string;
  username: string;
  timestamp: string;
}

export interface DashboardKpi {
  totalRevenue: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  totalInventoryItems: number;
  lowStockCount: number;
  totalCustomers: number;
  totalVendors: number;
  monthlyRevenue: number;
}

/**
 * ImsApiService — centralized gateway to all IMS backend endpoints.
 * Replaces CoreDataService's in-memory mock with real HTTP calls.
 */
@Injectable({ providedIn: 'root' })
export class ImsApiService {

  constructor(private http: HttpserviceService) {}

  private extractData<T>(obs: Observable<ApiResponse<T>>): Observable<T> {
    return obs.pipe(map(r => r.data));
  }

  // ── Auth ────────────────────────────────────────────────────
  login(username: string, password: string): Observable<any> {
    return this.http.post('/auth/login', { username, password });
  }

  getMe(): Observable<any> {
    return this.http.get('/auth/me');
  }

  // ── Customers ───────────────────────────────────────────────
  getCustomers(page = 1, pageSize = 50, search?: string): Observable<PagedResult<ApiCustomer>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiCustomer>>>('/customers', params));
  }

  getCustomer(id: string): Observable<ApiCustomer> {
    return this.extractData(this.http.get<ApiResponse<ApiCustomer>>(`/customers/${id}`));
  }

  createCustomer(customer: Partial<ApiCustomer>): Observable<ApiCustomer> {
    return this.extractData(this.http.post<ApiResponse<ApiCustomer>>('/customers', customer));
  }

  updateCustomer(id: string, customer: Partial<ApiCustomer>): Observable<ApiCustomer> {
    return this.extractData(this.http.put<ApiResponse<ApiCustomer>>(`/customers/${id}`, customer));
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`/customers/${id}`);
  }

  // ── Vendors ─────────────────────────────────────────────────
  getVendors(page = 1, pageSize = 50, search?: string): Observable<PagedResult<ApiVendor>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiVendor>>>('/vendors', params));
  }

  getVendor(id: string): Observable<ApiVendor> {
    return this.extractData(this.http.get<ApiResponse<ApiVendor>>(`/vendors/${id}`));
  }

  createVendor(vendor: Partial<ApiVendor>): Observable<ApiVendor> {
    return this.extractData(this.http.post<ApiResponse<ApiVendor>>('/vendors', vendor));
  }

  updateVendor(id: string, vendor: Partial<ApiVendor>): Observable<ApiVendor> {
    return this.extractData(this.http.put<ApiResponse<ApiVendor>>(`/vendors/${id}`, vendor));
  }

  deleteVendor(id: string): Observable<any> {
    return this.http.delete(`/vendors/${id}`);
  }

  // ── Inventory ────────────────────────────────────────────────
  getInventory(page = 1, pageSize = 50, search?: string, lowStockOnly = false): Observable<PagedResult<ApiInventoryItem>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('lowStockOnly', lowStockOnly);
    if (search) params = params.set('search', search);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiInventoryItem>>>('/inventory', params));
  }

  getInventoryItem(id: string): Observable<ApiInventoryItem> {
    return this.extractData(this.http.get<ApiResponse<ApiInventoryItem>>(`/inventory/${id}`));
  }

  createInventoryItem(item: Partial<ApiInventoryItem>): Observable<ApiInventoryItem> {
    return this.extractData(this.http.post<ApiResponse<ApiInventoryItem>>('/inventory', item));
  }

  updateInventoryItem(id: string, item: Partial<ApiInventoryItem>): Observable<ApiInventoryItem> {
    return this.extractData(this.http.put<ApiResponse<ApiInventoryItem>>(`/inventory/${id}`, item));
  }

  deleteInventoryItem(id: string): Observable<any> {
    return this.http.delete(`/inventory/${id}`);
  }

  adjustStock(id: string, quantity: number, reason: string): Observable<any> {
    return this.http.patch(`/inventory/${id}/adjust`, { quantity, reason });
  }

  // ── Sales Orders ─────────────────────────────────────────────
  getSalesOrders(page = 1, pageSize = 20, search?: string): Observable<PagedResult<ApiSalesOrder>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiSalesOrder>>>('/sales', params));
  }

  getSalesOrder(id: string): Observable<ApiSalesOrder> {
    return this.extractData(this.http.get<ApiResponse<ApiSalesOrder>>(`/sales/${id}`));
  }

  createSalesOrder(order: ApiSalesOrder): Observable<ApiSalesOrder> {
    return this.extractData(this.http.post<ApiResponse<ApiSalesOrder>>('/sales', order));
  }

  deleteSalesOrder(id: string): Observable<any> {
    return this.http.delete(`/sales/${id}`);
  }

  // ── Purchase Orders ──────────────────────────────────────────
  getPurchaseOrders(page = 1, pageSize = 20, search?: string): Observable<PagedResult<ApiPurchaseOrder>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiPurchaseOrder>>>('/purchases', params));
  }

  getPurchaseOrder(id: string): Observable<ApiPurchaseOrder> {
    return this.extractData(this.http.get<ApiResponse<ApiPurchaseOrder>>(`/purchases/${id}`));
  }

  createPurchaseOrder(order: ApiPurchaseOrder): Observable<ApiPurchaseOrder> {
    return this.extractData(this.http.post<ApiResponse<ApiPurchaseOrder>>('/purchases', order));
  }

  deletePurchaseOrder(id: string): Observable<any> {
    return this.http.delete(`/purchases/${id}`);
  }

  // ── Reports ──────────────────────────────────────────────────
  getDashboardKpi(): Observable<DashboardKpi> {
    return this.extractData(this.http.get<ApiResponse<DashboardKpi>>('/reports/dashboard'));
  }

  getSalesSummary(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.extractData(this.http.get<ApiResponse<any>>('/reports/sales-summary', params));
  }

  getPurchaseSummary(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.extractData(this.http.get<ApiResponse<any>>('/reports/purchase-summary', params));
  }

  getInventoryStatus(): Observable<any> {
    return this.extractData(this.http.get<ApiResponse<any>>('/reports/inventory-status'));
  }

  getStockMovement(itemId?: string): Observable<any> {
    let params = new HttpParams();
    if (itemId) params = params.set('itemId', itemId);
    return this.extractData(this.http.get<ApiResponse<any>>('/reports/stock-movement', params));
  }

  // ── Audit Logs ───────────────────────────────────────────────
  getAuditLogs(page = 1, pageSize = 50, module?: string, severity?: string): Observable<PagedResult<ApiAuditLog>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (module) params = params.set('module', module);
    if (severity) params = params.set('severity', severity);
    return this.extractData(this.http.get<ApiResponse<PagedResult<ApiAuditLog>>>('/logs', params));
  }

  createAuditLog(action: string, module: string, details: string, severity = 'info'): Observable<any> {
    return this.http.post('/logs', { action, module, details, severity });
  }
}

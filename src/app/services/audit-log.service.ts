
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private logsSubject = new BehaviorSubject<AuditLog[]>(this.getInitialLogs());
  logs$ = this.logsSubject.asObservable();

  constructor(private storage: StorageService) {}

  private getInitialLogs(): AuditLog[] {
    return [
      { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'sandeep', action: 'Login', module: 'Auth', details: 'User logged in successfully', severity: 'info' },
      { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'admin', action: 'Update Stock', module: 'Inventory', details: 'Item I-001 stock adjusted by +10', severity: 'info' },
      { id: '3', timestamp: new Date(Date.now() - 10800000).toISOString(), user: 'sandeep', action: 'Delete Customer', module: 'Customers', details: 'Customer CUST-015 removed', severity: 'warning' }
    ];
  }

  log(action: string, module: string, details: string, severity: 'info' | 'warning' | 'error' = 'info'): void {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: this.storage.getItem<string>('LoggedInUser') || 'System',
      action,
      module,
      details,
      severity
    };
    const currentLogs = this.logsSubject.getValue();
    this.logsSubject.next([newLog, ...currentLogs]);
  }
}

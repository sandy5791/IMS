import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { AuditLogService, AuditLog } from '../../services/audit-log.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, PageShellComponent, MatTableModule, MatPaginatorModule, MatSortModule, MatChipsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
  animations: [
    fadeInUpOnEnter({ duration: 500 }),
    slideInLeftOnEnter({ duration: 500 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);

  searchText = '';
  selectedModule = 'All';
  displayedColumns: string[] = ['index', 'timestamp', 'user', 'action', 'module', 'details', 'severity'];
  dataSource = new MatTableDataSource<AuditLog>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private auditLogService: AuditLogService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.auditLogService.logs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(logs => {
      this.dataSource.data = logs;
      this.applyFilter();
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  trackByLogId(_index: number, item: AuditLog): string {
    return item.id;
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: AuditLog, filter: string) => {
      const matchesModule = this.selectedModule === 'All' || data.module === this.selectedModule;
      const matchesSearch = !filter ||
                           data.details.toLowerCase().includes(filter) ||
                           data.action.toLowerCase().includes(filter) ||
                           data.user.toLowerCase().includes(filter);
      return matchesModule && matchesSearch;
    };
    this.dataSource.filter = filterValue;
  }

  clearLogs(): void {
    alert('Log clearing functionality disabled for security.');
  }

  exportLogs(): void {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Severity'];
    const rows = this.dataSource.filteredData.map(log => [
      log.timestamp, log.user, log.action, log.module, log.details, log.severity
    ]);
    this.exportService.exportToCsv(headers, rows, `audit_logs_${new Date().toISOString().split('T')[0]}`);
  }
}

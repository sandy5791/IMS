import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { fadeInUpOnEnter, slideInLeftOnEnter } from '@ngverse/motion/animatecss';
import { finalize } from 'rxjs';

import { PageShellComponent } from '../../utilities/page-shell/page-shell.component';
import { ImsApiService, ApiAuditLog } from '../../services/ims-api.service';
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
  selectedSeverity = 'All';
  isLoading = false;

  displayedColumns: string[] = ['index', 'timestamp', 'username', 'action', 'module', 'details', 'severity'];
  dataSource = new MatTableDataSource<ApiAuditLog>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: ImsApiService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadLogs(): void {
    this.isLoading = true;
    const module = this.selectedModule !== 'All' ? this.selectedModule : undefined;
    const severity = this.selectedSeverity !== 'All' ? this.selectedSeverity : undefined;
    this.api.getAuditLogs(1, 200, module, severity)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.isLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: result => {
          this.dataSource.data = result.items;
          this.applyFilter();
          this.cdr.markForCheck();
        }
      });
  }

  trackByLogId(_index: number, item: ApiAuditLog): number {
    return item.id;
  }

  applyFilter(): void {
    const filterValue = this.searchText.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: ApiAuditLog, filter: string) => {
      const matchesModule = this.selectedModule === 'All' || data.module === this.selectedModule;
      const matchesSeverity = this.selectedSeverity === 'All' || data.severity === this.selectedSeverity;
      const matchesSearch = !filter ||
                           data.details.toLowerCase().includes(filter) ||
                           data.action.toLowerCase().includes(filter) ||
                           data.username.toLowerCase().includes(filter);
      return matchesModule && matchesSeverity && matchesSearch;
    };
    this.dataSource.filter = filterValue;
  }

  onModuleChange(): void { this.loadLogs(); }
  onSeverityChange(): void { this.loadLogs(); }

  clearLogs(): void {
    alert('Log clearing is disabled for security. Contact your administrator.');
  }

  exportLogs(): void {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Severity'];
    const rows = this.dataSource.filteredData.map(log => [
      log.timestamp, log.username, log.action, log.module, log.details, log.severity
    ]);
    this.exportService.exportToCsv(headers, rows, `audit_logs_${new Date().toISOString().split('T')[0]}`);
  }
}

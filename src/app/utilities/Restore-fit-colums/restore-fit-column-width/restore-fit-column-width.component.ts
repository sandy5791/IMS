import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GridApi} from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'Menu-dropDown',
  templateUrl: './restore-fit-column-width.component.html',
  styleUrl: './restore-fit-column-width.component.scss',
  imports: [ CommonModule,MatIconModule],
})
export class RestoreFitCustomHeaderComponent implements OnChanges  {
  @Input() gridApi!: GridApi;
  showMenu: any;
  savedState: any;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridApi']) {
      this.gridApi = changes['gridApi'].currentValue
    }
  }
  fitColumns() {
    if (this.gridApi) {
      this.savedState = this.gridApi.getColumnState(); 
      this.gridApi.sizeColumnsToFit();
      this.closeMenu()
    }
  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  restoreColumns() {
    if (this.gridApi) {
      this.gridApi.applyColumnState({ state:this.savedState  });
      this.closeMenu();
    }
  }
  closeMenu()
  {
    this.showMenu = false
  }

  onResize() {
    if (this.gridApi) {
      const allColumnIds = this.gridApi.getAllGridColumns().map(col => col.getId());
      this.gridApi.autoSizeColumns(allColumnIds);
      this.closeMenu();
    }
  }

}
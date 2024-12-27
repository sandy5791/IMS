import { AfterViewInit, Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpserviceService } from '../../services/httpservice.service';
import { HttpParams } from '@angular/common/http';
import { SaleDetails } from '../models/model';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { BackToTopDirective } from '../../utilities/back-to-top.directive';
import { RestoreFitCustomHeaderComponent } from '../../utilities/Restore-fit-colums/restore-fit-column-width/restore-fit-column-width.component';

@Component({
  selector: 'app-sales-order',
  imports: [FormsModule, ReactiveFormsModule, AgGridModule, MatButtonModule, CommonModule, BackToTopDirective, RestoreFitCustomHeaderComponent],
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.scss',
})
export class SalesOrderComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(RestoreFitCustomHeaderComponent) Rest_fitCol!: RestoreFitCustomHeaderComponent;


  SalesOrderForm: FormGroup;
  ngAfterViewInit(): void {
    this.Rest_fitCol.closeMenu();
  }
  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000, year: 2020, color: 'Red', mileage: 15000, engineType: 'V6', transmission: 'Automatic', seats: 5, fuelType: 'Petrol', owner: 'John', registration: '2021', warranty: 'Yes', insurance: 'Yes', doors: 4, torque: 300, horsepower: 250, cylinders: 6, drivetrain: 'FWD', topSpeed: 180 },
    { make: 'Ford', model: 'Mondeo', price: 32000, year: 2019, color: 'Blue', mileage: 18000, engineType: 'V4', transmission: 'Manual', seats: 5, fuelType: 'Diesel', owner: 'Jane', registration: '2020', warranty: 'No', insurance: 'Yes', doors: 4, torque: 280, horsepower: 200, cylinders: 4, drivetrain: 'AWD', topSpeed: 170 },
    { make: 'Porsche', model: 'Boxster', price: 72000, year: 2021, color: 'Black', mileage: 8000, engineType: 'V8', transmission: 'Automatic', seats: 2, fuelType: 'Petrol', owner: 'Alice', registration: '2022', warranty: 'Yes', insurance: 'No', doors: 2, torque: 400, horsepower: 350, cylinders: 8, drivetrain: 'RWD', topSpeed: 220 },
    { make: 'Honda', model: 'Civic', price: 28000, year: 2018, color: 'White', mileage: 20000, engineType: 'V4', transmission: 'Manual', seats: 5, fuelType: 'Petrol', owner: 'Bob', registration: '2019', warranty: 'No', insurance: 'Yes', doors: 4, torque: 250, horsepower: 180, cylinders: 4, drivetrain: 'FWD', topSpeed: 160 },
    { make: 'Hyundai', model: 'Elantra', price: 22000, year: 2020, color: 'Silver', mileage: 12000, engineType: 'V4', transmission: 'Automatic', seats: 5, fuelType: 'Petrol', owner: 'Carol', registration: '2020', warranty: 'Yes', insurance: 'Yes', doors: 4, torque: 260, horsepower: 190, cylinders: 4, drivetrain: 'AWD', topSpeed: 165 },
  ];
  
  

  public columnDefs: ColDef[] = [
    {
      headerName: '#',
      valueGetter: (params: any) => params.node.rowIndex + 1, // Generates row number
      editable: false,
      filter: false,
      sortable: false,
      width: 30, // Adjust column width
      cellStyle: { textAlign: 'right' }, // Align text to the right
      resizable: true,
      suppressHeaderFilterButton: true,

    },
    {
      headerName: 'Make',
      field: 'make',
      filter: 'agTextColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),

    },
    {
      headerName: 'Model',
      field: 'model',
      filter: 'agTextColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),

    },
    {
      headerName: 'Price',
      field: 'price',
      filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),

    },
    {
      headerName: 'Year', field: 'year', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Color', field: 'color', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Mileage', field: 'mileage', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Engine Type', field: 'engineType', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Transmission', field: 'transmission', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Seats', field: 'seats', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, // New column
    {
      headerName: 'Fuel Type', field: 'fuelType', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),
    }, { headerName: 'Owner', field: 'owner', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Registration', field: 'registration', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Warranty', field: 'warranty', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Insurance', field: 'insurance', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Doors', field: 'doors', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Torque', field: 'torque', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Horsepower', field: 'horsepower', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Cylinders', field: 'cylinders', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Drivetrain', field: 'drivetrain', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
    { headerName: 'Top Speed', field: 'topSpeed', filter: 'agNumberColumnFilter',
      editable: true,
      width: 100,
      cellRenderer: this.customCellRenderer.bind(this),},
  ];
  rowHeight = 30;
  gridOptions: GridOptions = {
    rowHeight: 30,
    paginationPageSize: 10,
    suppressRowClickSelection: true,
    domLayout: 'autoHeight', // Automatically adjusts the height of the grid

  };

  isBackToTopVisible: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  constructor(private fb: FormBuilder, private http: HttpserviceService, private router: Router) {

    this.gridOptions = {
      suppressRowClickSelection: true,
      paginationPageSize: 10,
      enableRangeSelection: true
    };
    this.SalesOrderForm = this.fb.group({
      Name: ['', [Validators.required]], //
      contact: [''], //
      email: [''], //
      loyaltyNo: [''], //
      OrderDate: [''],
      paymentMode: [''],
      SalePerson: [localStorage.getItem('User')],
      discount: [''],
      taxDetails: [''],
      Remarks: [''],
    });
  }
  sales = new SaleDetails;
  salesDtlArr: SaleDetails[] = []
  ngOnInit(): void {
    this.salesDtlArr.push(this.sales)
  }

  ngOnDestroy(): void {

  }

  @HostListener('document:keypress', ['$event'])
  handleScannerInput(event: KeyboardEvent) {
    const scannedValue = event.key;
    if (scannedValue) {
      //this.getItemDetails(scannedValue); // Call API to fetch item details
    }
  }

  getItemDetails(barCode: any) {
    let url = '';
    let queryParams = new HttpParams()
    queryParams = queryParams.append('BarCode', barCode)
    this.http.get(url, queryParams).subscribe((response => {
      if (response) {
        this.AddtoSalesItem(response)
      }
    }
    ))
  }

  AddtoSalesItem(ItemDtls: any) {
    let sales = new SaleDetails()
    this.salesDtlArr.push(sales)

  }
  removeOrder(index: number): void {
    this.salesDtlArr.splice(index, 1); // Remove order by index
  }
  addRow() {
  }
  editRow() {

  }
  deleteRow() {

  }
  onGridReady(event: any) {
    this.gridApi = event.api;
    this.gridColumnApi= event.columnApi

  }

  // Function to reset column state
  resetColumnState() {
    if (this.gridColumnApi) {
      this.gridColumnApi.resetColumnState(); // Resets column sizes, visibility, and order
    }
  }
  goBack() {
    // Navigate back or implement your logic to go back to the previous page
    this.router.navigate(['/previous-page']);
  }
  submitForm() {
    if (this.SalesOrderForm.valid) {
      // Handle form submission logic here
      console.log(this.SalesOrderForm.value);
    }
  }
  onBackToTopVisibility(isVisible: any): void {
    this.isBackToTopVisible = isVisible;
    console.log('Back-to-Top button is visible:', isVisible);
  }
  customCellRenderer(params: any) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = params.value || '';
    input.addEventListener('blur', () => this.onBlurEvent(params, input.value));
    return input;
  }

  // Blur event handler
  onBlurEvent(params: any, newValue: string) {
    console.log('Blurred Cell:', params);
    console.log('New Value:', newValue);
    params.node.setDataValue(params.colDef.field, newValue); // Update cell value
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.custom-header')) {
      this.closeDropdown();
    }
  }
  closeDropdown(): void {
    this.Rest_fitCol.closeMenu(); // Calls closeMenu method of child component
  }
}

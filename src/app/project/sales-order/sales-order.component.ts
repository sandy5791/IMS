import { Component, HostListener, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpserviceService } from '../../services/httpservice.service';
import { HttpParams } from '@angular/common/http';
import { SaleDetails } from '../models/model';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef ,GridOptions } from 'ag-grid-community';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { BackToTopDirective } from '../../utilities/back-to-top.directive';

@Component({
  selector: 'app-sales-order',
  imports: [FormsModule, ReactiveFormsModule,AgGridModule,MatButtonModule,CommonModule,BackToTopDirective ],
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.scss',
})
export class SalesOrderComponent implements OnInit, OnDestroy {
  SalesOrderForm: FormGroup;
  rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
  ];

  columnDefs : ColDef[]  = [
    { headerName: 'Make', field: 'make',  filter: 'agTextColumnFilter',},
    { headerName: 'Model', field: 'model' ,  filter: 'agTextColumnFilter',},
    { headerName: 'Price', field: 'price' ,  filter: 'agNumberColumnFilter',}
  ];
  gridOptions: GridOptions ={
    paginationPageSize: 10,
    suppressRowClickSelection: true,
    domLayout: 'autoHeight', // Automatically adjusts the height of the grid
  };
  isBackToTopVisible: boolean = false;
  gridApi: any;
  gridColumnApi: any;
  constructor(private fb: FormBuilder, private http: HttpserviceService , private router :Router) {
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
      this.getItemDetails(scannedValue); // Call API to fetch item details
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
  addRow()
  {
  }
  editRow()
  {

  }
  deleteRow()
  {

  }
  onGridReady(event:any) {
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit(); // Adjust column width on grid ready
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

}

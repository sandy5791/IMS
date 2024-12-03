import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpserviceService } from '../../services/httpservice.service';
import { HttpParams } from '@angular/common/http';
import { SaleDetails } from '../models/model';

@Component({
  selector: 'app-sales-order',
  imports: [FormsModule],
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.scss'
})
export class SalesOrderComponent implements OnInit, OnDestroy {
  SalesOrderForm: FormGroup;

  constructor(private fb: FormBuilder,private http :HttpserviceService) {
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
   sales = inject(SaleDetails);
   salesDtlArr :SaleDetails[] = []
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

  getItemDetails(barCode:any) {
    let url = '';
    let queryParams = new HttpParams()
    queryParams = queryParams.append('BarCode',barCode)
    this.http.get(url,queryParams).subscribe((response=>
    {
      if(response)
      {
        this.AddtoSalesItem(response)
      }
    }
    ))
  }

  AddtoSalesItem(ItemDtls:any)
  {
    let sales = new SaleDetails()
    this.salesDtlArr.push(sales)

  }
  removeOrder(index: number): void {
    this.salesDtlArr.splice(index, 1); // Remove order by index
  }
}

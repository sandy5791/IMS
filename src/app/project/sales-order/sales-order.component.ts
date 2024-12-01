import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-sales-order',
  imports: [],
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.scss'
})
export class SalesOrderComponent implements OnInit , OnDestroy {
constructor()
{
  console.log('Sales order activated')
}
  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    
  }
}

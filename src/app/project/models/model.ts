
export class SaleDetails{
  
    itemId: string ='';
    itemName: string ='';
    quantity: number =1 ;
    price: number=1;
    discount: number=0;
    total: number=1;

    constructor(init?: Partial<SaleDetails>) {
        Object.assign(this, init); // Allows partial updates
      }
}
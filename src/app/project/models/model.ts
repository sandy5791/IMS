export class SaleDetails {
    itemId: string = '';
    itemName: string = '';
    quantity: number = 1;
    price: number = 1;
    discount: number = 0;
    total: number = 1;

    constructor(init?: Partial<SaleDetails>) {
        Object.assign(this, init);
    }
}

export class PurchaseOrderItem {
    itemId: string = '';
    itemName: string = '';
    quantity: number = 1;
    unitPrice: number = 0;
    total: number = 0;

    constructor(init?: Partial<PurchaseOrderItem>) {
        Object.assign(this, init);
    }
}

export class InventoryItem {
    itemId: string = '';
    itemName: string = '';
    category: string = '';
    stockQty: number = 0;
    reorderLevel: number = 0;
    location: string = '';
    batchNumber: string = '';
    expiryDate: string = '';

    constructor(init?: Partial<InventoryItem>) {
        Object.assign(this, init);
    }
}

export class Customer {
    customerId: string = '';
    name: string = '';
    email: string = '';
    phone: string = '';
    address: string = '';
    loyaltyPoints: number = 0;

    constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}

export class Vendor {
    vendorId: string = '';
    name: string = '';
    email: string = '';
    phone: string = '';
    address: string = '';
    rating: number = 0;

    constructor(init?: Partial<Vendor>) {
        Object.assign(this, init);
    }
}

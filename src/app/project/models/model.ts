export class SaleDetails {
    itemId = '';
    itemName = '';
    quantity = 1;
    price = 1;
    discount = 0;
    total = 1;

    constructor(init?: Partial<SaleDetails>) {
        Object.assign(this, init);
    }
}

export class PurchaseOrderItem {
    itemId = '';
    itemName = '';
    quantity = 1;
    unitPrice = 0;
    total = 0;

    constructor(init?: Partial<PurchaseOrderItem>) {
        Object.assign(this, init);
    }
}

export class InventoryItem {
    itemId = '';
    itemName = '';
    category = '';
    stockQty = 0;
    reorderLevel = 0;
    location = '';
    batchNumber = '';
    expiryDate = '';

    constructor(init?: Partial<InventoryItem>) {
        Object.assign(this, init);
    }
}

export class Customer {
    customerId = '';
    name = '';
    email = '';
    phone = '';
    address = '';
    loyaltyPoints = 0;

    constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}

export class Vendor {
    vendorId = '';
    name = '';
    email = '';
    phone = '';
    address = '';
    rating = 0;

    constructor(init?: Partial<Vendor>) {
        Object.assign(this, init);
    }
}

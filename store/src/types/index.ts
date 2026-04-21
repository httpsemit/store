export type Category = {
    id: string;
    name: string;
    description: string;
    color: string;
};

export type Product = {
    id: string;
    barcode: string;
    name: string;
    description: string;
    categoryId: string;
    price: number;
    wholesalePrice?: number;
    costPrice: number;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    createdAt: string;
    updatedAt: string;
};

export type SaleItem = {
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

export type Sale = {
    id: string;
    billNo?: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'Cash' | 'UPI' | 'Credit';
    saleType: 'retail' | 'wholesale';
    customerName?: string;
    customerId?: string;
    createdAt: string;
};

export type Customer = {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customerType: 'retail' | 'wholesale';
    creditBalance: number;
    createdAt: string;
};

export interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    customerId: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI';
    date: string;
    createdAt: string;
}

export type StockIntake = {
    id: string;
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    costPrice: number;
    supplier?: string;
    createdAt: string;
};

export type Alert = {
    id: string;
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    currentStock: number;
    threshold: number;
    severity: 'critical' | 'warning';
};

export type UserRole = 'Owner' | 'Staff';

export type User = {
    id: string;
    username: string;
    name: string;
    role: UserRole;
};

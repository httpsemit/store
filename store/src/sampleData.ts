import type { Category, Product, User } from './types';

export const SAMPLE_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Grocery', description: 'Daily essentials', lowStockThreshold: 10, color: '#4f46e5' },
    { id: 'cat-2', name: 'Beverages', description: 'Drinks and juices', lowStockThreshold: 15, color: '#06b6d4' },
    { id: 'cat-3', name: 'Snacks', description: 'Packaged foods', lowStockThreshold: 20, color: '#f59e0b' },
    { id: 'cat-4', name: 'Personal Care', description: 'Hygiene products', lowStockThreshold: 5, color: '#ec4899' },
    { id: 'cat-5', name: 'Dairy', description: 'Milk and cheese', lowStockThreshold: 8, color: '#10b981' },
    { id: 'cat-6', name: 'Stationery', description: 'Office supplies', lowStockThreshold: 5, color: '#8b5cf6' },
];

const now = new Date().toISOString();

export const SAMPLE_PRODUCTS: Product[] = [
    { id: 'p1', barcode: '8901030624021', name: 'Pepsodent 2in1', description: 'Toothpaste 150g', categoryId: 'cat-4', price: 105, costPrice: 85, quantity: 4, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p2', barcode: '8901234567890', name: 'Amul Butter', description: 'Salted 100g', categoryId: 'cat-5', price: 58, costPrice: 50, quantity: 15, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p3', barcode: '8901058000104', name: 'Britannia Marie Gold', description: 'Biscuits 250g', categoryId: 'cat-3', price: 30, costPrice: 24, quantity: 3, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p4', barcode: '8901491101831', name: 'Tata Salt', description: 'Iodized 1kg', categoryId: 'cat-1', price: 28, costPrice: 22, quantity: 50, unit: 'kg', createdAt: now, updatedAt: now },
    { id: 'p5', barcode: '8901764123456', name: 'Maggi Noodles', description: 'Masala 70g', categoryId: 'cat-3', price: 14, costPrice: 11, quantity: 42, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p6', barcode: '8901030554123', name: 'Lux Rose & Vitamin E', description: 'Soap 100g', categoryId: 'cat-4', price: 35, costPrice: 28, quantity: 2, unit: 'pcs', createdAt: now, updatedAt: now },
    // 20 New Demo Products
    { id: 'p7', barcode: '8901764012217', name: 'Coca Cola', description: 'Cold Drink 500ml', categoryId: 'cat-2', price: 40, costPrice: 32, quantity: 24, unit: 'bottle', createdAt: now, updatedAt: now },
    { id: 'p8', barcode: '8901764012224', name: 'Pepsi', description: 'Cold Drink 500ml', categoryId: 'cat-2', price: 40, costPrice: 32, quantity: 20, unit: 'bottle', createdAt: now, updatedAt: now },
    { id: 'p9', barcode: '8901063013214', name: 'Lay\'s Magic Masala', description: 'Potato Chips 50g', categoryId: 'cat-3', price: 20, costPrice: 16, quantity: 60, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p10', barcode: '8901063030211', name: 'Kurkure Masala Munch', description: 'Corn Sticks 90g', categoryId: 'cat-3', price: 20, costPrice: 16, quantity: 45, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p11', barcode: '8901030623123', name: 'Dove Cream Bar', description: 'Beauty Soap 75g', categoryId: 'cat-4', price: 65, costPrice: 52, quantity: 18, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p12', barcode: '8901314345123', name: 'Colgate Strong Teeth', description: 'Toothpaste 200g', categoryId: 'cat-4', price: 98, costPrice: 78, quantity: 12, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p13', barcode: '8906004621023', name: 'Gold Winner Oil', description: 'Sunflower Oil 1L', categoryId: 'cat-1', price: 145, costPrice: 130, quantity: 30, unit: 'ltr', createdAt: now, updatedAt: now },
    { id: 'p14', barcode: '8901725123124', name: 'Ashirvaad Atta', description: 'Whole Wheat Flour 5kg', categoryId: 'cat-1', price: 245, costPrice: 220, quantity: 25, unit: 'kg', createdAt: now, updatedAt: now },
    { id: 'p15', barcode: '8901234560001', name: 'Amul Taaza Milk', description: 'Toned Milk 500ml', categoryId: 'cat-5', price: 27, costPrice: 24, quantity: 40, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p16', barcode: '8901262123456', name: 'Mother Dairy Paneer', description: 'Fresh Paneer 200g', categoryId: 'cat-5', price: 85, costPrice: 70, quantity: 15, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p17', barcode: '8901262123457', name: 'Classmate Notebook', description: 'A4 Size 172 Pages', categoryId: 'cat-6', price: 65, costPrice: 50, quantity: 50, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p18', barcode: '8901262123458', name: 'Reynolds 045 Fine', description: 'Blue Ball Pen', categoryId: 'cat-6', price: 10, costPrice: 7, quantity: 100, unit: 'pcs', createdAt: now, updatedAt: now },
    { id: 'p19', barcode: '8901764012231', name: 'Thums Up', description: 'Cold Drink 2L', categoryId: 'cat-2', price: 95, costPrice: 80, quantity: 12, unit: 'bottle', createdAt: now, updatedAt: now },
    { id: 'p20', barcode: '8901063013221', name: 'Bingo Mad Angles', description: 'Achaari Masti 50g', categoryId: 'cat-3', price: 20, costPrice: 16, quantity: 35, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p21', barcode: '8901030623145', name: 'Dettol Handwash', description: 'Original 200ml Refill', categoryId: 'cat-4', price: 55, costPrice: 45, quantity: 20, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p22', barcode: '8906004621054', name: 'Saffola Gold Oil', description: 'Pro Healthy Blend 1L', categoryId: 'cat-1', price: 165, costPrice: 145, quantity: 15, unit: 'ltr', createdAt: now, updatedAt: now },
    { id: 'p23', barcode: '7622201123456', name: 'Oreo Biscuits', description: 'Chocolate 120g', categoryId: 'cat-3', price: 35, costPrice: 28, quantity: 40, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p24', barcode: '8901058123123', name: 'Nescafe Coffee', description: 'Classic 50g Jar', categoryId: 'cat-2', price: 165, costPrice: 140, quantity: 10, unit: 'jar', createdAt: now, updatedAt: now },
    { id: 'p25', barcode: '8901030123123', name: 'Brooke Bond Red Label', description: 'Tea Powder 250g', categoryId: 'cat-2', price: 125, costPrice: 105, quantity: 15, unit: 'pkt', createdAt: now, updatedAt: now },
    { id: 'p26', barcode: '8901030345123', name: 'Surf Excel Easy Wash', description: 'Detergent 1kg', categoryId: 'cat-1', price: 145, costPrice: 125, quantity: 10, unit: 'pkt', createdAt: now, updatedAt: now },
];

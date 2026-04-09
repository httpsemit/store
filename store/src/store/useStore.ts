import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Category, Product, Sale, StockIntake, User, Alert, Customer, Expense, Payment } from '../types';

interface StoreState {
    currentUser: User | null;
    categories: Category[];
    products: Product[];
    sales: Sale[];
    customers: Customer[];
    expenses: Expense[];
    stockIntakes: StockIntake[];
    isLoading: boolean;
    error: string | null;
    language: 'english' | 'hindi' | 'hinglish';
    toastMessage: { type: 'success' | 'error'; text: string } | null;

    // Auth
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    initAuth: () => Promise<void>;

    // Data fetching
    fetchInitialData: () => Promise<void>;
    fetchSalesForDate: (date: string) => Promise<Sale[]>;
    fetchSalesForPeriod: (period: 'daily' | 'weekly' | 'monthly') => Promise<Sale[]>;
    fetchExpensesForPeriod: (period: 'daily' | 'weekly' | 'monthly') => Promise<Expense[]>;

    // Products
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    // Categories
    addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    // Sales
    addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;

    // Customers
    addCustomer: (customer: Omit<Customer, 'id' | 'creditBalance' | 'createdAt'>) => Promise<Customer | null>;
    updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
    addRepayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
    fetchCustomerHistory: (customerId: string) => Promise<{ sales: Sale[], payments: Payment[] }>;

    // Expenses
    addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
    fetchExpensesForDate: (date: string) => Promise<Expense[]>;

    // Stock Intake
    addStockIntake: (intake: Omit<StockIntake, 'id' | 'createdAt'>) => Promise<void>;

    // Computed
    getLowStockAlerts: () => Alert[];
    getTodayStats: () => {
        totalRevenue: number;
        totalProfit: number;
        totalCredit: number;
        transactionsCount: number;
        itemsSoldCount: number;
    };
    getTopSellingItems: (sales: Sale[]) => { productId: string; productName: string; totalQty: number; unitPrice: number; revenue: number; profit: number }[];

    // Localization
    setLanguage: (lang: 'english' | 'hindi' | 'hinglish') => void;

    // Toast
    showToast: (type: 'success' | 'error', text: string) => void;
    clearToast: () => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            categories: [],
            products: [],
            sales: [],
            customers: [],
            expenses: [],
            stockIntakes: [],
            isLoading: false,
            error: null,
            language: 'english',
            toastMessage: null,

            showToast: (type, text) => {
                set({ toastMessage: { type, text } });
                setTimeout(() => set({ toastMessage: null }), 3500);
            },

            clearToast: () => set({ toastMessage: null }),

            // ========================================
            // LOCALIZATION
            // ========================================
            setLanguage: (lang) => {
                import('../i18n').then(module => {
                    module.default.changeLanguage(lang);
                });
                set({ language: lang });
            },

            // ========================================
            // AUTH
            // ========================================
            initAuth: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        set({
                            currentUser: {
                                id: profile.id,
                                username: profile.username,
                                name: profile.name,
                                role: profile.role as 'Owner' | 'Staff',
                            }
                        });
                    }
                }
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error || !data.user) {
                    set({ isLoading: false, error: error?.message || 'Login failed' });
                    return false;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profile) {
                    set({
                        currentUser: {
                            id: profile.id,
                            username: profile.username,
                            name: profile.name,
                            role: profile.role as 'Owner' | 'Staff',
                        },
                        isLoading: false
                    });
                    return true;
                }

                set({ isLoading: false, error: 'Profile not found' });
                return false;
            },

            logout: async () => {
                await supabase.auth.signOut();
                set({ currentUser: null, sales: [], stockIntakes: [] });
            },

            // ========================================
            // DATA FETCHING
            // ========================================
            fetchInitialData: async () => {
                set({ isLoading: true });

                const [categoriesRes, productsRes, salesRes, customersRes, expensesRes] = await Promise.all([
                    supabase.from('categories').select('*').order('name'),
                    supabase.from('products').select('*').order('name'),
                    supabase.from('sales').select(`
                        *,
                        sale_items (*)
                    `).gte('created_at', new Date().toISOString().split('T')[0]).order('created_at', { ascending: false }),
                    supabase.from('customers').select('*').order('name'),
                    supabase.from('expenses').select('*').gte('date', new Date().toISOString().split('T')[0]).order('created_at', { ascending: false }),
                ]);

                const categories: Category[] = (categoriesRes.data || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description || '',
                    lowStockThreshold: c.low_stock_threshold,
                    color: c.color,
                }));

                const products: Product[] = (productsRes.data || []).map(p => ({
                    id: p.id,
                    barcode: p.barcode,
                    name: p.name,
                    description: p.description || '',
                    categoryId: p.category_id,
                    price: Number(p.price),
                    costPrice: Number(p.cost_price),
                    quantity: p.quantity,
                    unit: p.unit,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                }));

                const sales: Sale[] = (salesRes.data || []).map(s => ({
                    id: s.id,
                    subtotal: Number(s.subtotal),
                    discount: Number(s.discount),
                    total: Number(s.total),
                    paymentMethod: s.payment_method as Sale['paymentMethod'],
                    customerName: s.customer_name || undefined,
                    createdAt: s.created_at,
                    items: (s.sale_items || []).map((si: any) => ({
                        productId: si.product_id,
                        productName: si.product_name,
                        barcode: si.barcode,
                        quantity: si.quantity,
                        unitPrice: Number(si.unit_price),
                        total: Number(si.total),
                    })),
                }));

                const customers: Customer[] = (customersRes.data || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    email: c.email || '',
                    creditBalance: Number(c.credit_balance),
                    createdAt: c.created_at,
                }));

                const expenses: Expense[] = (expensesRes.data || []).map(e => ({
                    id: e.id,
                    amount: Number(e.amount),
                    category: e.category,
                    description: e.description || '',
                    date: e.date,
                    createdAt: e.created_at,
                }));

                set({ categories, products, sales, customers, expenses, isLoading: false });
            },

            fetchSalesForDate: async (date: string) => {
                const startOfDay = `${date}T00:00:00`;
                const endOfDay = `${date}T23:59:59`;

                const { data } = await supabase
                    .from('sales')
                    .select(`*, sale_items (*)`)
                    .gte('created_at', startOfDay)
                    .lte('created_at', endOfDay)
                    .order('created_at', { ascending: false });

                const sales: Sale[] = (data || []).map(s => ({
                    id: s.id,
                    subtotal: Number(s.subtotal),
                    discount: Number(s.discount),
                    total: Number(s.total),
                    paymentMethod: s.payment_method as Sale['paymentMethod'],
                    customerName: s.customer_name || undefined,
                    createdAt: s.created_at,
                    items: (s.sale_items || []).map((si: any) => ({
                        productId: si.product_id,
                        productName: si.product_name,
                        barcode: si.barcode,
                        quantity: si.quantity,
                        unitPrice: Number(si.unit_price),
                        total: Number(si.total),
                    })),
                }));

                return sales;
            },

            fetchSalesForPeriod: async (period) => {
                let startDate = new Date();
                if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
                if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
                
                const startStr = startDate.toISOString().split('T')[0] + 'T00:00:00';

                const { data } = await supabase
                    .from('sales')
                    .select(`*, sale_items (*)`)
                    .gte('created_at', startStr)
                    .order('created_at', { ascending: false });

                const sales: Sale[] = (data || []).map(s => ({
                    id: s.id,
                    billNo: s.bill_no,
                    subtotal: Number(s.subtotal),
                    discount: Number(s.discount),
                    total: Number(s.total),
                    paymentMethod: s.payment_method as any,
                    customerName: s.customer_name || undefined,
                    createdAt: s.created_at,
                    items: (s.sale_items || []).map((si: any) => ({
                        productName: si.product_name,
                        quantity: si.quantity,
                        unitPrice: Number(si.unit_price),
                        total: Number(si.total),
                    })),
                }));

                return sales;
            },

            fetchExpensesForPeriod: async (period) => {
                let startDate = new Date();
                if (period === 'weekly') startDate.setDate(startDate.getDate() - 7);
                if (period === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
                
                const startStr = startDate.toISOString().split('T')[0];

                const { data } = await supabase
                    .from('expenses')
                    .select('*')
                    .gte('date', startStr)
                    .order('date', { ascending: false });

                return (data || []).map(e => ({
                    id: e.id,
                    amount: Number(e.amount),
                    category: e.category,
                    description: e.description || '',
                    date: e.date,
                    createdAt: e.created_at,
                }));
            },

            // ========================================
            // PRODUCTS
            // ========================================
            addProduct: async (product) => {
                const { data, error } = await supabase.from('products').insert({
                    barcode: product.barcode,
                    name: product.name,
                    description: product.description,
                    category_id: product.categoryId,
                    price: product.price,
                    cost_price: product.costPrice,
                    quantity: product.quantity,
                    unit: product.unit,
                }).select().single();

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                const newProduct: Product = {
                    id: data.id,
                    barcode: data.barcode,
                    name: data.name,
                    description: data.description || '',
                    categoryId: data.category_id,
                    price: Number(data.price),
                    costPrice: Number(data.cost_price),
                    quantity: data.quantity,
                    unit: data.unit,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                };

                set(state => ({ products: [...state.products, newProduct] }));
                get().showToast('success', `${newProduct.name} added successfully`);
            },

            updateProduct: async (id, updates) => {
                const dbUpdates: any = {};
                if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
                if (updates.price !== undefined) dbUpdates.price = updates.price;
                if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
                if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
                if (updates.unit !== undefined) dbUpdates.unit = updates.unit;

                const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                set(state => ({
                    products: state.products.map(p =>
                        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                    )
                }));
                get().showToast('success', 'Product updated');
            },

            deleteProduct: async (id) => {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) {
                    get().showToast('error', error.message);
                    return;
                }
                set(state => ({ products: state.products.filter(p => p.id !== id) }));
                get().showToast('success', 'Product deleted');
            },

            // ========================================
            // CATEGORIES
            // ========================================
            addCategory: async (category) => {
                const { data, error } = await supabase.from('categories').insert({
                    name: category.name,
                    description: category.description,
                    low_stock_threshold: category.lowStockThreshold,
                    color: category.color,
                }).select().single();

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                const newCategory: Category = {
                    id: data.id,
                    name: data.name,
                    description: data.description || '',
                    lowStockThreshold: data.low_stock_threshold,
                    color: data.color,
                };

                set(state => ({ categories: [...state.categories, newCategory] }));
                get().showToast('success', `Category "${newCategory.name}" created`);
            },

            updateCategory: async (id, updates) => {
                const dbUpdates: any = {};
                if (updates.name !== undefined) dbUpdates.name = updates.name;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
                if (updates.color !== undefined) dbUpdates.color = updates.color;

                const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                set(state => ({
                    categories: state.categories.map(c =>
                        c.id === id ? { ...c, ...updates } : c
                    )
                }));
                get().showToast('success', 'Category updated');
            },

            deleteCategory: async (id) => {
                const { error } = await supabase.from('categories').delete().eq('id', id);
                if (error) {
                    get().showToast('error', error.message.includes('violates foreign key') ? 'Cannot delete: category has products' : error.message);
                    return;
                }
                set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
                get().showToast('success', 'Category deleted');
            },

            // ========================================
            // SALES
            // ========================================
            addSale: async (saleData) => {
                const items = saleData.items.map(item => ({
                    product_id: item.productId,
                    product_name: item.productName,
                    barcode: item.barcode,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total: item.total,
                }));

                const { data, error } = await supabase.rpc('complete_sale', {
                    p_items: items,
                    p_subtotal: saleData.subtotal,
                    p_discount: saleData.discount,
                    p_total: saleData.total,
                    p_payment_method: saleData.paymentMethod,
                    p_customer_name: saleData.customerName || null,
                    p_customer_id: saleData.customerId || null,
                });

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                // Re-fetch products and customers for updated stock/balances
                const [{ data: freshProducts }, { data: freshCustomers }] = await Promise.all([
                    supabase.from('products').select('*').order('name'),
                    supabase.from('customers').select('*').order('name')
                ]);

                const products: Product[] = (freshProducts || []).map(p => ({
                    id: p.id,
                    barcode: p.barcode,
                    name: p.name,
                    description: p.description || '',
                    categoryId: p.category_id,
                    price: Number(p.price),
                    costPrice: Number(p.cost_price),
                    quantity: p.quantity,
                    unit: p.unit,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                }));

                const customers: Customer[] = (freshCustomers || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    email: c.email || '',
                    creditBalance: Number(c.credit_balance),
                    createdAt: c.created_at,
                }));

                const newSale: Sale = {
                    id: data as string,
                    items: saleData.items,
                    subtotal: saleData.subtotal,
                    discount: saleData.discount,
                    total: saleData.total,
                    paymentMethod: saleData.paymentMethod as any,
                    customerName: saleData.customerName,
                    customerId: saleData.customerId,
                    createdAt: new Date().toISOString(),
                };

                set(state => ({
                    products,
                    customers,
                    sales: [newSale, ...state.sales],
                }));

                get().showToast('success', `Sale completed — ₹${saleData.total.toLocaleString('en-IN')}`);
            },

            // ========================================
            // STOCK INTAKE
            // ========================================
            addStockIntake: async (intakeData) => {
                const { error } = await supabase.rpc('add_stock_intake', {
                    p_product_id: intakeData.productId,
                    p_product_name: intakeData.productName,
                    p_barcode: intakeData.barcode,
                    p_quantity: intakeData.quantity,
                    p_cost_price: intakeData.costPrice,
                    p_supplier: intakeData.supplier || null,
                });

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                // Update local product quantity
                set(state => ({
                    products: state.products.map(p =>
                        p.id === intakeData.productId
                            ? { ...p, quantity: p.quantity + intakeData.quantity, costPrice: intakeData.costPrice, updatedAt: new Date().toISOString() }
                            : p
                    )
                }));
            },

            // ========================================
            // CUSTOMERS
            // ========================================
            addCustomer: async (customerData) => {
                const { data, error } = await supabase.from('customers').insert({
                    name: customerData.name,
                    phone: customerData.phone,
                    email: customerData.email,
                }).select().single();

                if (error) {
                    get().showToast('error', error.message);
                    return null;
                }

                const newCustomer: Customer = {
                    id: data.id,
                    name: data.name,
                    phone: data.phone || '',
                    email: data.email || '',
                    creditBalance: Number(data.credit_balance),
                    createdAt: data.created_at,
                };

                set(state => ({ customers: [...state.customers, newCustomer] }));
                get().showToast('success', `Customer "${newCustomer.name}" added`);
                return newCustomer;
            },

            updateCustomer: async (id, updates) => {
                const { error } = await supabase.from('customers').update({
                    name: updates.name,
                    phone: updates.phone,
                    email: updates.email,
                }).eq('id', id);

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                set(state => ({
                    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
                }));
            },

            addRepayment: async (paymentData) => {
                const { error } = await supabase.from('customer_payments').insert({
                    customer_id: paymentData.customerId,
                    amount: paymentData.amount,
                    payment_method: paymentData.paymentMethod,
                    recorded_by: get().currentUser?.id,
                    date: paymentData.date,
                });

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                // Update customer balance locally
                set(state => ({
                    customers: state.customers.map(c => 
                        c.id === paymentData.customerId 
                            ? { ...c, creditBalance: c.creditBalance - paymentData.amount }
                            : c
                    )
                }));
                get().showToast('success', 'Repayment recorded successfully');
            },

            fetchCustomerHistory: async (customerId) => {
                const [salesRes, paymentsRes] = await Promise.all([
                    supabase.from('sales').select('*, sale_items(*)').eq('customer_id', customerId).order('created_at', { ascending: false }),
                    supabase.from('customer_payments').select('*').eq('customer_id', customerId).order('created_at', { ascending: false })
                ]);

                const sales: Sale[] = (salesRes.data || []).map(s => ({
                    id: s.id,
                    billNo: s.bill_no,
                    subtotal: Number(s.subtotal),
                    discount: Number(s.discount),
                    total: Number(s.total),
                    paymentMethod: s.payment_method as any,
                    customerName: s.customer_name,
                    createdAt: s.created_at,
                    items: (s.sale_items || []).map((si: any) => ({
                        productName: si.product_name,
                        quantity: si.quantity,
                        unitPrice: Number(si.unit_price),
                        total: Number(si.total),
                    }))
                }));

                const payments: Payment[] = (paymentsRes.data || []).map(p => ({
                    id: p.id,
                    customerId: p.customer_id,
                    amount: Number(p.amount),
                    paymentMethod: p.payment_method as any,
                    date: p.date,
                    createdAt: p.created_at
                }));

                return { sales, payments };
            },

            // ========================================
            // EXPENSES
            // ========================================
            addExpense: async (expenseData) => {
                const { data, error } = await supabase.from('expenses').insert({
                    amount: expenseData.amount,
                    category: expenseData.category,
                    description: expenseData.description,
                    date: expenseData.date,
                }).select().single();

                if (error) {
                    get().showToast('error', error.message);
                    return;
                }

                const newExpense: Expense = {
                    id: data.id,
                    amount: Number(data.amount),
                    category: data.category,
                    description: data.description || '',
                    date: data.date,
                    createdAt: data.created_at,
                };

                set(state => ({ expenses: [newExpense, ...state.expenses] }));
                get().showToast('success', `Expense of ₹${newExpense.amount} recorded`);
            },

            fetchExpensesForDate: async (date) => {
                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('date', date)
                    .order('created_at', { ascending: false });

                if (error) {
                    get().showToast('error', error.message);
                    return [];
                }

                return (data || []).map(e => ({
                    id: e.id,
                    amount: Number(e.amount),
                    category: e.category,
                    description: e.description || '',
                    date: e.date,
                    createdAt: e.created_at,
                }));
            },

            // ========================================
            // COMPUTED
            // ========================================
            getLowStockAlerts: () => {
                const { products, categories } = get();
                return products
                    .map(p => {
                        const cat = categories.find(c => c.id === p.categoryId);
                        const threshold = cat?.lowStockThreshold ?? 10;
                        if (p.quantity <= threshold) {
                            return {
                                id: p.id,
                                productId: p.id,
                                productName: p.name,
                                categoryId: p.categoryId,
                                categoryName: cat?.name ?? 'Unknown',
                                currentStock: p.quantity,
                                threshold,
                                severity: (p.quantity <= threshold / 2 || p.quantity === 0) ? 'critical' : 'warning',
                            } as Alert;
                        }
                        return null;
                    })
                    .filter((a): a is Alert => a !== null)
                    .sort((a, b) => a.currentStock - b.currentStock);
            },

            getTodayStats: () => {
                const { sales, products, expenses } = get();
                const today = new Date().toISOString().split('T')[0];
                const todaysSales = sales.filter(s => s.createdAt.startsWith(today));
                const todaysExpensesTotal = expenses
                    .filter(e => e.date === today)
                    .reduce((acc, e) => acc + e.amount, 0);

                const revenue = todaysSales.reduce((acc, s) => acc + s.total, 0);
                const credit = todaysSales.filter(s => s.paymentMethod === 'Credit').reduce((acc, s) => acc + s.total, 0);
                const itemsCount = todaysSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);

                // Real profit calculation using cost prices, minus expenses
                let profit = 0;
                todaysSales.forEach(sale => {
                    sale.items.forEach(item => {
                        const product = products.find(p => p.id === item.productId);
                        const costPrice = product?.costPrice ?? 0;
                        profit += item.quantity * (item.unitPrice - costPrice);
                    });
                });

                return {
                    totalRevenue: revenue,
                    totalProfit: profit - todaysExpensesTotal,
                    totalCredit: credit,
                    transactionsCount: todaysSales.length,
                    itemsSoldCount: itemsCount,
                };
            },

            getTopSellingItems: (salesData: Sale[]) => {
                const { products } = get();
                const itemMap = new Map<string, { productId: string; productName: string; totalQty: number; unitPrice: number; revenue: number; profit: number }>();

                salesData.forEach(sale => {
                    sale.items.forEach(item => {
                        const existing = itemMap.get(item.productId);
                        const product = products.find(p => p.id === item.productId);
                        const costPrice = product?.costPrice ?? 0;
                        const itemProfit = item.quantity * (item.unitPrice - costPrice);

                        if (existing) {
                            existing.totalQty += item.quantity;
                            existing.revenue += item.total;
                            existing.profit += itemProfit;
                        } else {
                            itemMap.set(item.productId, {
                                productId: item.productId,
                                productName: item.productName,
                                totalQty: item.quantity,
                                unitPrice: item.unitPrice,
                                revenue: item.total,
                                profit: itemProfit,
                            });
                        }
                    });
                });

                return Array.from(itemMap.values()).sort((a, b) => b.totalQty - a.totalQty);
            },
        }),
        {
            name: 'amit-store-cache',
            partialize: (state) => ({
                currentUser: state.currentUser,
                categories: state.categories,
                products: state.products,
            }),
        }
    )
);

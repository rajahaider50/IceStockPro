import db from './schema';
import type {
  StockItem,
  PurchaseRecord,
  SaleRecord,
  AppSettings,
  CartEntry,
  MachineType,
  PaymentMode,
  Category,
  Customer,
  CreditEntry,
  Expense,
  WastageRecord,
  Supplier,
  AdminConfig,
  PaymentAccount,
  UserPayment,
} from '../types';

// ---------- ITEMS ----------

export async function getAllItems(): Promise<StockItem[]> {
  const all = await db.items.toArray();
  return all.filter((i) => i.isActive);
}

export async function getAllItemsRaw(): Promise<StockItem[]> {
  return getAllItems();
}

export async function getItemById(id: number): Promise<StockItem | undefined> {
  return db.items.get(id);
}

export async function addItem(item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = Date.now();
  const id = await db.items.add({ ...item, createdAt: now, updatedAt: now } as StockItem);
  return id as number;
}

export async function updateItem(id: number, changes: Partial<StockItem>): Promise<void> {
  await db.items.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteItem(id: number): Promise<void> {
  await db.items.update(id, { isActive: false, updatedAt: Date.now() });
}

export async function adjustStock(id: number, delta: number): Promise<void> {
  const item = await db.items.get(id);
  if (!item) return;
  const newStock = Math.max(0, item.currentStock + delta);
  await db.items.update(id, { currentStock: newStock, updatedAt: Date.now() });
}

export async function getLowStockItems(): Promise<StockItem[]> {
  const all = await getAllItemsRaw();
  return all.filter((i) => i.currentStock <= i.lowStockThreshold);
}

// ---------- PURCHASES ----------

export async function addPurchase(
  purchase: Omit<PurchaseRecord, 'id' | 'totalCost'>
): Promise<number> {
  const totalCost = purchase.quantity * purchase.purchasePrice;
  const id = await db.purchases.add({ ...purchase, totalCost } as PurchaseRecord);
  await adjustStock(purchase.itemId, purchase.quantity);
  await db.items.update(purchase.itemId, { purchasePrice: purchase.purchasePrice, updatedAt: Date.now() });
  return id as number;
}

export async function getPurchasesInRange(start: number, end: number): Promise<PurchaseRecord[]> {
  return db.purchases.where('date').between(start, end, true, true).toArray();
}

export async function getAllPurchases(): Promise<PurchaseRecord[]> {
  return db.purchases.orderBy('date').reverse().toArray();
}

export async function deletePurchase(id: number): Promise<void> {
  const p = await db.purchases.get(id);
  if (p) {
    await adjustStock(p.itemId, -p.quantity);
  }
  await db.purchases.delete(id);
}

// ---------- SALES ----------

export async function createSale(
  machineType: MachineType,
  cart: CartEntry[],
  paymentMode: PaymentMode,
  customerNote?: string
): Promise<number> {
  const items = cart.map((c) => ({
    itemId: c.item.id!,
    itemNameSnapshot: c.item.variant ? `${c.item.name} (${c.item.variant})` : c.item.name,
    qty: c.qty,
    unitPrice: c.item.sellPrice,
    unitCost: c.item.purchasePrice,
    lineTotal: c.qty * c.item.sellPrice,
  }));

  const totalAmount = items.reduce((s, i) => s + i.lineTotal, 0);
  const totalCost = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const totalProfit = totalAmount - totalCost;

  const record: Omit<SaleRecord, 'id'> = {
    machineType,
    items,
    totalAmount,
    totalCost,
    totalProfit,
    paymentMode,
    date: Date.now(),
    customerNote,
  };

  const id = await db.sales.add(record as SaleRecord);

  for (const c of cart) {
    await adjustStock(c.item.id!, -c.qty);
  }

  return id as number;
}

export async function getSalesInRange(start: number, end: number): Promise<SaleRecord[]> {
  return db.sales.where('date').between(start, end, true, true).toArray();
}

export async function getAllSales(): Promise<SaleRecord[]> {
  return db.sales.orderBy('date').reverse().toArray();
}

export async function deleteSale(id: number): Promise<void> {
  const s = await db.sales.get(id);
  if (s) {
    for (const line of s.items) {
      await adjustStock(line.itemId, line.qty);
    }
  }
  await db.sales.delete(id);
}

// ---------- SETTINGS ----------

export async function getSettings(): Promise<AppSettings> {
  const all = await db.settings.toArray();
  if (all.length > 0) return all[0];
  const defaultSettings: AppSettings = {
    shopName: 'My Ice Cream & Juice Shop',
    currency: 'Rs',
    theme: 'light',
  };
  const id = await db.settings.add(defaultSettings);
  return { ...defaultSettings, id: id as number };
}

export async function updateSettings(changes: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  if (current.id) {
    await db.settings.update(current.id, changes);
  }
}

// ---------- CUSTOMERS ----------

export async function getAllCustomers(): Promise<Customer[]> {
  return db.customers.orderBy('name').toArray();
}

export async function addCustomer(c: Omit<Customer, 'id' | 'createdAt'>): Promise<number> {
  const existing = await db.customers.where('name').equalsIgnoreCase(c.name).first();
  if (existing) throw new Error('Customer with this name already exists');
  const id = await db.customers.add({ ...c, createdAt: Date.now() } as Customer);
  return id as number;
}

export async function updateCustomer(id: number, changes: Partial<Customer>): Promise<void> {
  if (changes.name) {
    const existing = await db.customers.where('name').equalsIgnoreCase(changes.name).first();
    if (existing && existing.id !== id) throw new Error('Customer with this name already exists');
  }
  await db.customers.update(id, changes);
}

export async function deleteCustomer(id: number): Promise<void> {
  const balance = await getCustomerBalance(id);
  if (balance > 0) throw new Error('Cannot delete customer with outstanding balance');
  await db.creditLog.where('customerId').equals(id).delete();
  await db.customers.delete(id);
}

export async function getCustomerBalance(customerId: number): Promise<number> {
  const entries = await db.creditLog.where('customerId').equals(customerId).toArray();
  const credit = entries.filter((e) => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
  const payment = entries.filter((e) => e.type === 'payment').reduce((s, e) => s + e.amount, 0);
  return credit - payment;
}

export async function getAllCustomersWithBalances(): Promise<(Customer & { balance: number })[]> {
  const customers = await getAllCustomers();
  const result: (Customer & { balance: number })[] = [];
  for (const c of customers) {
    const balance = await getCustomerBalance(c.id!);
    result.push({ ...c, balance });
  }
  return result.sort((a, b) => b.balance - a.balance);
}

export async function getOutstandingTotal(): Promise<number> {
  const entries = await db.creditLog.toArray();
  const byCustomer = new Map<number, number>();
  for (const e of entries) {
    const cur = byCustomer.get(e.customerId) || 0;
    byCustomer.set(e.customerId, cur + (e.type === 'credit' ? e.amount : -e.amount));
  }
  let total = 0;
  for (const v of byCustomer.values()) {
    if (v > 0) total += v;
  }
  return total;
}

// ---------- CREDIT LOG ----------

export async function addCreditEntry(entry: Omit<CreditEntry, 'id' | 'date'> & { date?: number }): Promise<number> {
  const id = await db.creditLog.add({ ...entry, date: entry.date ?? Date.now() } as CreditEntry);
  return id as number;
}

export async function getCustomerLedger(customerId: number): Promise<CreditEntry[]> {
  return db.creditLog.where('customerId').equals(customerId).reverse().sortBy('date');
}

// ---------- EXPENSES ----------

export async function addExpense(e: Omit<Expense, 'id' | 'date'> & { date?: number }): Promise<number> {
  const id = await db.expenses.add({ ...e, date: e.date ?? Date.now() } as Expense);
  return id as number;
}

export async function getExpensesInRange(start: number, end: number): Promise<Expense[]> {
  return db.expenses.where('date').between(start, end, true, true).toArray();
}

export async function getAllExpenses(): Promise<Expense[]> {
  return db.expenses.orderBy('date').reverse().toArray();
}

export async function deleteExpense(id: number): Promise<void> {
  await db.expenses.delete(id);
}

export async function getExpensesTotal(start: number, end: number): Promise<number> {
  const items = await getExpensesInRange(start, end);
  return items.reduce((s, e) => s + e.amount, 0);
}

// ---------- WASTAGE ----------

export async function addWastage(w: Omit<WastageRecord, 'id' | 'totalLoss'>): Promise<number> {
  const item = await db.items.get(w.itemId);
  if (!item) throw new Error('Item not found');
  if (w.qty > item.currentStock) throw new Error('Not enough stock');
  const totalLoss = w.qty * w.unitCost;
  const id = await db.wastage.add({ ...w, totalLoss } as WastageRecord);
  await adjustStock(w.itemId, -w.qty);
  return id as number;
}

export async function getWastageInRange(start: number, end: number): Promise<WastageRecord[]> {
  return db.wastage.where('date').between(start, end, true, true).toArray();
}

export async function getAllWastage(): Promise<WastageRecord[]> {
  return db.wastage.orderBy('date').reverse().toArray();
}

export async function deleteWastage(id: number): Promise<void> {
  const w = await db.wastage.get(id);
  if (w) await adjustStock(w.itemId, w.qty);
  await db.wastage.delete(id);
}

export async function getWastageTotal(start: number, end: number): Promise<number> {
  const items = await getWastageInRange(start, end);
  return items.reduce((s, w) => s + w.totalLoss, 0);
}

// ---------- SUPPLIERS ----------

export async function getAllSuppliers(): Promise<Supplier[]> {
  return db.suppliers.orderBy('name').toArray();
}

export async function addSupplier(s: Omit<Supplier, 'id' | 'createdAt'>): Promise<number> {
  const existing = await db.suppliers.where('name').equalsIgnoreCase(s.name).first();
  if (existing) throw new Error('Supplier with this name already exists');
  const id = await db.suppliers.add({ ...s, createdAt: Date.now() } as Supplier);
  return id as number;
}

export async function updateSupplier(id: number, changes: Partial<Supplier>): Promise<void> {
  if (changes.name) {
    const existing = await db.suppliers.where('name').equalsIgnoreCase(changes.name).first();
    if (existing && existing.id !== id) throw new Error('Supplier with this name already exists');
  }
  await db.suppliers.update(id, changes);
}

export async function deleteSupplier(id: number): Promise<void> {
  await db.suppliers.delete(id);
}

export async function getSupplierPurchaseStats(): Promise<(Supplier & { totalPurchased: number; purchaseCount: number })[]> {
  const suppliers = await getAllSuppliers();
  const allPurchases = await db.purchases.toArray();
  return suppliers.map((s) => {
    const matching = allPurchases.filter((p) => p.supplierName?.toLowerCase() === s.name.toLowerCase());
    return {
      ...s,
      totalPurchased: matching.reduce((sum, p) => sum + p.totalCost, 0),
      purchaseCount: matching.length,
    };
  });
}

// ---------- CATEGORIES ----------

export async function getAllCategories(): Promise<Category[]> {
  return db.categories.orderBy('name').toArray();
}

export async function addCategory(cat: Omit<Category, 'id' | 'createdAt'>): Promise<number> {
  const existing = await db.categories.where('name').equalsIgnoreCase(cat.name).first();
  if (existing) {
    throw new Error('A category with this name already exists');
  }
  const id = await db.categories.add({ ...cat, createdAt: Date.now() } as Category);
  return id as number;
}

export async function updateCategory(id: number, changes: Partial<Category>): Promise<void> {
  if (changes.name) {
    const existing = await db.categories.where('name').equalsIgnoreCase(changes.name).first();
    if (existing && existing.id !== id) {
      throw new Error('A category with this name already exists');
    }
    const old = await db.categories.get(id);
    if (old && old.name !== changes.name) {
      const itemsToUpdate = await db.items.where('category').equals(old.name).toArray();
      await Promise.all(
        itemsToUpdate.map((it) => db.items.update(it.id!, { category: changes.name }))
      );
    }
  }
  await db.categories.update(id, changes);
}

export async function deleteCategory(id: number): Promise<{ blocked: boolean; count: number }> {
  const cat = await db.categories.get(id);
  if (!cat) return { blocked: false, count: 0 };
  const itemsUsing = await db.items.where('category').equals(cat.name).toArray();
  const activeCount = itemsUsing.filter((i) => i.isActive).length;
  if (activeCount > 0) {
    return { blocked: true, count: activeCount };
  }
  await db.categories.delete(id);
  return { blocked: false, count: 0 };
}

export async function getCategoryItemCount(categoryName: string): Promise<number> {
  const items = await db.items.where('category').equals(categoryName).toArray();
  return items.filter((i) => i.isActive).length;
}

// ---------- ADMIN CONFIG ----------

export async function getAdminConfig(): Promise<AdminConfig> {
  const all = await db.adminConfig.toArray();
  if (all.length > 0) return all[0];
  // Seed default
  const defaultConfig: AdminConfig = {
    passwordHash: '',
    appPrice: 500,
    installmentDaily: 50,
    installmentWeekly: 100,
    installmentMonthly: 200,
  };
  const id = await db.adminConfig.add(defaultConfig);
  return { ...defaultConfig, id: id as number };
}

export async function updateAdminConfig(changes: Partial<AdminConfig>): Promise<void> {
  const current = await getAdminConfig();
  if (current.id) await db.adminConfig.update(current.id, changes);
}

// ---------- PAYMENT ACCOUNTS ----------

export async function getAllPaymentAccounts(): Promise<PaymentAccount[]> {
  return db.paymentAccounts.toArray();
}

export async function getActivePaymentAccounts(): Promise<PaymentAccount[]> {
  const all = await db.paymentAccounts.toArray();
  return all.filter((a) => a.isActive);
}

export async function addPaymentAccount(a: Omit<PaymentAccount, 'id' | 'createdAt'>): Promise<number> {
  const id = await db.paymentAccounts.add({ ...a, createdAt: Date.now() } as PaymentAccount);
  return id as number;
}

export async function updatePaymentAccount(id: number, changes: Partial<PaymentAccount>): Promise<void> {
  await db.paymentAccounts.update(id, changes);
}

export async function deletePaymentAccount(id: number): Promise<void> {
  await db.paymentAccounts.delete(id);
}

// ---------- USER PAYMENTS ----------

export async function addUserPayment(p: Omit<UserPayment, 'id' | 'createdAt' | 'status'>): Promise<number> {
  const id = await db.userPayments.add({ ...p, status: 'pending', createdAt: Date.now() } as UserPayment);
  return id as number;
}

export async function getAllUserPayments(): Promise<UserPayment[]> {
  return db.userPayments.orderBy('createdAt').reverse().toArray();
}

export async function getPendingPayments(): Promise<UserPayment[]> {
  return db.userPayments.where('status').equals('pending').reverse().sortBy('createdAt');
}

export async function approvePayment(id: number, note?: string): Promise<void> {
  await db.userPayments.update(id, { status: 'approved', adminNote: note, approvedAt: Date.now() });
}

export async function rejectPayment(id: number, note?: string): Promise<void> {
  await db.userPayments.update(id, { status: 'rejected', adminNote: note });
}

export async function getLatestApprovedPayment(): Promise<UserPayment | undefined> {
  const all = await db.userPayments.where('status').equals('approved').toArray();
  if (all.length === 0) return undefined;
  return all.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))[0];
}

// ---------- SEED ADMIN DEFAULTS ----------

export async function seedAdminDefaults(): Promise<void> {
  const existing = await db.adminConfig.toArray();
  if (existing.length === 0) {
    await db.adminConfig.add({
      passwordHash: 'f5453db7',
      appPrice: 500,
      installmentDaily: 50,
      installmentWeekly: 100,
      installmentMonthly: 200,
    });
  }
  const accounts = await db.paymentAccounts.toArray();
  if (accounts.length === 0) {
    await db.paymentAccounts.add({
      type: 'easypaisa',
      holderName: 'Erum Naz',
      phone: '03495031007',
      isActive: true,
      createdAt: Date.now(),
    } as PaymentAccount);
  }
}

// ---------- BACKUP / RESTORE ----------

export async function exportAllData() {
  const [items, purchases, sales, settings, categories, customers, creditLog, expenses, wastage, suppliers, adminConfig, paymentAccounts, userPayments] = await Promise.all([
    db.items.toArray(),
    db.purchases.toArray(),
    db.sales.toArray(),
    db.settings.toArray(),
    db.categories.toArray(),
    db.customers.toArray(),
    db.creditLog.toArray(),
    db.expenses.toArray(),
    db.wastage.toArray(),
    db.suppliers.toArray(),
    db.adminConfig.toArray(),
    db.paymentAccounts.toArray(),
    db.userPayments.toArray(),
  ]);
  return {
    exportedAt: Date.now(),
    version: 4,
    items, purchases, sales, settings, categories, customers, creditLog, expenses, wastage, suppliers,
    adminConfig, paymentAccounts, userPayments,
  };
}

export async function importAllData(data: {
  items: StockItem[];
  purchases: PurchaseRecord[];
  sales: SaleRecord[];
  settings: AppSettings[];
  categories?: Category[];
  customers?: Customer[];
  creditLog?: CreditEntry[];
  expenses?: Expense[];
  wastage?: WastageRecord[];
  suppliers?: Supplier[];
  adminConfig?: AdminConfig[];
  paymentAccounts?: PaymentAccount[];
  userPayments?: UserPayment[];
}) {
  await db.transaction(
    'rw',
    db.items, db.purchases, db.sales, db.settings, db.categories,
    db.customers, db.creditLog, db.expenses, db.wastage, db.suppliers,
    db.adminConfig, db.paymentAccounts, db.userPayments,
    async () => {
      await db.items.clear();
      await db.purchases.clear();
      await db.sales.clear();
      await db.settings.clear();
      await db.categories.clear();
      await db.customers.clear();
      await db.creditLog.clear();
      await db.expenses.clear();
      await db.wastage.clear();
      await db.suppliers.clear();
      await db.adminConfig.clear();
      await db.paymentAccounts.clear();
      await db.userPayments.clear();
      await db.items.bulkAdd(data.items);
      await db.purchases.bulkAdd(data.purchases);
      await db.sales.bulkAdd(data.sales);
      await db.settings.bulkAdd(data.settings);
      if (data.categories) await db.categories.bulkAdd(data.categories);
      if (data.customers) await db.customers.bulkAdd(data.customers);
      if (data.creditLog) await db.creditLog.bulkAdd(data.creditLog);
      if (data.expenses) await db.expenses.bulkAdd(data.expenses);
      if (data.wastage) await db.wastage.bulkAdd(data.wastage);
      if (data.suppliers) await db.suppliers.bulkAdd(data.suppliers);
      if (data.adminConfig) await db.adminConfig.bulkAdd(data.adminConfig);
      if (data.paymentAccounts) await db.paymentAccounts.bulkAdd(data.paymentAccounts);
      if (data.userPayments) await db.userPayments.bulkAdd(data.userPayments);
    }
  );
}

export async function deleteAllData(): Promise<void> {
  await db.transaction(
    'rw',
    db.items, db.purchases, db.sales, db.settings, db.categories,
    db.customers, db.creditLog, db.expenses, db.wastage, db.suppliers,
    db.userPayments,
    async () => {
      await db.items.clear();
      await db.purchases.clear();
      await db.sales.clear();
      await db.settings.clear();
      await db.categories.clear();
      await db.customers.clear();
      await db.creditLog.clear();
      await db.expenses.clear();
      await db.wastage.clear();
      await db.suppliers.clear();
      await db.userPayments.clear();
      // adminConfig and paymentAccounts are NOT cleared — they persist on reset
    }
  );
}

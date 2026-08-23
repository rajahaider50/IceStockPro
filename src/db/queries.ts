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
  // Soft delete to preserve historical sales/purchase snapshots
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
  // increase stock
  await adjustStock(purchase.itemId, purchase.quantity);
  // update item's purchase price to latest
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
    await adjustStock(p.itemId, -p.quantity); // reverse stock
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

  // Deduct stock for each item
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
    // restore stock
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

// ---------- BACKUP / RESTORE ----------

export async function exportAllData() {
  const [items, purchases, sales, settings, categories] = await Promise.all([
    db.items.toArray(),
    db.purchases.toArray(),
    db.sales.toArray(),
    db.settings.toArray(),
    db.categories.toArray(),
  ]);
  return {
    exportedAt: Date.now(),
    version: 2,
    items,
    purchases,
    sales,
    settings,
    categories,
  };
}

export async function importAllData(data: {
  items: StockItem[];
  purchases: PurchaseRecord[];
  sales: SaleRecord[];
  settings: AppSettings[];
  categories?: Category[];
}) {
  await db.transaction('rw', db.items, db.purchases, db.sales, db.settings, db.categories, async () => {
    await db.items.clear();
    await db.purchases.clear();
    await db.sales.clear();
    await db.settings.clear();
    await db.categories.clear();
    await db.items.bulkAdd(data.items);
    await db.purchases.bulkAdd(data.purchases);
    await db.sales.bulkAdd(data.sales);
    await db.settings.bulkAdd(data.settings);
    if (data.categories) await db.categories.bulkAdd(data.categories);
  });
}

export async function deleteAllData(): Promise<void> {
  await db.transaction('rw', db.items, db.purchases, db.sales, db.settings, db.categories, async () => {
    await db.items.clear();
    await db.purchases.clear();
    await db.sales.clear();
    await db.settings.clear();
    await db.categories.clear();
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
    // Rename: update all items pointing to old category name
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

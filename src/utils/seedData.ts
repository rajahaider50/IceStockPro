import type { StockItem, Category } from '../types';
import db from '../db/schema';

const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Ice Cream Cup', machineType: 'ice_cream', isBuiltIn: true },
  { name: 'Juice Cup', machineType: 'juice', isBuiltIn: true },
  { name: 'Cone', machineType: 'ice_cream', isBuiltIn: true },
  { name: 'Wooden Stick', machineType: 'ice_cream', isBuiltIn: true },
  { name: 'Spoon', machineType: 'both', isBuiltIn: true },
  { name: 'Shopper Bag', machineType: 'both', isBuiltIn: true },
  { name: 'Rubber Band', machineType: 'both', isBuiltIn: true },
  { name: 'Flavor Syrup', machineType: 'juice', isBuiltIn: true },
  { name: 'Chocolate/Other Syrup', machineType: 'both', isBuiltIn: true },
  { name: 'Other', machineType: 'both', isBuiltIn: true },
];

const defaultItems: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Ice Cream Cup', variant: '20 Rs', category: 'Ice Cream Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 12, sellPrice: 20, isActive: true },
  { name: 'Ice Cream Cup', variant: '30 Rs', category: 'Ice Cream Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 18, sellPrice: 30, isActive: true },
  { name: 'Ice Cream Cup', variant: '40 Rs', category: 'Ice Cream Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 24, sellPrice: 40, isActive: true },
  { name: 'Ice Cream Cup', variant: '50 Rs', category: 'Ice Cream Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 30, sellPrice: 50, isActive: true },
  { name: 'Ice Cream Cone', variant: 'Regular', category: 'Cone', unit: 'piece', currentStock: 40, lowStockThreshold: 10, purchasePrice: 8, sellPrice: 15, isActive: true },
  { name: 'Wooden Stick', category: 'Wooden Stick', unit: 'piece', currentStock: 100, lowStockThreshold: 20, purchasePrice: 1, sellPrice: 0, isActive: true },
  { name: 'Plastic Spoon', category: 'Spoon', unit: 'piece', currentStock: 100, lowStockThreshold: 20, purchasePrice: 1, sellPrice: 0, isActive: true },
  { name: 'Shopper Bag', variant: 'Small', category: 'Shopper Bag', unit: 'piece', currentStock: 80, lowStockThreshold: 15, purchasePrice: 2, sellPrice: 0, isActive: true },
  { name: 'Rubber Band', category: 'Rubber Band', unit: 'piece', currentStock: 200, lowStockThreshold: 30, purchasePrice: 0.2, sellPrice: 0, isActive: true },
  { name: 'Juice Cup', variant: '20 Rs', category: 'Juice Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 10, sellPrice: 20, isActive: true },
  { name: 'Juice Cup', variant: '30 Rs', category: 'Juice Cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 16, sellPrice: 30, isActive: true },
  { name: 'Juice Glass', variant: 'Plastic', category: 'Juice Cup', unit: 'piece', currentStock: 40, lowStockThreshold: 10, purchasePrice: 5, sellPrice: 0, isActive: true },
  { name: 'Mango Flavor Syrup', category: 'Flavor Syrup', unit: 'ml', currentStock: 2000, lowStockThreshold: 300, purchasePrice: 0.5, sellPrice: 0, isActive: true },
  { name: 'Chocolate Syrup', category: 'Chocolate/Other Syrup', unit: 'ml', currentStock: 1000, lowStockThreshold: 200, purchasePrice: 0.8, sellPrice: 0, isActive: true },
];

export async function seedIfEmpty() {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    const now = Date.now();
    await db.categories.bulkAdd(defaultCategories.map((c) => ({ ...c, createdAt: now })) as Category[]);
  }

  const itemCount = await db.items.count();
  if (itemCount === 0) {
    const now = Date.now();
    await db.items.bulkAdd(defaultItems.map((i) => ({ ...i, createdAt: now, updatedAt: now })) as StockItem[]);
  }
}

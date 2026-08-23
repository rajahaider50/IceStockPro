import type { StockItem } from '../types';
import db from '../db/schema';

const defaultItems: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Ice cream cups (different price variants)
  { name: 'Ice Cream Cup', variant: '20 Rs', category: 'ice_cream_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 12, sellPrice: 20, isActive: true },
  { name: 'Ice Cream Cup', variant: '30 Rs', category: 'ice_cream_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 18, sellPrice: 30, isActive: true },
  { name: 'Ice Cream Cup', variant: '40 Rs', category: 'ice_cream_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 24, sellPrice: 40, isActive: true },
  { name: 'Ice Cream Cup', variant: '50 Rs', category: 'ice_cream_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 30, sellPrice: 50, isActive: true },
  // Cones
  { name: 'Ice Cream Cone', variant: 'Regular', category: 'cone', unit: 'piece', currentStock: 40, lowStockThreshold: 10, purchasePrice: 8, sellPrice: 15, isActive: true },
  // Sticks
  { name: 'Wooden Stick', category: 'stick', unit: 'piece', currentStock: 100, lowStockThreshold: 20, purchasePrice: 1, sellPrice: 0, isActive: true },
  // Spoons
  { name: 'Plastic Spoon', category: 'spoon', unit: 'piece', currentStock: 100, lowStockThreshold: 20, purchasePrice: 1, sellPrice: 0, isActive: true },
  // Shoppers
  { name: 'Shopper Bag', variant: 'Small', category: 'shopper', unit: 'piece', currentStock: 80, lowStockThreshold: 15, purchasePrice: 2, sellPrice: 0, isActive: true },
  // Rubber bands
  { name: 'Rubber Band', category: 'rubber_band', unit: 'piece', currentStock: 200, lowStockThreshold: 30, purchasePrice: 0.2, sellPrice: 0, isActive: true },
  // Juice cups
  { name: 'Juice Cup', variant: '20 Rs', category: 'juice_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 10, sellPrice: 20, isActive: true },
  { name: 'Juice Cup', variant: '30 Rs', category: 'juice_cup', unit: 'piece', currentStock: 50, lowStockThreshold: 10, purchasePrice: 16, sellPrice: 30, isActive: true },
  // Juice glasses
  { name: 'Juice Glass', variant: 'Plastic', category: 'juice_cup', unit: 'piece', currentStock: 40, lowStockThreshold: 10, purchasePrice: 5, sellPrice: 0, isActive: true },
  // Flavors
  { name: 'Mango Flavor Syrup', category: 'flavor', unit: 'ml', currentStock: 2000, lowStockThreshold: 300, purchasePrice: 0.5, sellPrice: 0, isActive: true },
  // Chocolate Syrup
  { name: 'Chocolate Syrup', category: 'syrup', unit: 'ml', currentStock: 1000, lowStockThreshold: 200, purchasePrice: 0.8, sellPrice: 0, isActive: true },
];

export async function seedIfEmpty() {
  const count = await db.items.count();
  if (count === 0) {
    const now = Date.now();
    await db.items.bulkAdd(defaultItems.map((i) => ({ ...i, createdAt: now, updatedAt: now })) as StockItem[]);
  }
}

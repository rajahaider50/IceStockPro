import Dexie, { type EntityTable } from 'dexie';
import type { StockItem, PurchaseRecord, SaleRecord, AppSettings, Category } from '../types';

const db = new Dexie('IceStockProDB') as Dexie & {
  items: EntityTable<StockItem, 'id'>;
  purchases: EntityTable<PurchaseRecord, 'id'>;
  sales: EntityTable<SaleRecord, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

db.version(1).stores({
  items: '++id, category, isActive, name',
  purchases: '++id, itemId, date',
  sales: '++id, machineType, date',
  settings: '++id',
});

// v2: added dynamic categories table
db.version(2).stores({
  items: '++id, category, isActive, name',
  purchases: '++id, itemId, date',
  sales: '++id, machineType, date',
  settings: '++id',
  categories: '++id, name',
});

export default db;

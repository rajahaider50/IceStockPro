import Dexie, { type EntityTable } from 'dexie';
import type { StockItem, PurchaseRecord, SaleRecord, AppSettings, Category, Customer, CreditEntry, Expense, WastageRecord, Supplier } from '../types';

const db = new Dexie('IceStockProDB') as Dexie & {
  items: EntityTable<StockItem, 'id'>;
  purchases: EntityTable<PurchaseRecord, 'id'>;
  sales: EntityTable<SaleRecord, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  categories: EntityTable<Category, 'id'>;
  customers: EntityTable<Customer, 'id'>;
  creditLog: EntityTable<CreditEntry, 'id'>;
  expenses: EntityTable<Expense, 'id'>;
  wastage: EntityTable<WastageRecord, 'id'>;
  suppliers: EntityTable<Supplier, 'id'>;
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

// v3: udhaar, expenses, wastage, suppliers
db.version(3).stores({
  items: '++id, category, isActive, name',
  purchases: '++id, itemId, date',
  sales: '++id, machineType, date',
  settings: '++id',
  categories: '++id, name',
  customers: '++id, name',
  creditLog: '++id, customerId, date',
  expenses: '++id, date',
  wastage: '++id, itemId, date',
  suppliers: '++id, name',
});

export default db;

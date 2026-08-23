import Dexie, { type EntityTable } from 'dexie';
import type { StockItem, PurchaseRecord, SaleRecord, AppSettings } from '../types';

const db = new Dexie('IceStockProDB') as Dexie & {
  items: EntityTable<StockItem, 'id'>;
  purchases: EntityTable<PurchaseRecord, 'id'>;
  sales: EntityTable<SaleRecord, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  items: '++id, category, isActive, name',
  purchases: '++id, itemId, date',
  sales: '++id, machineType, date',
  settings: '++id',
});

export default db;

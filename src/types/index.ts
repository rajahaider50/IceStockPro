// ==========================================
// IceStock Pro — Core Type Definitions
// ==========================================

export type MachineType = 'ice_cream' | 'juice';

export type ItemCategory =
  | 'ice_cream_cup'
  | 'juice_cup'
  | 'cone'
  | 'stick'
  | 'spoon'
  | 'shopper'
  | 'rubber_band'
  | 'flavor'
  | 'syrup'
  | 'other';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  ice_cream_cup: 'Ice Cream Cup',
  juice_cup: 'Juice Cup',
  cone: 'Cone',
  stick: 'Wooden Stick',
  spoon: 'Spoon',
  shopper: 'Shopper Bag',
  rubber_band: 'Rubber Band',
  flavor: 'Flavor Syrup',
  syrup: 'Chocolate/Other Syrup',
  other: 'Other',
};

export const CATEGORY_MACHINE: Record<ItemCategory, MachineType | 'both'> = {
  ice_cream_cup: 'ice_cream',
  cone: 'ice_cream',
  stick: 'ice_cream',
  juice_cup: 'juice',
  flavor: 'juice',
  spoon: 'both',
  shopper: 'both',
  rubber_band: 'both',
  syrup: 'both',
  other: 'both',
};

export type Unit = 'piece' | 'ml' | 'liter' | 'gram' | 'kg';

export interface StockItem {
  id?: number;
  name: string;
  category: ItemCategory;
  variant?: string; // e.g. "20 Rs", "Mango", "Large"
  unit: Unit;
  currentStock: number;
  lowStockThreshold: number;
  purchasePrice: number; // cost price per unit
  sellPrice: number; // selling price per unit
  photoPath?: string; // local device storage path or base64
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PurchaseRecord {
  id?: number;
  itemId: number;
  itemNameSnapshot: string; // in case item is later edited/deleted
  quantity: number;
  purchasePrice: number; // per unit at time of purchase
  totalCost: number;
  supplierName?: string;
  date: number; // timestamp
  receiptPhotoPath?: string;
  notes?: string;
}

export interface SaleLineItem {
  itemId: number;
  itemNameSnapshot: string;
  qty: number;
  unitPrice: number;
  unitCost: number; // for profit calc
  lineTotal: number;
}

export type PaymentMode = 'cash' | 'online' | 'credit';

export interface SaleRecord {
  id?: number;
  machineType: MachineType;
  items: SaleLineItem[];
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  paymentMode: PaymentMode;
  date: number; // timestamp (used for filtering)
  customerNote?: string;
}

export interface AppSettings {
  id?: number;
  shopName: string;
  logoPath?: string;
  currency: string; // e.g. "Rs"
  theme: 'light' | 'dark' | 'system';
  ownerName?: string;
  phone?: string;
  lastBackupDate?: number;
}

export interface DailyAggregate {
  date: string; // YYYY-MM-DD
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalPurchases: number;
  itemsSoldCount: number;
}

export interface CartEntry {
  item: StockItem;
  qty: number;
}

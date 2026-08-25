// ==========================================
// IceStock Pro — Core Type Definitions
// ==========================================

export type MachineType = 'ice_cream' | 'juice';
export type MachineScope = MachineType | 'both';

// Categories are now fully dynamic — user can add/edit/delete their own.
export interface Category {
  id?: number;
  name: string;
  machineType: MachineScope;
  isBuiltIn?: boolean; // seeded default categories, still deletable but flagged
  createdAt: number;
}

export type Unit = 'piece' | 'ml' | 'liter' | 'gram' | 'kg';

export interface StockItem {
  id?: number;
  name: string;
  category: string; // free reference to Category.name
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

export type ThemeMode = 'light' | 'dark' | 'system';

export type FontFamily = 'inter' | 'roboto' | 'poppins' | 'montserrat' | 'nunito';
export type BorderRadius = 'standard' | 'rounded' | 'pill';
export type IconStyle = 'outline' | 'filled';

export interface AppSettings {
  id?: number;
  shopName: string;
  logoPath?: string;
  currency: string; // e.g. "Rs"
  theme: ThemeMode;
  ownerName?: string;
  phone?: string;
  lastBackupDate?: number;
  dailyTarget?: number;
  language?: 'en' | 'ur';
  pinHash?: string;
  fontFamily?: FontFamily;
  primaryColor?: string;
  borderRadius?: BorderRadius;
  iconStyle?: IconStyle;
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

// ---- CUSTOMERS ----
export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  note?: string;
  createdAt: number;
}

// ---- CREDIT / UDHAAR ----
export type CreditEntryType = 'credit' | 'payment';
export interface CreditEntry {
  id?: number;
  customerId: number;
  saleId?: number;
  type: CreditEntryType;
  amount: number;
  note?: string;
  date: number;
}

// ---- EXPENSES ----
export type ExpenseCategory = 'electricity' | 'rent' | 'salary' | 'transport' | 'other';
export interface Expense {
  id?: number;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: number;
}

// ---- WASTAGE ----
export type WastageReason = 'melted' | 'damaged' | 'expired' | 'other';
export interface WastageRecord {
  id?: number;
  itemId: number;
  itemNameSnapshot: string;
  qty: number;
  unitCost: number;
  totalLoss: number;
  reason: WastageReason;
  date: number;
}

// ---- SUPPLIERS ----
export interface Supplier {
  id?: number;
  name: string;
  phone?: string;
  note?: string;
  createdAt: number;
}

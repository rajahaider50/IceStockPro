export interface Package {
  id: string;
  name: string;
  fullName: string;
  fullPrice: number;
  discount: number;
  saveAmount: number;
  daily: number;
  weekly: number;
  monthly: number;
  badge?: string;
  color: string;
}

export const PACKAGES: Package[] = [
  {
    id: 'original',
    name: 'Original',
    fullName: 'Original Package',
    fullPrice: 5000,
    discount: 0,
    saveAmount: 0,
    daily: 500,
    weekly: 1000,
    monthly: 2000,
    color: 'gray',
  },
  {
    id: 'premium-lite',
    name: 'Premium Lite',
    fullName: 'Premium Lite Package',
    fullPrice: 4800,
    discount: 4,
    saveAmount: 200,
    daily: 480,
    weekly: 960,
    monthly: 1920,
    badge: 'Save Rs 200',
    color: 'blue',
  },
  {
    id: 'business',
    name: 'Business',
    fullName: 'Business Package',
    fullPrice: 4200,
    discount: 16,
    saveAmount: 800,
    daily: 420,
    weekly: 840,
    monthly: 1680,
    badge: 'Save Rs 800',
    color: 'indigo',
  },
  {
    id: 'smart-choice',
    name: 'Smart Choice',
    fullName: 'Smart Choice Package',
    fullPrice: 3750,
    discount: 25,
    saveAmount: 1250,
    daily: 375,
    weekly: 750,
    monthly: 1500,
    badge: 'Save Rs 1,250',
    color: 'violet',
  },
  {
    id: 'best-value',
    name: 'Best Value',
    fullName: 'Best Value Package',
    fullPrice: 3200,
    discount: 36,
    saveAmount: 1800,
    daily: 320,
    weekly: 640,
    monthly: 1280,
    badge: 'Save Rs 1,800',
    color: 'emerald',
  },
  {
    id: 'power-user',
    name: 'Power User',
    fullName: 'Power User Package',
    fullPrice: 2750,
    discount: 45,
    saveAmount: 2250,
    daily: 275,
    weekly: 550,
    monthly: 1100,
    badge: 'Save Rs 2,250',
    color: 'teal',
  },
  {
    id: 'super-saver',
    name: 'Super Saver',
    fullName: 'Super Saver Package',
    fullPrice: 2100,
    discount: 58,
    saveAmount: 2900,
    daily: 210,
    weekly: 420,
    monthly: 840,
    badge: 'Save Rs 2,900',
    color: 'amber',
  },
  {
    id: 'mega-deal',
    name: 'Mega Deal',
    fullName: 'Mega Deal Package',
    fullPrice: 1500,
    discount: 70,
    saveAmount: 3500,
    daily: 150,
    weekly: 300,
    monthly: 600,
    badge: 'Save Rs 3,500',
    color: 'orange',
  },
  {
    id: 'budget-pro',
    name: 'Budget Pro',
    fullName: 'Budget Pro Package',
    fullPrice: 999,
    discount: 80,
    saveAmount: 4001,
    daily: 100,
    weekly: 200,
    monthly: 400,
    badge: 'Save Rs 4,001',
    color: 'red',
  },
  {
    id: 'starter',
    name: 'Starter',
    fullName: 'Starter Package',
    fullPrice: 599,
    discount: 88,
    saveAmount: 4401,
    daily: 60,
    weekly: 120,
    monthly: 240,
    badge: 'Save Rs 4,401',
    color: 'rose',
  },
];

export function getPackageById(id: string): Package {
  return PACKAGES.find((p) => p.id === id) || PACKAGES[0];
}

export function formatPackagePrice(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

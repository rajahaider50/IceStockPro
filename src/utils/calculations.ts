import type { SaleRecord, PurchaseRecord } from '../types';

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function startOfWeek(ts: number): number {
  const d = new Date(ts);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfMonth(ts: number): number {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface PeriodStats {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalPurchaseCost: number;
  netProfit: number; // sales profit - purchase spend not tied to sold stock is separate; here it's sale-based profit
  itemsSoldCount: number;
  transactionCount: number;
}

export function computeStats(sales: SaleRecord[], purchases: PurchaseRecord[]): PeriodStats {
  const totalSales = sales.reduce((s, r) => s + r.totalAmount, 0);
  const totalCost = sales.reduce((s, r) => s + r.totalCost, 0);
  const totalProfit = sales.reduce((s, r) => s + r.totalProfit, 0);
  const totalPurchaseCost = purchases.reduce((s, r) => s + r.totalCost, 0);
  const itemsSoldCount = sales.reduce(
    (s, r) => s + r.items.reduce((si, i) => si + i.qty, 0),
    0
  );

  return {
    totalSales,
    totalCost,
    totalProfit,
    totalPurchaseCost,
    netProfit: totalProfit,
    itemsSoldCount,
    transactionCount: sales.length,
  };
}

export interface NetProfitBreakdown {
  grossProfit: number; // profit from sales (revenue - cost of goods)
  expenses: number; // period expenses
  wastage: number; // period wastage loss (at cost)
  netProfit: number; // grossProfit - expenses - wastage
}

export function computeNetProfit(
  grossProfit: number,
  expenses: number,
  wastage: number
): NetProfitBreakdown {
  const netProfit = grossProfit - expenses - wastage;
  return { grossProfit, expenses, wastage, netProfit };
}

export function formatCurrency(amount: number, symbol = 'Rs'): string {
  return `${symbol} ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface ProductRank {
  name: string;
  qty: number;
  revenue: number;
  rank: number;
  prevRank: number | null; // null = wasn't in top list last period
  trend: 'up' | 'down' | 'same' | 'new';
}

export function getProductRankings(
  currentSales: SaleRecord[],
  previousSales: SaleRecord[],
  limit = 10
): ProductRank[] {
  function tally(sales: SaleRecord[]) {
    const map = new Map<string, { qty: number; revenue: number }>();
    sales.forEach((sale) => {
      sale.items.forEach((line) => {
        const existing = map.get(line.itemNameSnapshot) || { qty: 0, revenue: 0 };
        existing.qty += line.qty;
        existing.revenue += line.lineTotal;
        map.set(line.itemNameSnapshot, existing);
      });
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty);
  }

  const current = tally(currentSales).slice(0, limit);
  const previous = tally(previousSales);
  const prevRankMap = new Map(previous.map((p, idx) => [p.name, idx + 1]));

  return current.map((item, idx) => {
    const rank = idx + 1;
    const prevRank = prevRankMap.get(item.name) ?? null;
    let trend: ProductRank['trend'] = 'new';
    if (prevRank !== null) {
      if (prevRank > rank) trend = 'up';
      else if (prevRank < rank) trend = 'down';
      else trend = 'same';
    }
    return { name: item.name, qty: item.qty, revenue: item.revenue, rank, prevRank, trend };
  });
}

export function getTopSellingItems(
  sales: SaleRecord[],
  limit = 5
): { name: string; qty: number; revenue: number }[] {
  const map = new Map<string, { qty: number; revenue: number }>();
  sales.forEach((sale) => {
    sale.items.forEach((line) => {
      const existing = map.get(line.itemNameSnapshot) || { qty: 0, revenue: 0 };
      existing.qty += line.qty;
      existing.revenue += line.lineTotal;
      map.set(line.itemNameSnapshot, existing);
    });
  });
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function getLast7DaysTrend(
  sales: SaleRecord[]
): { date: string; sales: number; profit: number }[] {
  const days: { date: string; sales: number; profit: number }[] = [];
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const dayTs = now - i * 24 * 60 * 60 * 1000;
    const start = startOfDay(dayTs);
    const end = endOfDay(dayTs);
    const daySales = sales.filter((s) => s.date >= start && s.date <= end);
    days.push({
      date: new Date(dayTs).toLocaleDateString('en-GB', { weekday: 'short' }),
      sales: daySales.reduce((s, r) => s + r.totalAmount, 0),
      profit: daySales.reduce((s, r) => s + r.totalProfit, 0),
    });
  }
  return days;
}

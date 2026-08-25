type Lang = 'en' | 'ur';
type Dict = Record<string, { en: string; ur: string }>;

const dict: Dict = {
  nav_dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  nav_stock: { en: 'Stock', ur: 'اسٹاک' },
  nav_sales: { en: 'Sales', ur: 'فروخت' },
  nav_purchase: { en: 'Purchase', ur: 'خریداری' },
  nav_reports: { en: 'Reports', ur: 'رپورٹس' },
  period_today: { en: 'today', ur: 'آج' },
  period_week: { en: 'week', ur: 'ہفتہ' },
  period_month: { en: 'month', ur: 'مہینہ' },
  stat_sales: { en: 'Total Sales', ur: 'کل فروخت' },
  stat_profit: { en: 'Total Profit', ur: 'کل منافع' },
  stat_items: { en: 'Items Sold', ur: 'فروخت شدہ اشیاء' },
  stat_purchases: { en: 'Purchases', ur: 'خریداری' },
  stat_udhaar: { en: 'Udhaar Outstanding', ur: ' Outstanding ادھار' },
  stat_expenses: { en: "Today's Expenses", ur: 'آج کے اخراجات' },
  pay_cash: { en: 'cash', ur: 'نقد' },
  pay_online: { en: 'online', ur: 'آن لائن' },
  pay_credit: { en: 'credit', ur: 'ادھار' },
  btn_save: { en: 'Save Settings', ur: 'محفوظ کریں' },
  btn_delete: { en: 'Delete', ur: 'حذف کریں' },
  btn_cancel: { en: 'Cancel', ur: 'منسوخ' },
  btn_complete: { en: 'Complete Sale', ur: 'فروخت مکمل کریں' },
  btn_receive: { en: 'Receive Payment', ur: 'وصولی' },
  btn_add: { en: 'Add', ur: 'شامل کریں' },
  btn_share: { en: 'Share Bill', ur: 'بل شیئر' },
  btn_copy: { en: 'Copy to Clipboard', ur: 'کاپی کریں' },
  sec_customers: { en: 'Customers', ur: 'گاہک' },
  sec_suppliers: { en: 'Suppliers', ur: 'سپلائرز' },
  sec_expenses: { en: 'Expenses', ur: 'اخراجات' },
  sec_wastage: { en: 'Wastage', ur: 'ضیاع' },
  sec_udhaar: { en: 'Udhaar Ledger', ur: 'ادھار کھاتہ' },
  sec_language: { en: 'Language', ur: 'زبان' },
  sec_target: { en: 'Daily Target', ur: 'روزانہ ہدف' },
  sec_pin: { en: 'PIN Lock', ur: 'پن لاک' },
  sec_business: { en: 'Business Tools', ur: 'کاروباری ٹولز' },
  sec_security: { en: 'Security', ur: 'سیکیورٹی' },
  set_target: { en: 'Set daily sales target (Rs)', ur: 'روزانہ فروخت کا ہدف (Rs)' },
  target_today: { en: "Today's Target", ur: 'آج کا ہدف' },
  target_achieved: { en: 'achieved', ur: 'حاصل ہوا' },
};

export function t(lang: Lang | undefined, key: string): string {
  const l = lang || 'en';
  return dict[key]?.[l] ?? dict[key]?.en ?? key;
}

export function getLabels(lang: Lang | undefined) {
  return {
    navDashboard: t(lang, 'nav_dashboard'),
    navStock: t(lang, 'nav_stock'),
    navSales: t(lang, 'nav_sales'),
    navPurchase: t(lang, 'nav_purchase'),
    navReports: t(lang, 'nav_reports'),
    payCash: t(lang, 'pay_cash'),
    payOnline: t(lang, 'pay_online'),
    payCredit: t(lang, 'pay_credit'),
  };
}

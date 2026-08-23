import { useEffect, useState } from 'react';
import { ShoppingCart, ImageIcon, IceCreamCone, GlassWater, Plus } from 'lucide-react';
import CartSheet from './CartSheet';
import EmptyState from '../common/EmptyState';
import ItemFormSheet from '../stock/ItemFormSheet';
import { useCartStore } from '../../store/useCartStore';
import { useAppStore } from '../../store/useAppStore';
import { getAllItems } from '../../db/queries';
import { CATEGORY_MACHINE } from '../../types';
import type { StockItem, AppSettings, MachineType } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface Props {
  settings: AppSettings;
  refreshKey: number;
}

export default function SalesPage({ settings, refreshKey }: Props) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const machineType = useCartStore((s) => s.machineType);
  const setMachineType = useCartStore((s) => s.setMachineType);
  const cart = useCartStore((s) => s.cart);
  const addToCart = useCartStore((s) => s.addToCart);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getTotal = useCartStore((s) => s.getTotal);
  const showToast = useAppStore((s) => s.showToast);
  const appRefreshKey = useAppStore((s) => s.refreshKey);

  useEffect(() => {
    getAllItems().then(setItems);
  }, [refreshKey, appRefreshKey, cartOpen, addItemOpen]);

  const machineItems = items.filter((i) => {
    const m = CATEGORY_MACHINE[i.category];
    return (m === machineType || m === 'both') && i.sellPrice > 0;
  });

  function handleTap(item: StockItem) {
    if (item.currentStock <= 0) {
      showToast('Out of stock!', 'error');
      return;
    }
    addToCart(item);
    showToast(`Added ${item.name}`, 'success');
  }

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
      {/* Machine tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
        <button
          onClick={() => setMachineType('ice_cream' as MachineType)}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 tap-scale ${
            machineType === 'ice_cream' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          <IceCreamCone size={15} /> Ice Cream
        </button>
        <button
          onClick={() => setMachineType('juice' as MachineType)}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 tap-scale ${
            machineType === 'juice' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          <GlassWater size={15} /> Juice
        </button>
      </div>

      {/* Item grid */}
      {machineItems.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No items for this machine" subtitle="Tap the + button below to add a new sellable item with its price" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {machineItems.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id);
            const isOut = item.currentStock <= 0;
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item)}
                disabled={isOut}
                className={`relative bg-white rounded-2xl border p-3 text-left tap-scale ${
                  inCart ? 'border-brand-400 ring-1 ring-brand-400' : 'border-gray-100'
                } ${isOut ? 'opacity-40' : ''}`}
              >
                <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center mb-2 overflow-hidden">
                  {item.photoPath ? (
                    <img src={item.photoPath} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <ImageIcon size={22} className="text-gray-300" />
                  )}
                </div>
                <p className="text-[12.5px] font-bold text-gray-900 truncate">{item.name}</p>
                {item.variant && <p className="text-[10.5px] text-gray-400 truncate">{item.variant}</p>}
                <p className="text-[13px] font-bold text-brand-600 mt-1">{formatCurrency(item.sellPrice, settings.currency)}</p>
                {isOut && <span className="absolute top-2 right-2 text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">OUT</span>}
                {inCart && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                    {inCart.qty}
                  </span>
                )}
              </button>
            );
          })}

          {/* Add new sellable item tile */}
          <button
            onClick={() => setAddItemOpen(true)}
            className="rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 py-6 tap-scale"
          >
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
              <Plus size={18} className="text-brand-500" />
            </div>
            <span className="text-[11.5px] font-semibold text-gray-500">Add Item</span>
          </button>
        </div>
      )}

      {/* Floating cart button */}
      {getItemCount() > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto bg-gray-900 text-white rounded-2xl py-3.5 px-5 flex items-center justify-between tap-scale shadow-xl z-30"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart size={18} />
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-brand-500 text-[9px] font-bold flex items-center justify-center">
                {getItemCount()}
              </span>
            </div>
            <span className="text-[13px] font-semibold">View Cart</span>
          </div>
          <span className="text-[15px] font-bold">{formatCurrency(getTotal(), settings.currency)}</span>
        </button>
      )}

      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} settings={settings} />
      <ItemFormSheet isOpen={addItemOpen} onClose={() => setAddItemOpen(false)} editingItem={null} />
    </div>
  );
}

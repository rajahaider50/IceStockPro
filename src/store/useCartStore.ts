import { create } from 'zustand';
import type { CartEntry, StockItem, MachineType } from '../types';

interface CartState {
  machineType: MachineType;
  cart: CartEntry[];
  setMachineType: (m: MachineType) => void;
  addToCart: (item: StockItem) => void;
  removeFromCart: (itemId: number) => void;
  incrementQty: (itemId: number) => void;
  decrementQty: (itemId: number) => void;
  setQty: (itemId: number, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  machineType: 'ice_cream',
  cart: [],

  setMachineType: (m) => set({ machineType: m, cart: [] }),

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.item.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }
      return { cart: [...state.cart, { item, qty: 1 }] };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.item.id !== itemId) })),

  incrementQty: (itemId) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.item.id === itemId ? { ...c, qty: c.qty + 1 } : c
      ),
    })),

  decrementQty: (itemId) =>
    set((state) => {
      const target = state.cart.find((c) => c.item.id === itemId);
      if (target && target.qty <= 1) {
        return { cart: state.cart.filter((c) => c.item.id !== itemId) };
      }
      return {
        cart: state.cart.map((c) =>
          c.item.id === itemId ? { ...c, qty: c.qty - 1 } : c
        ),
      };
    }),

  setQty: (itemId, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { cart: state.cart.filter((c) => c.item.id !== itemId) };
      }
      return {
        cart: state.cart.map((c) => (c.item.id === itemId ? { ...c, qty } : c)),
      };
    }),

  clearCart: () => set({ cart: [] }),

  getTotal: () => get().cart.reduce((s, c) => s + c.qty * c.item.sellPrice, 0),

  getItemCount: () => get().cart.reduce((s, c) => s + c.qty, 0),
}));

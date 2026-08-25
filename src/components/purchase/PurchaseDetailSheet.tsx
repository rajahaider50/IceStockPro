import { useState } from 'react';
import { Trash2, ImageIcon, Package, User, StickyNote, Calendar } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { deletePurchase } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../utils/calculations';
import type { PurchaseRecord, AppSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchase: PurchaseRecord | null;
  settings: AppSettings;
}

export default function PurchaseDetailSheet({ isOpen, onClose, purchase, settings }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  if (!purchase) return null;

  async function handleDelete() {
    if (!purchase?.id) return;
    setDeleting(true);
    try {
      await deletePurchase(purchase.id);
      showToast('Purchase deleted, stock adjusted back');
      triggerRefresh();
      setConfirmOpen(false);
      onClose();
    } catch {
      showToast('Failed to delete purchase', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Purchase Details">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {purchase.receiptPhotoPath ? (
                <img src={purchase.receiptPhotoPath} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-gray-300" />
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-[16px] font-bold text-gray-900">{purchase.itemNameSnapshot}</p>
            <p className="text-[22px] font-bold text-brand-600 mt-1">
              {formatCurrency(purchase.totalCost, settings.currency)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 bg-gray-50 rounded-2xl p-4">
            <Row icon={Package} label="Quantity" value={`${purchase.quantity} units @ ${formatCurrency(purchase.purchasePrice, settings.currency)} each`} />
            <Row icon={Calendar} label="Date" value={formatDateTime(purchase.date)} />
            {purchase.supplierName && <Row icon={User} label="Supplier" value={purchase.supplierName} />}
            {purchase.notes && <Row icon={StickyNote} label="Notes" value={purchase.notes} />}
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
          >
            <Trash2 size={15} /> Delete This Purchase
          </button>
          <p className="text-[10.5px] text-gray-400 text-center leading-relaxed -mt-2">
            Deleting will remove this purchase and automatically subtract the quantity back out of stock.
          </p>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete this purchase?"
        message={`This will remove the purchase record and reduce ${purchase.itemNameSnapshot} stock by ${purchase.quantity} unit(s). This cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10.5px] text-gray-400 font-medium">{label}</p>
        <p className="text-[12.5px] font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Trash2, IceCreamCone, GlassWater, Calendar, CreditCard, StickyNote } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteSale } from '../../db/queries';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatDateTime } from '../../utils/calculations';
import type { SaleRecord, AppSettings } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  settings: AppSettings;
}

export default function SaleDetailSheet({ isOpen, onClose, sale, settings }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const triggerRefresh = useAppStore((s) => s.triggerRefresh);

  if (!sale) return null;

  async function handleDelete() {
    if (!sale?.id) return;
    setDeleting(true);
    try {
      await deleteSale(sale.id);
      showToast('Sale voided, stock restored');
      triggerRefresh();
      setConfirmOpen(false);
      onClose();
    } catch {
      showToast('Failed to delete sale', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Sale Details">
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${sale.machineType === 'ice_cream' ? 'bg-pink-100' : 'bg-orange-100'}`}>
              {sale.machineType === 'ice_cream' ? (
                <IceCreamCone size={26} className="text-pink-500" />
              ) : (
                <GlassWater size={26} className="text-orange-500" />
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-[22px] font-bold text-gray-900">{formatCurrency(sale.totalAmount, settings.currency)}</p>
            <p className="text-[11.5px] text-emerald-600 font-semibold mt-0.5">
              Profit: {formatCurrency(sale.totalProfit, settings.currency)}
            </p>
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-2 bg-gray-50 rounded-2xl p-3.5">
            {sale.items.map((line, idx) => (
              <div key={idx} className="flex items-center justify-between text-[12.5px]">
                <span className="font-semibold text-gray-800 truncate pr-2">
                  {line.itemNameSnapshot} <span className="text-gray-400 font-medium">x{line.qty}</span>
                </span>
                <span className="font-bold text-gray-900 shrink-0">{formatCurrency(line.lineTotal, settings.currency)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <Row icon={Calendar} label="Date & Time" value={formatDateTime(sale.date)} />
            <Row icon={CreditCard} label="Payment Mode" value={sale.paymentMode} />
            {sale.customerNote && <Row icon={StickyNote} label="Note" value={sale.customerNote} />}
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-[13px] flex items-center justify-center gap-2 tap-scale"
          >
            <Trash2 size={15} /> Delete / Void This Sale
          </button>
          <p className="text-[10.5px] text-gray-400 text-center leading-relaxed -mt-2">
            Deleting will remove this sale from your reports and automatically add the sold quantity back into stock.
          </p>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete this sale?"
        message="This will remove the sale from your records and put the sold items back into stock. This cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10.5px] text-gray-400 font-medium">{label}</p>
        <p className="text-[12.5px] font-semibold text-gray-800 capitalize break-words">{value}</p>
      </div>
    </div>
  );
}

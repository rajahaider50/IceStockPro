import { Mail, Phone, Globe, ExternalLink, Code2, Heart, Shield, Calendar, Package } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutSheet({ isOpen, onClose }: Props) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="About / Developer Info">
      <div className="flex flex-col gap-5 pb-6">
        {/* App Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Package size={36} className="text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-[18px] font-bold text-gray-900">IceStock Pro</h3>
            <p className="text-[12px] text-gray-400">Professional POS & Inventory System</p>
            <p className="text-[11px] text-gray-400 mt-1">Version 6.0.0</p>
          </div>
        </div>

        {/* Developer Info */}
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center">
              <Code2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Raja Haider</p>
              <p className="text-[11px] text-gray-500">Full Stack Developer</p>
            </div>
          </div>
          <p className="text-[12px] text-gray-600 leading-relaxed">
            Specialized in modern web applications, POS systems, and inventory management solutions.
            Building tools that help businesses grow.
          </p>
        </div>

        {/* Contact Details */}
        <div>
          <p className="text-[12px] font-bold text-gray-500 mb-2">Contact Developer</p>
          <div className="flex flex-col gap-2">
            <a href="mailto:rajahaider9053@gmail.com"
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800">Email</p>
                <p className="text-[11px] text-gray-400 truncate">rajahaider9053@gmail.com</p>
              </div>
              <ExternalLink size={14} className="text-gray-300" />
            </a>

            <a href="https://wa.me/923495031007" target="_blank" rel="noopener"
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Phone size={16} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800">WhatsApp</p>
                <p className="text-[11px] text-gray-400">+92 349 5031007</p>
              </div>
              <ExternalLink size={14} className="text-gray-300" />
            </a>

            <a href="https://github.com/rajahaider50" target="_blank" rel="noopener"
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Globe size={16} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-800">GitHub</p>
                <p className="text-[11px] text-gray-400">github.com/rajahaider50</p>
              </div>
              <ExternalLink size={14} className="text-gray-300" />
            </a>
          </div>
        </div>

        {/* App Info */}
        <div>
          <p className="text-[12px] font-bold text-gray-500 mb-2">App Information</p>
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
            <InfoRow icon={Package} label="Version" value="6.0.0" />
            <InfoRow icon={Calendar} label="Last Updated" value="August 2026" />
            <InfoRow icon={Shield} label="License" value="MIT License" />
            <InfoRow icon={Code2} label="Built With" value="React 19 + TypeScript + Vite" />
            <InfoRow icon={Heart} label="Made With" value="Passion for great software" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 rounded-2xl p-3.5">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <span className="font-semibold">Disclaimer:</span> IceStock Pro is provided as-is. The developer is not responsible for any data loss. Always maintain regular backups. For support, contact via email or WhatsApp.
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-gray-400" />
        <span className="text-[11.5px] text-gray-500">{label}</span>
      </div>
      <span className="text-[11.5px] font-semibold text-gray-800">{value}</span>
    </div>
  );
}

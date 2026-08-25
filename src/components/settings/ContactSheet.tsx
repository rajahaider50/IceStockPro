import { Mail, Phone, MessageCircle, Globe, MapPin, Clock, ExternalLink } from 'lucide-react';
import BottomSheet from '../common/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSheet({ isOpen, onClose }: Props) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Contact Us / رابطہ">
      <div className="flex flex-col gap-4 pb-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={28} className="text-white" />
          </div>
          <p className="text-[14px] font-bold text-gray-900">Get in Touch</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Have questions, feedback, or need support? We are here to help!
          </p>
        </div>

        {/* Contact Methods */}
        <div className="flex flex-col gap-2">
          <ContactCard
            icon={Mail}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            title="Email Us"
            subtitle="rajahaider50@gmail.com"
            action="Send Email"
            href="mailto:rajahaider50@gmail.com?subject=IceStock%20Pro%20Support"
          />

          <ContactCard
            icon={Phone}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
            title="Call Us"
            subtitle="+92 300 1234567"
            action="Call Now"
            href="tel:+923001234567"
          />

          <ContactCard
            icon={MessageCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            title="WhatsApp"
            subtitle="Quick response within 24 hours"
            action="Chat on WhatsApp"
            href="https://wa.me/923001234567?text=Hi%2C%20I%20need%20help%20with%20IceStock%20Pro"
          />

          <ContactCard
            icon={Globe}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            title="GitHub"
            subtitle="Report issues & view source"
            action="Visit GitHub"
            href="https://github.com/rajahaider50/IceStockPro/issues"
          />
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-gray-500" />
            <p className="text-[12px] font-bold text-gray-600">Response Time</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-[11.5px] text-gray-500">Email Response</span>
              <span className="text-[11.5px] font-semibold text-gray-700">Within 24-48 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11.5px] text-gray-500">WhatsApp</span>
              <span className="text-[11.5px] font-semibold text-gray-700">Usually within 24 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11.5px] text-gray-500">Bug Fixes</span>
              <span className="text-[11.5px] font-semibold text-gray-700">1-3 business days</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-brand-500" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-gray-800">Location</p>
            <p className="text-[11px] text-gray-400">Pakistan</p>
          </div>
        </div>

        {/* Support Topics */}
        <div>
          <p className="text-[12px] font-bold text-gray-500 mb-2">We Can Help With</p>
          <div className="flex flex-wrap gap-2">
            {['Bug Reports', 'Feature Requests', 'Setup Help', 'Data Recovery', 'Custom Features', 'Integration'].map((topic) => (
              <span key={topic} className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 text-[11px] font-semibold">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[10.5px] text-gray-400 text-center">
          We value your feedback and strive to respond as quickly as possible.
        </p>
      </div>
    </BottomSheet>
  );
}

function ContactCard({ icon: Icon, iconBg, iconColor, title, subtitle, action, href }: {
  icon: typeof Mail;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  action: string;
  href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 tap-scale group">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-900">{title}</p>
        <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] font-semibold text-brand-500">{action}</span>
        <ExternalLink size={12} className="text-brand-400" />
      </div>
    </a>
  );
}

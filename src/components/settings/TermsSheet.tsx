import BottomSheet from '../common/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsSheet({ isOpen, onClose }: Props) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Terms & Conditions" maxHeight="90vh">
      <div className="flex flex-col gap-4 pb-6 text-[12px] text-gray-600 leading-relaxed">
        <Section title="1. Acceptance of Terms">
          By downloading, installing, or using IceStock Pro, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the application.
        </Section>

        <Section title="2. Description of Service">
          IceStock Pro is a offline Point-of-Sale and inventory management application. All data is stored locally on your device. No data is transmitted to external servers.
        </Section>

        <Section title="3. Data Responsibility">
          You are solely responsible for your data. IceStock Pro stores all data locally on your device. We recommend regular backups via the app's backup feature. We are not responsible for any data loss due to device failure, accidental deletion, or other circumstances.
        </Section>

        <Section title="4. Offline Usage">
          IceStock Pro works fully offline. No internet connection is required for core functionality. Internet may be needed for WhatsApp sharing and checking for updates.
        </Section>

        <Section title="5. Financial Accuracy">
          While IceStock Pro provides calculations for sales, profit, and inventory, it is your responsibility to verify all financial data. The app should be used as a supplementary tool, not as the sole record for tax or legal purposes.
        </Section>

        <Section title="6. Backup Policy">
          We strongly recommend creating regular backups using the app's built-in backup feature. Backups are your responsibility. The developer is not liable for lost data.
        </Section>

        <Section title="7. Intellectual Property">
          IceStock Pro and its original content, features, and functionality are owned by the developer and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </Section>

        <Section title="8. Limitation of Liability">
          In no event shall the developer be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application.
        </Section>

        <Section title="9. Updates and Changes">
          The developer reserves the right to modify or discontinue the application at any time. Updates may be provided to add features, fix bugs, or improve performance.
        </Section>

        <Section title="10. Contact">
          For any questions about these Terms, please contact:
          Email: rajahaider9053@gmail.com
          WhatsApp: +92 349 5031007
        </Section>

        <p className="text-[11px] text-gray-400 text-center mt-2">
          Last updated: August 2026
        </p>
      </div>
    </BottomSheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[13px] font-bold text-gray-800 mb-1">{title}</h4>
      <p>{children}</p>
    </div>
  );
}

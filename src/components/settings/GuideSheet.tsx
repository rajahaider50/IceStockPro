import { useRef, useState, type ReactNode } from 'react';
import {
  LayoutGrid, Package, ShoppingCart, Truck, BarChart3, Settings as SettingsIcon,
  Plus, Search, Tag, Pencil, Trash2, Download, Upload, Camera, ImagePlus, X,
  Sun, Moon, Smartphone, Check, Minus, Bell, ChevronRight, IceCreamCone, GlassWater,
  AlertTriangle, Info, Sparkles, Store, FileText, FileDown, Calendar, Layers,
  BookOpen, Languages, TrendingUp, PackageX,
} from 'lucide-react';
import BottomSheet from '../common/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Lang = 'roman' | 'urdu' | 'both';

// ---------- Bilingual text helpers ----------

function Bi({ lang, r, u, className = '' }: { lang: Lang; r: string; u: string; className?: string }) {
  if (lang === 'roman') return <p className={className}>{r}</p>;
  if (lang === 'urdu') return <p dir="rtl" className={`text-right leading-loose ${className}`}>{u}</p>;
  return (
    <div className="flex flex-col gap-1">
      <p className={className}>{r}</p>
      <p dir="rtl" className={`text-right leading-loose text-gray-500 ${className}`}>{u}</p>
    </div>
  );
}

function BiSteps({ lang, steps }: { lang: Lang; steps: { r: string; u: string }[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0 text-[12.5px] text-gray-700 font-medium">
            <Bi lang={lang} r={s.r} u={s.u} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function PreviewBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4">
      <p className="text-[9.5px] font-bold tracking-wide text-brand-500 uppercase mb-3">{label}</p>
      <div className="flex items-center justify-center flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

// ---------- Section wrapper ----------

function Section({
  id, icon: Icon, title, color, children, registerRef,
}: {
  id: string;
  icon: typeof LayoutGrid;
  title: string;
  color: string;
  children: ReactNode;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={(el) => registerRef(id, el)} className="scroll-mt-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={17} className="text-white" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
      </div>
      <div className="flex flex-col gap-5 mb-8">{children}</div>
    </div>
  );
}

function Block({ lang, heading, headingU, steps }: { lang: Lang; heading: string; headingU: string; steps: { r: string; u: string }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="mb-2.5">
        <Bi lang={lang} r={heading} u={headingU} className="text-[13px] font-bold text-gray-900" />
      </div>
      <BiSteps lang={lang} steps={steps} />
    </div>
  );
}

// ---------- Jump-chip nav ----------

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'stock', label: 'Stock' },
  { id: 'sales', label: 'Sales' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
  { id: 'photos', label: 'Photos' },
  { id: 'icons', label: 'Icons' },
  { id: 'tips', label: 'Tips' },
];

export default function GuideSheet({ isOpen, onClose }: Props) {
  const [lang, setLang] = useState<Lang>('roman');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function registerRef(id: string, el: HTMLDivElement | null) {
    sectionRefs.current[id] = el;
  }

  function jumpTo(id: string) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Complete Guide" maxHeight="94vh">
      <div ref={scrollRef} className="flex flex-col gap-5 pb-8">
        {/* Intro */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-4 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen size={16} />
            <p className="text-[13.5px] font-bold">IceStock Pro — Mukammal Rehnuma</p>
          </div>
          <p className="text-[11.5px] text-brand-50 leading-relaxed">
            Yeh guide app ke har button, har feature aur har screen ka istemal seedhe seedhe alfaz mein samjhati hai — sath mein asli button ka live preview bhi hai taake aap pehchan sakein wo kaise dikhta hai.
          </p>
        </div>

        {/* Language toggle */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <Languages size={13} className="text-gray-400" />
            <p className="text-[11px] font-semibold text-gray-500">Zaban / Language</p>
          </div>
          <div className="flex gap-2">
            {([
              { v: 'roman' as Lang, l: 'Roman Urdu' },
              { v: 'urdu' as Lang, l: 'اردو' },
              { v: 'both' as Lang, l: 'دونوں / Both' },
            ]).map((opt) => (
              <button
                key={opt.v}
                onClick={() => setLang(opt.v)}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold tap-scale ${
                  lang === opt.v ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Jump nav */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => jumpTo(n.id)}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold bg-white border border-gray-200 text-gray-600 tap-scale"
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100" />

        {/* ============ DASHBOARD ============ */}
        <Section id="dashboard" icon={LayoutGrid} title="Dashboard" color="bg-brand-500" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Dashboard kya hai?"
            headingU="ڈیش بورڈ کیا ہے؟"
            steps={[
              { r: 'App khulte hi sab se pehle Dashboard nazar aata hai. Yahan aapki dukaan ki mukammal report ek nazar mein mil jati hai.', u: 'ایپ کھلتے ہی سب سے پہلے ڈیش بورڈ نظر آتا ہے۔ یہاں آپ کی دکان کی مکمل رپورٹ ایک نظر میں مل جاتی ہے۔' },
              { r: 'Upar "Today / Week / Month" ke teen button hain — jis par tap karenge, wohi period ka data dikhega.', u: 'اوپر "Today / Week / Month" کے تین بٹن ہیں — جس پر ٹیپ کریں گے، وہی مدت کا ڈیٹا نظر آئے گا۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Period Toggle — button ka preview:" u="پیریڈ ٹوگل — بٹن کا پیش منظر:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="flex bg-gray-100 rounded-2xl p-1 w-full max-w-[220px]">
                <span className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-center bg-white text-brand-600 shadow-sm">Today</span>
                <span className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-center text-gray-500">Week</span>
                <span className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-center text-gray-500">Month</span>
              </div>
            </PreviewBox>
          </div>
          <Block
            lang={lang}
            heading="Red banner (Low Stock alert)"
            headingU="سرخ بینر (اسٹاک کم ہونے کا الرٹ)"
            steps={[
              { r: 'Agar koi item khatam hone ke qareeb ho to Dashboard ke upar aik surkh (red) banner khud nazar aayega.', u: 'اگر کوئی آئٹم ختم ہونے کے قریب ہو تو ڈیش بورڈ کے اوپر ایک سرخ بینر خود بخود نظر آئے گا۔' },
              { r: 'Us banner par tap karenge to poori low-stock list khul jayegi.', u: 'اس بینر پر ٹیپ کریں گے تو پوری لو اسٹاک لسٹ کھل جائے گی۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="4 Stat Cards ka matlab:" u="چار اسٹیٹ کارڈز کا مطلب:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="grid grid-cols-2 gap-2 w-full">
                <MiniStat icon={TrendingUp} bg="bg-brand-50" fg="text-brand-600" iconBg="bg-brand-500" label="Total Sales" value="Rs 4,500" />
                <MiniStat icon={TrendingUp} bg="bg-emerald-50" fg="text-emerald-600" iconBg="bg-emerald-500" label="Total Profit" value="Rs 1,800" />
                <MiniStat icon={ShoppingCart} bg="bg-violet-50" fg="text-violet-600" iconBg="bg-violet-500" label="Items Sold" value="62" />
                <MiniStat icon={PackageX} bg="bg-amber-50" fg="text-amber-600" iconBg="bg-amber-500" label="Purchases" value="Rs 2,000" />
              </div>
            </PreviewBox>
            <ol className="flex flex-col gap-1.5 mt-3 text-[12px] text-gray-600">
              <li><Bi lang={lang} r="• Total Sales = is period mein kitni bikri hui" u="• Total Sales = اس مدت میں کتنی بکری ہوئی" /></li>
              <li><Bi lang={lang} r="• Total Profit = bikri minus lagat (asli faida)" u="• Total Profit = بکری مائنس لاگت (اصل فائدہ)" /></li>
              <li><Bi lang={lang} r="• Items Sold = kitne total pieces bike" u="• Items Sold = کتنے کل پیس بکے" /></li>
              <li><Bi lang={lang} r="• Purchases = is period mein kitna maal khareeda" u="• Purchases = اس مدت میں کتنا مال خریدا" /></li>
            </ol>
          </div>
          <Block
            lang={lang}
            heading="Ice Cream / Juice split + 7-Din Chart + Top Selling Items"
            headingU="آئس کریم / جوس تقسیم + سات دن کا چارٹ + سب سے زیادہ بکنے والے آئٹمز"
            steps={[
              { r: 'Do chote cards Ice Cream aur Juice ki alag alag sale dikhate hain.', u: 'دو چھوٹے کارڈز آئس کریم اور جوس کی الگ الگ سیل دکھاتے ہیں۔' },
              { r: 'Line chart pichle 7 din ki sale aur profit ka trend dikhata hai (neeli line = sale, hari line = profit).', u: 'لائن چارٹ پچھلے سات دن کی سیل اور پرافٹ کا رجحان دکھاتا ہے (نیلی لائن = سیل، ہری لائن = پرافٹ)۔' },
              { r: '"Full Analytics" button par tap karke is hafte ke top-selling items ki ranking (1st, 2nd, 3rd) bhi dekh sakte hain.', u: '"Full Analytics" بٹن پر ٹیپ کر کے اس ہفتے کے ٹاپ سیلنگ آئٹمز کی رینکنگ (پہلا، دوسرا، تیسرا) بھی دیکھ سکتے ہیں۔' },
            ]}
          />
        </Section>

        {/* ============ STOCK ============ */}
        <Section id="stock" icon={Package} title="Stock (Maal)" color="bg-violet-500" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Stock tab kya karta hai?"
            headingU="اسٹاک ٹیب کیا کرتا ہے؟"
            steps={[
              { r: 'Yahan aapke tamam items (ice cream cups, juice, wafer cone, waghera) ki list hoti hai — kitna stock bacha hai, kitni price hai.', u: 'یہاں آپ کے تمام آئٹمز (آئس کریم کپ، جوس، ویفر کون وغیرہ) کی لسٹ ہوتی ہے — کتنا اسٹاک بچا ہے، کتنی قیمت ہے۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Naya item add karne wala '+' button (sab se ahem button):" u="نیا آئٹم ایڈ کرنے والا '+' بٹن (سب سے اہم بٹن):" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Add Button Preview / ایڈ بٹن کا پیش منظر">
              <div className="w-14 h-14 rounded-full bg-brand-500 shadow-xl shadow-brand-500/30 flex items-center justify-center">
                <Plus size={26} className="text-white" strokeWidth={2.5} />
              </div>
            </PreviewBox>
            <p className="text-[11px] text-gray-400 mt-2.5">
              <Bi lang={lang} r="Yeh gol neela button screen ke neeche, right corner mein hamesha nazar aata hai (isay FAB button kehte hain)." u="یہ گول نیلا بٹن اسکرین کے نیچے، دائیں کونے میں ہمیشہ نظر آتا ہے (اسے FAB بٹن کہتے ہیں)۔" />
            </p>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Is "+" button par tap karein — "Add New Item" form khul jayega.', u: 'اس "+" بٹن پر ٹیپ کریں — "Add New Item" فارم کھل جائے گا۔' },
                { r: 'Photo (optional), Item Name, Variant, Category, Unit, Current Stock, Purchase Price, Sell Price aur Low Stock Alert Threshold bharein.', u: 'فوٹو (اختیاری)، آئٹم کا نام، ورائینٹ، کیٹیگری، یونٹ، موجودہ اسٹاک، خریداری کی قیمت، فروخت کی قیمت اور لو اسٹاک الرٹ تھریش ہولڈ بھریں۔' },
                { r: 'Neeche neele "Add Item" button par tap karein — item save ho jayega.', u: 'نیچے نیلے "Add Item" بٹن پر ٹیپ کریں — آئٹم سیو ہو جائے گا۔' },
              ]}
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Item Edit / Delete kaise karein?" u="آئٹم ایڈٹ / ڈیلیٹ کیسے کریں؟" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="w-full flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                <div className="flex-1 text-[10.5px] font-bold text-gray-800">Ice Cream Cup · 20 Rs</div>
                <Pencil size={13} className="text-gray-300" />
              </div>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Kisi bhi item ki card (row) par direct tap karein — edit form khul jayega, dobara save karein.', u: 'کسی بھی آئٹم کی کارڈ (روو) پر براہ راست ٹیپ کریں — ایڈٹ فارم کھل جائے گا، دوبارہ سیو کریں۔' },
                { r: 'Delete karne ke liye edit form ke neeche surkh "Remove Item" button dabayein, phir confirm karein.', u: 'ڈیلیٹ کرنے کے لیے ایڈٹ فارم کے نیچے سرخ "Remove Item" بٹن دبائیں، پھر تصدیق کریں۔' },
                { r: 'Delete kiya hua item purani sales/purchase history se khud b khud nahi hataya jata — sirf naye list se hat jata hai.', u: 'ڈیلیٹ کیا ہوا آئٹم پرانی سیلز / خریداری ہسٹری سے خود بخود نہیں ہٹایا جاتا — صرف نئی لسٹ سے ہٹ جاتا ہے۔' },
              ]}
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Category Chips + Category Manage karna:" u="کیٹیگری چپس + کیٹیگری مینج کرنا:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <span className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-brand-500 text-white">All</span>
              <span className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-gray-200 text-gray-500">Cups</span>
              <span className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-600 border border-dashed border-brand-300 flex items-center gap-1">
                <Plus size={11} /> Category
              </span>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Item list ke upar category ke gol buttons (chips) hain — kisi bhi chip par tap karke sirf usi category ke items dekh sakte hain.', u: 'آئٹم لسٹ کے اوپر کیٹیگری کے گول بٹن (چپس) ہیں — کسی بھی چپ پر ٹیپ کر کے صرف اسی کیٹیگری کے آئٹمز دیکھ سکتے ہیں۔' },
                { r: 'Naya category banane ke liye "+ Category" chip ya settings wala gear icon (⚙) tap karein.', u: 'نئی کیٹیگری بنانے کے لیے "+ Category" چپ یا سیٹنگز والا گیئر آئیکن (⚙) ٹیپ کریں۔' },
                { r: 'Category ka naam likhein aur "Belongs To" mein Ice Cream / Juice / Both mein se select karein — phir Add dabayein.', u: 'کیٹیگری کا نام لکھیں اور "Belongs To" میں Ice Cream / Juice / Both میں سے سلیکٹ کریں — پھر Add دبائیں۔' },
                { r: 'Category ko edit (pencil icon) ya delete (trash icon) bhi kar sakte hain — lekin agar us category mein items maujood hain to pehle unhein hatana hoga.', u: 'کیٹیگری کو ایڈٹ (پنسل آئیکن) یا ڈیلیٹ (ٹریش آئیکن) بھی کر سکتے ہیں — لیکن اگر اس کیٹیگری میں آئٹمز موجود ہیں تو پہلے انہیں ہٹانا ہوگا۔' },
              ]}
            />
          </div>
          <Block
            lang={lang}
            heading="Search bar, Total Stock Value aur Export"
            headingU="سرچ بار، کل اسٹاک ویلیو اور ایکسپورٹ"
            steps={[
              { r: 'Upar search box mein item ka naam likh kar foran dhoond sakte hain.', u: 'اوپر سرچ باکس میں آئٹم کا نام لکھ کر فوراً ڈھونڈ سکتے ہیں۔' },
              { r: 'Sabse upar "Total Stock Value" batata hai ke aapke saare maujoodah maal ki lagat (cost) kitni hai.', u: 'سب سے اوپر "Total Stock Value" بتاتا ہے کہ آپ کے سارے موجودہ مال کی لاگت کتنی ہے۔' },
              { r: 'Download icon (⬇) se PDF report aur neeche "Export Stock List (CSV)" button se Excel/CSV file bana sakte hain.', u: 'ڈاؤن لوڈ آئیکن (⬇) سے PDF رپورٹ اور نیچے "Export Stock List (CSV)" بٹن سے ایکسل/CSV فائل بنا سکتے ہیں۔' },
            ]}
          />
        </Section>

        {/* ============ SALES ============ */}
        <Section id="sales" icon={ShoppingCart} title="Sales (Bikri)" color="bg-emerald-500" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Bikri kaise karein (POS style)?"
            headingU="بکری کیسے کریں (POS طریقہ)؟"
            steps={[
              { r: 'Sab se pehle upar Ice Cream ya Juice tab select karein — dono machines ke items alag alag dikhte hain.', u: 'سب سے پہلے اوپر Ice Cream یا Juice ٹیب سلیکٹ کریں — دونوں مشینوں کے آئٹمز الگ الگ نظر آتے ہیں۔' },
              { r: 'Jo item bik raha hai us ki tile (box) par tap karein — wo cart mein add ho jayega.', u: 'جو آئٹم بک رہا ہے اُس کی ٹائل (باکس) پر ٹیپ کریں — وہ کارٹ میں ایڈ ہو جائے گا۔' },
              { r: 'Baar baar tap karne se quantity khud badhti jayegi — tile ke upar chota badge number dikhayega.', u: 'بار بار ٹیپ کرنے سے مقدار خود بڑھتی جائے گی — ٹائل کے اوپر چھوٹا بیج نمبر دکھائے گا۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Item Tile ka Preview:" u="آئٹم ٹائل کا پیش منظر:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="relative bg-white rounded-2xl border border-brand-400 ring-1 ring-brand-400 p-2.5 w-28">
                <div className="w-full aspect-square rounded-xl bg-gray-100 mb-1.5" />
                <p className="text-[10px] font-bold text-gray-900 truncate">Ice Cream Cup</p>
                <p className="text-[10.5px] font-bold text-brand-600">Rs 20</p>
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-500 text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white">2</span>
              </div>
            </PreviewBox>
            <ol className="flex flex-col gap-1.5 mt-3 text-[12px] text-gray-600">
              <li><Bi lang={lang} r="• Neeli border = yeh item is waqt cart mein hai" u="• نیلی بارڈر = یہ آئٹم اس وقت کارٹ میں ہے" /></li>
              <li><Bi lang={lang} r="• 'OUT' surkh badge = stock khatam ho chuka" u="• 'OUT' سرخ بیج = اسٹاک ختم ہو چکا" /></li>
              <li><Bi lang={lang} r="• 'MAX' pila badge = jitna stock hai utna hi cart mein aa chuka" u="• 'MAX' پیلا بیج = جتنا اسٹاک ہے اتنا ہی کارٹ میں آ چکا" /></li>
            </ol>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Cart / Bill mukammal karna:" u="کارٹ / بل مکمل کرنا:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="w-full bg-gray-900 text-white rounded-2xl py-3 px-4 flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1.5"><ShoppingCart size={14} /> View Cart</span>
                <span className="font-bold">Rs 140</span>
              </div>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Neeche kaale rang ki bar mein cart ka total dikhta hai — us par tap karein.', u: 'نیچے کالے رنگ کی بار میں کارٹ کا کل نظر آتا ہے — اس پر ٹیپ کریں۔' },
                { r: 'Cart sheet mein har item ki quantity "+" aur "−" se kam zyada kar sakte hain, ya trash icon se hata sakte hain.', u: 'کارٹ شیٹ میں ہر آئٹم کی مقدار "+" اور "−" سے کم زیادہ کر سکتے ہیں، یا ٹریش آئیکن سے ہٹا سکتے ہیں۔' },
                { r: 'Payment Mode mein Cash / Online / Credit mein se select karein.', u: 'Payment Mode میں Cash / Online / Credit میں سے سلیکٹ کریں۔' },
                { r: 'Hara "Complete Sale" button dabayein — sale save ho jayegi aur stock khud kam ho jayega.', u: 'ہرا "Complete Sale" بٹن دبائیں — سیل سیو ہو جائے گی اور اسٹاک خود کم ہو جائے گا۔' },
              ]}
            />
          </div>
        </Section>

        {/* ============ PURCHASE ============ */}
        <Section id="purchase" icon={Truck} title="Purchase (Khareedari)" color="bg-amber-500" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Naya maal khareed kar record karna"
            headingU="نیا مال خرید کر ریکارڈ کرنا"
            steps={[
              { r: 'Purchase tab mein neeche daaen taraf wala "+" (FAB) button dabayein.', u: 'پرچیز ٹیب میں نیچے دائیں طرف والا "+" (FAB) بٹن دبائیں۔' },
              { r: 'Dropdown se wo item chunein jo khareeda hai — ya "New Item" se bilkul naya item bhi bana sakte hain.', u: 'ڈراپ ڈاؤن سے وہ آئٹم چنیں جو خریدا ہے — یا "New Item" سے بالکل نیا آئٹم بھی بنا سکتے ہیں۔' },
              { r: 'Quantity Bought aur Unit Cost bharein — Total Cost khud ba khud calculate ho jayega.', u: 'Quantity Bought اور Unit Cost بھریں — Total Cost خود بخود کیلکولیٹ ہو جائے گا۔' },
              { r: 'Supplier ka naam, notes aur receipt ki photo (optional) laga sakte hain.', u: 'سپلائر کا نام، نوٹس اور رسید کی فوٹو (اختیاری) لگا سکتے ہیں۔' },
              { r: '"Save Purchase" dabayein — is item ka stock khud badh jayega.', u: '"Save Purchase" دبائیں — اس آئٹم کا اسٹاک خود بڑھ جائے گا۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="✨ Naya Feature — Purchase Delete/Void karna:" u="✨ نیا فیچر — پرچیز ڈیلیٹ / ختم کرنا:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <button className="w-full py-2.5 rounded-2xl bg-red-50 text-red-600 font-semibold text-[12px] flex items-center justify-center gap-2">
                <Trash2 size={14} /> Delete This Purchase
              </button>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Ab Purchase list mein kisi bhi purani purchase entry par tap karein — poori detail khul jayegi.', u: 'اب پرچیز لسٹ میں کسی بھی پرانی پرچیز اینٹری پر ٹیپ کریں — پوری تفصیل کھل جائے گی۔' },
                { r: 'Agar ghalti se galat entry ho gayi ho to "Delete This Purchase" dabayein, phir confirm karein.', u: 'اگر غلطی سے غلط اینٹری ہو گئی ہو تو "Delete This Purchase" دبائیں، پھر تصدیق کریں۔' },
                { r: 'Delete hote hi us item ka stock khud ba khud utni hi quantity se wapis kam ho jayega — hisaab kitaab hamesha theek rahega.', u: 'ڈیلیٹ ہوتے ہی اس آئٹم کا اسٹاک خود بخود اتنی ہی مقدار سے واپس کم ہو جائے گا — حساب کتاب ہمیشہ ٹھیک رہے گا۔' },
              ]}
            />
          </div>
        </Section>

        {/* ============ REPORTS ============ */}
        <Section id="reports" icon={BarChart3} title="Reports (Report / Hisaab)" color="bg-pink-500" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Report kaise nikalein?"
            headingU="رپورٹ کیسے نکالیں؟"
            steps={[
              { r: 'Upar Today / This Week / This Month / All Time / Custom Range mein se koi bhi period chunein.', u: 'اوپر Today / This Week / This Month / All Time / Custom Range میں سے کوئی بھی مدت چنیں۔' },
              { r: 'Custom Range chunne par From Date aur To Date select karke "Search History" dabayein.', u: 'Custom Range چننے پر From Date اور To Date سلیکٹ کر کے "Search History" دبائیں۔' },
              { r: 'Neela gradient card us period ka Net Profit, Total Sales, Total Purchases, Items Sold aur Transactions dikhata hai.', u: 'نیلا گریڈینٹ کارڈ اس مدت کا Net Profit, Total Sales, Total Purchases, Items Sold اور Transactions دکھاتا ہے۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Custom Range button ka Preview:" u="Custom Range بٹن کا پیش منظر:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <span className="px-3.5 py-2 rounded-xl text-[11.5px] font-semibold bg-brand-500 text-white flex items-center gap-1.5">
                <Calendar size={13} /> Custom Range
              </span>
            </PreviewBox>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Export Buttons ka Preview:" u="ایکسپورٹ بٹنز کا پیش منظر:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="w-full flex flex-col gap-2">
                <div className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-brand-600" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-800">Sales Report (PDF)</span>
                </div>
                <div className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <FileDown size={16} className="text-brand-600" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-800">Sales Data (CSV)</span>
                </div>
              </div>
            </PreviewBox>
            <ol className="flex flex-col gap-1.5 mt-3 text-[12px] text-gray-600">
              <li><Bi lang={lang} r="• PDF icon = printable report banti hai (dukan ke record/print ke liye behtareen)" u="• PDF آئیکن = پرنٹ ہونے والی رپورٹ بنتی ہے (دکان کے ریکارڈ/پرنٹ کے لیے بہترین)" /></li>
              <li><Bi lang={lang} r="• CSV icon = Excel mein khulne wali file banti hai" u="• CSV آئیکن = ایکسل میں کھلنے والی فائل بنتی ہے" /></li>
            </ol>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="✨ Naya Feature — Sale Void/Delete karna:" u="✨ نیا فیچر — سیل ختم / ڈیلیٹ کرنا:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Neeche "Transaction History" list mein kisi bhi sale par tap karein — poori bill detail khul jayegi.', u: 'نیچے "Transaction History" لسٹ میں کسی بھی سیل پر ٹیپ کریں — پوری بل تفصیل کھل جائے گی۔' },
                { r: 'Agar ghalat bill ban gaya ho to "Delete / Void This Sale" dabayein, confirm karein.', u: 'اگر غلط بل بن گیا ہو تو "Delete / Void This Sale" دبائیں، تصدیق کریں۔' },
                { r: 'Sale delete hote hi bike hue items khud ba khud wapis stock mein aa jayenge.', u: 'سیل ڈیلیٹ ہوتے ہی بکے ہوئے آئٹمز خود بخود واپس اسٹاک میں آ جائیں گے۔' },
              ]}
            />
          </div>
        </Section>

        {/* ============ SETTINGS ============ */}
        <Section id="settings" icon={SettingsIcon} title="Settings" color="bg-gray-700" registerRef={registerRef}>
          <Block
            lang={lang}
            heading="Settings kaise kholein?"
            headingU="سیٹنگز کیسے کھولیں؟"
            steps={[
              { r: 'App ke sab se upar, header ke daaen taraf gear (⚙) icon par tap karein.', u: 'ایپ کے سب سے اوپر، ہیڈر کے دائیں طرف گیئر (⚙) آئیکن پر ٹیپ کریں۔' },
            ]}
          />
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Shop Name, Currency aur Appearance (Theme):" u="دکان کا نام، کرنسی اور تھیم:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="flex gap-1.5 w-full max-w-[220px]">
                <span className="flex-1 py-2 rounded-xl bg-brand-500 text-white flex flex-col items-center gap-0.5 text-[9px] font-semibold"><Sun size={13} /> Light</span>
                <span className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-500 flex flex-col items-center gap-0.5 text-[9px] font-semibold"><Moon size={13} /> Dark</span>
                <span className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-500 flex flex-col items-center gap-0.5 text-[9px] font-semibold"><Smartphone size={13} /> Auto</span>
              </div>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Shop Name aur Currency Symbol (jaise "Rs") type karke "Save Settings" dabayein.', u: 'دکان کا نام اور کرنسی کی علامت (جیسے "Rs") ٹائپ کر کے "Save Settings" دبائیں۔' },
                { r: 'Appearance mein Light, Dark ya Auto (mobile ki setting ke mutabiq) chun sakte hain.', u: 'Appearance میں Light، Dark یا Auto (موبائل کی سیٹنگ کے مطابق) چن سکتے ہیں۔' },
              ]}
            />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Backup, Restore aur Delete All Data:" u="بیک اپ، بحال کرنا اور تمام ڈیٹا ڈیلیٹ کرنا:" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="flex flex-col gap-1.5 w-full">
                <span className="py-2 rounded-2xl bg-emerald-50 text-emerald-600 font-semibold text-[11px] flex items-center justify-center gap-1.5"><Download size={13} /> Download Backup</span>
                <span className="py-2 rounded-2xl bg-amber-50 text-amber-600 font-semibold text-[11px] flex items-center justify-center gap-1.5"><Upload size={13} /> Restore from Backup</span>
                <span className="py-2 rounded-2xl bg-red-50 text-red-600 font-semibold text-[11px] flex items-center justify-center gap-1.5"><Trash2 size={13} /> Delete All Data</span>
              </div>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: '"Download Backup" (hara) sab data ki aik .json file bana kar mobile mein save kar deta hai — hafta-waar zaroor karein.', u: '"Download Backup" (ہرا) سارا ڈیٹا کی ایک .json فائل بنا کر موبائل میں محفوظ کر دیتا ہے — ہفتہ وار ضرور کریں۔' },
                { r: '"Restore from Backup" (pila) purani .json file select karke sara data wapis la sakte hain (agar phone badla ya app dobara install ki).', u: '"Restore from Backup" (پیلا) پرانی .json فائل سلیکٹ کر کے سارا ڈیٹا واپس لا سکتے ہیں (اگر فون بدلا یا ایپ دوبارہ انسٹال کی)۔' },
                { r: '"Delete All Data" (surkh, sab se khatarnak) hamesha ke liye sab kuch mita deta hai — do dafa confirm mangta hai, "DELETE" type karna zaroori hai. Pehle Backup zaroor le lein!', u: '"Delete All Data" (سرخ، سب سے خطرناک) ہمیشہ کے لیے سب کچھ مٹا دیتا ہے — دو دفعہ تصدیق مانگتا ہے، "DELETE" ٹائپ کرنا ضروری ہے۔ پہلے بیک اپ ضرور لے لیں!' },
              ]}
            />
            <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3 mt-3">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <Bi lang={lang} r="Yeh warning screen har khatarnak (danger) action se pehle nazar aayegi — dobara sochne ka mauqa deti hai." u="یہ وارننگ اسکرین ہر خطرناک عمل سے پہلے نظر آئے گی — دوبارہ سوچنے کا موقع دیتی ہے۔" className="text-[11px] text-red-600 font-medium" />
            </div>
          </div>
          <Block
            lang={lang}
            heading="Yeh Guide khud kahan milti hai?"
            headingU="یہ گائیڈ خود کہاں ملتی ہے؟"
            steps={[
              { r: 'Settings ke andar upar "Complete Guide / مکمل گائیڈ" wali row hamesha maujood hai — jab bhi zaroorat ho yahin se dobara khol sakte hain.', u: 'سیٹنگز کے اندر اوپر "Complete Guide / مکمل گائیڈ" والی روو ہمیشہ موجود ہے — جب بھی ضرورت ہو یہیں سے دوبارہ کھول سکتے ہیں۔' },
            ]}
          />
        </Section>

        {/* ============ PHOTOS ============ */}
        <Section id="photos" icon={Camera} title="Photo Lagana" color="bg-mint-500" registerRef={registerRef}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <Bi lang={lang} r="Item ya Receipt ki photo kaise lagayein?" u="آئٹم یا رسید کی فوٹو کیسے لگائیں؟" className="text-[13px] font-bold text-gray-900 mb-3" />
            <PreviewBox label="Preview / پیش منظر">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Camera size={20} className="text-gray-400" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                  <X size={9} className="text-white" />
                </div>
              </div>
            </PreviewBox>
            <PreviewBox label="Action Sheet Preview / آپشن شیٹ کا پیش منظر">
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center"><Camera size={12} className="text-white" /></div>
                  <span className="text-[10.5px] font-semibold text-gray-800">Take Photo</span>
                </div>
                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2">
                  <div className="w-6 h-6 rounded-lg bg-mint-500 flex items-center justify-center"><ImagePlus size={12} className="text-white" /></div>
                  <span className="text-[10.5px] font-semibold text-gray-800">Choose from Gallery</span>
                </div>
              </div>
            </PreviewBox>
            <BiSteps
              lang={lang}
              steps={[
                { r: 'Item ya Purchase form mein gol camera icon par tap karein.', u: 'آئٹم یا پرچیز فارم میں گول کیمرہ آئیکن پر ٹیپ کریں۔' },
                { r: 'Aik sheet khulegi jisme "Take Photo" (camera se seedhi photo) ya "Choose from Gallery" (pehle se maujood photo) chun sakte hain.', u: 'ایک شیٹ کھلے گی جس میں "Take Photo" (کیمرہ سے سیدھی فوٹو) یا "Choose from Gallery" (پہلے سے موجود فوٹو) چن سکتے ہیں۔' },
                { r: 'Photo lag jaane ke baad usay hatane ke liye upar chota (X) icon ya "Remove Photo" option use karein.', u: 'فوٹو لگ جانے کے بعد اسے ہٹانے کے لیے اوپر چھوٹا (X) آئیکن یا "Remove Photo" آپشن استعمال کریں۔' },
              ]}
            />
          </div>
        </Section>

        {/* ============ ICON LEGEND ============ */}
        <Section id="icons" icon={Info} title="Icons ka Matlab" color="bg-sky-500" registerRef={registerRef}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-3">
              <IconLegend icon={Plus} label={lang === 'urdu' ? 'نیا شامل کریں' : 'Naya Add karein'} />
              <IconLegend icon={Pencil} label={lang === 'urdu' ? 'ترمیم کریں' : 'Edit karein'} />
              <IconLegend icon={Trash2} label={lang === 'urdu' ? 'حذف کریں' : 'Delete karein'} />
              <IconLegend icon={Search} label={lang === 'urdu' ? 'تلاش کریں' : 'Search karein'} />
              <IconLegend icon={Download} label={lang === 'urdu' ? 'ڈاؤن لوڈ / ایکسپورٹ' : 'Download / Export'} />
              <IconLegend icon={Upload} label={lang === 'urdu' ? 'اپ لوڈ / بحال' : 'Upload / Restore'} />
              <IconLegend icon={Bell} label={lang === 'urdu' ? 'اسٹاک الرٹ' : 'Low Stock Alert'} />
              <IconLegend icon={ChevronRight} label={lang === 'urdu' ? 'مزید کھولیں' : 'Aage kholein'} />
              <IconLegend icon={Tag} label={lang === 'urdu' ? 'کیٹیگری' : 'Category'} />
              <IconLegend icon={Layers} label={lang === 'urdu' ? 'دونوں مشینیں' : 'Both Machines'} />
              <IconLegend icon={IceCreamCone} label={lang === 'urdu' ? 'آئس کریم' : 'Ice Cream'} />
              <IconLegend icon={GlassWater} label={lang === 'urdu' ? 'جوس' : 'Juice'} />
              <IconLegend icon={AlertTriangle} label={lang === 'urdu' ? 'خطرناک عمل' : 'Khatarnak Action'} />
              <IconLegend icon={Check} label={lang === 'urdu' ? 'مکمل / تصدیق' : 'Complete / Confirm'} />
              <IconLegend icon={Minus} label={lang === 'urdu' ? 'مقدار کم کریں' : 'Qty kam karein'} />
              <IconLegend icon={Store} label={lang === 'urdu' ? 'دکان کی معلومات' : 'Shop Info'} />
            </div>
          </div>
        </Section>

        {/* ============ TIPS ============ */}
        <Section id="tips" icon={Sparkles} title="Zaroori Mashware" color="bg-orange-500" registerRef={registerRef}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
            <TipRow lang={lang} r="Aapka sara data sirf isi mobile mein mehfooz hota hai — koi internet ya cloud account nahi chahiye. Isliye hafte mein aik dafa Settings se 'Download Backup' zaroor karein." u="آپ کا سارا ڈیٹا صرف اسی موبائل میں محفوظ ہوتا ہے — کوئی انٹرنیٹ یا کلاؤڈ اکاؤنٹ نہیں چاہیے۔ اس لیے ہفتے میں ایک دفعہ Settings سے 'Download Backup' ضرور کریں۔" />
            <TipRow lang={lang} r="Low Stock Alert Threshold woh number hai jis se neeche stock aane par 'LOW' warning aati hai — har item ke liye apni zaroorat ke mutabiq set karein." u="Low Stock Alert Threshold وہ نمبر ہے جس سے نیچے اسٹاک آنے پر 'LOW' وارننگ آتی ہے — ہر آئٹم کے لیے اپنی ضرورت کے مطابق سیٹ کریں۔" />
            <TipRow lang={lang} r="Sale ya Purchase mein ghalti ho jaye to gabrayein nahi — Reports/Purchase list mein us entry par tap kar ke 'Delete' se theek kiya ja sakta hai, stock khud theek ho jata hai." u="سیل یا پرچیز میں غلطی ہو جائے تو گھبرائیں نہیں — Reports/Purchase لسٹ میں اُس اینٹری پر ٹیپ کر کے 'Delete' سے ٹھیک کیا جا سکتا ہے، اسٹاک خود ٹھیک ہو جاتا ہے۔" />
            <TipRow lang={lang} r="Neeche 5 tabs hamesha maujood hain: Dashboard, Stock, Sales, Purchase, Reports — jis par tap karenge wahi khul jayega." u="نیچے پانچ ٹیبز ہمیشہ موجود ہیں: Dashboard, Stock, Sales, Purchase, Reports — جس پر ٹیپ کریں گے وہی کھل جائے گا۔" />
            <TipRow lang={lang} r="Screen ke neeche chote messages (toast) — jaise 'Item added' ya 'Sale completed!' — sirf 1-2 second ke liye dikh kar khud ghayab ho jate hain, yeh sirf tasdeeq ke liye hote hain." u="اسکرین کے نیچے چھوٹے میسج (toast) — جیسے 'Item added' یا 'Sale completed!' — صرف ایک دو سیکنڈ کے لیے دکھ کر خود غائب ہو جاتے ہیں، یہ صرف تصدیق کے لیے ہوتے ہیں۔" />
          </div>
        </Section>

        <div className="rounded-2xl bg-gray-50 p-4 flex items-start gap-2.5">
          <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <Bi
            lang={lang}
            r="Yeh guide hamesha Settings mein maujood rahegi. Jab bhi koi feature bhool jayein, yahan dobara aa kar dekh sakte hain."
            u="یہ گائیڈ ہمیشہ سیٹنگز میں موجود رہے گی۔ جب بھی کوئی فیچر بھول جائیں، یہاں دوبارہ آ کر دیکھ سکتے ہیں۔"
            className="text-[11px] text-gray-400 leading-relaxed"
          />
        </div>
      </div>
    </BottomSheet>
  );
}

function MiniStat({ icon: Icon, bg, fg, iconBg, label, value }: { icon: typeof TrendingUp; bg: string; fg: string; iconBg: string; label: string; value: string }) {
  return (
    <div className={`rounded-xl ${bg} p-2.5 flex flex-col gap-1.5`}>
      <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon size={12} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-900 leading-tight">{value}</p>
        <p className={`text-[8.5px] font-medium leading-tight ${fg}`}>{label}</p>
      </div>
    </div>
  );
}

function IconLegend({ icon: Icon, label }: { icon: typeof Plus; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-gray-600" />
      </div>
      <span className="text-[11.5px] font-medium text-gray-700">{label}</span>
    </div>
  );
}

function TipRow({ lang, r, u }: { lang: Lang; r: string; u: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
      <div className="text-[12px] text-gray-600 leading-relaxed">
        <Bi lang={lang} r={r} u={u} />
      </div>
    </div>
  );
}

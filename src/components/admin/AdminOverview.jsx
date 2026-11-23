import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Wallet, CheckCircle2, Clock, Package, PackageX, AlertTriangle,
  Eye, EyeOff, Tags, ImageOff, TrendingUp, ArrowRight, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { STATUS_OPTIONS, shopConfig, parseAdminQuotation, formatThaiDate } from '../../lib/quotationUtils';

const LOW_STOCK_THRESHOLD = 5;
const SHOP_TABS = ['pk', '888'];
const SHOP_TAB_TO_MENU = { pk: 'issue_quotation', 888: 'issue_quotation_888' };
const PERIODS = [
  { id: 'month', label: 'เดือนนี้' },
  { id: 'year', label: 'ปีนี้' },
  { id: 'all', label: 'ทั้งหมด' }
];
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const STEP_STYLES = {
  quoted: { bar: 'bg-blue-500', text: 'text-blue-700', soft: 'bg-blue-50 border-blue-100' },
  delivery_sent: { bar: 'bg-amber-500', text: 'text-amber-700', soft: 'bg-amber-50 border-amber-100' },
  receipt_sent: { bar: 'bg-purple-500', text: 'text-purple-700', soft: 'bg-purple-50 border-purple-100' },
  paid: { bar: 'bg-emerald-500', text: 'text-emerald-700', soft: 'bg-emerald-50 border-emerald-100' }
};

const pad = (n) => String(n).padStart(2, '0');
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const baht = (n) => `฿${(Number(n) || 0).toLocaleString('th-TH', { maximumFractionDigits: 2 })}`;
const issueDateOf = (q) => q.statusDates?.quoted || q.date || (q.created_at ? q.created_at.split('T')[0] : '');
const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(todayKey()) - new Date(dateStr);
  return isNaN(diff) ? null : Math.max(0, Math.floor(diff / 86400000));
};

const inPeriod = (dateStr, period) => {
  if (period === 'all') return true;
  if (!dateStr) return false;
  const today = todayKey();
  if (period === 'year') return dateStr.slice(0, 4) === today.slice(0, 4);
  return dateStr.slice(0, 7) === today.slice(0, 7);
};

const StatCard = ({ title, value, sub, icon, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 truncate">{value}</h3>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>
  </div>
);

const SectionHeader = ({ title, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {children}
  </div>
);

const AdminOverview = ({ onNavigateTab }) => {
  const [shopTab, setShopTab] = useState('pk');
  const [period, setPeriod] = useState('month');
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, pRes, cRes] = await Promise.all([
        supabase.from('quotations').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, price, stock_quantity, is_active, category_id, image_url'),
        supabase.from('categories').select('id, name')
      ]);
      setQuotations((qRes.data || []).map(parseAdminQuotation).filter(Boolean));
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error('Error loading overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- ใบเสนอราคา (คำนวณแยกตามร้านที่เลือก) ----------
  const qtStats = useMemo(() => {
    const shopQts = quotations.filter(q => q.shopType === shopTab);
    const periodQts = shopQts.filter(q => inPeriod(issueDateOf(q), period));

    const totalValue = periodQts.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0);
    const paidQts = shopQts.filter(q => q.status === 'paid' && inPeriod(q.statusDates?.paid, period));
    const paidValue = paidQts.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0);
    const unpaidQts = shopQts.filter(q => q.status !== 'paid');
    const outstandingValue = unpaidQts.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0);

    const steps = STATUS_OPTIONS.map(opt => {
      const list = periodQts.filter(q => q.status === opt.id);
      return {
        ...opt,
        count: list.length,
        value: list.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0)
      };
    });

    // กราฟ 6 เดือนล่าสุด
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      months.push({
        key,
        label: `${THAI_MONTHS[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`,
        issued: shopQts.filter(q => issueDateOf(q).slice(0, 7) === key)
          .reduce((s, q) => s + (Number(q.totalAmount) || 0), 0),
        paid: shopQts.filter(q => q.status === 'paid' && (q.statusDates?.paid || '').slice(0, 7) === key)
          .reduce((s, q) => s + (Number(q.totalAmount) || 0), 0)
      });
    }
    const monthMax = Math.max(1, ...months.map(m => Math.max(m.issued, m.paid)));

    // ค้างรับเงิน: ส่งใบส่งของ/ใบเสร็จแล้วแต่ยังไม่ได้รับเงิน
    const awaiting = shopQts
      .filter(q => q.status === 'delivery_sent' || q.status === 'receipt_sent')
      .map(q => {
        const since = q.statusDates?.[q.status] || issueDateOf(q);
        return { ...q, since, waitDays: daysSince(since) };
      })
      .sort((a, b) => (a.since || '').localeCompare(b.since || ''));

    const latest = [...shopQts]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 5);

    // สินค้าที่ออกใบเสนอราคาบ่อยที่สุด
    const itemMap = new Map();
    periodQts.forEach(q => {
      (q.items || []).forEach(it => {
        const name = (it.description || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        const cur = itemMap.get(key) || { name, unit: it.unit || '', qty: 0, value: 0, docs: 0 };
        cur.qty += Number(it.quantity) || 0;
        cur.value += (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
        cur.docs += 1;
        itemMap.set(key, cur);
      });
    });
    const topItems = [...itemMap.values()].sort((a, b) => b.qty - a.qty || b.value - a.value).slice(0, 10);

    return {
      count: periodQts.length, totalValue, paidValue, paidCount: paidQts.length,
      outstandingValue, outstandingCount: unpaidQts.length,
      steps, months, monthMax, awaiting, latest, topItems
    };
  }, [quotations, shopTab, period]);

  // ---------- สินค้า ----------
  const productStats = useMemo(() => {
    const active = products.filter(p => p.is_active);
    const outOfStock = active.filter(p => (Number(p.stock_quantity) || 0) <= 0);
    const lowStock = active
      .filter(p => {
        const s = Number(p.stock_quantity) || 0;
        return s > 0 && s <= LOW_STOCK_THRESHOLD;
      })
      .sort((a, b) => a.stock_quantity - b.stock_quantity);

    const catName = new Map(categories.map(c => [c.id, c.name]));
    const byCat = new Map();
    products.forEach(p => {
      const name = catName.get(p.category_id) || 'ไม่มีหมวดหมู่';
      byCat.set(name, (byCat.get(name) || 0) + 1);
    });
    const categoryCounts = [...byCat.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const catMax = Math.max(1, ...categoryCounts.map(c => c.count));

    const needsReview = products
      .filter(p => !p.image_url || !p.category_id || !(Number(p.price) > 0))
      .map(p => ({
        ...p,
        issues: [
          !p.image_url && 'ไม่มีรูป',
          !p.category_id && 'ไม่มีหมวด',
          !(Number(p.price) > 0) && 'ราคา 0'
        ].filter(Boolean)
      }));

    return {
      total: products.length,
      active: active.length,
      inactive: products.length - active.length,
      outOfStock: outOfStock.length,
      lowStock,
      categoryCounts,
      catMax,
      needsReview
    };
  }, [products, categories]);

  const shop = shopConfig[shopTab];
  const periodLabel = PERIODS.find(p => p.id === period)?.label;
  const goToShopMenu = () => onNavigateTab && onNavigateTab(SHOP_TAB_TO_MENU[shopTab]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center text-gray-500">
        กำลังโหลดข้อมูลภาพรวม...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= ใบเสนอราคา ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <SectionHeader title="ใบเสนอราคา">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${period === p.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              title="รีเฟรชข้อมูล"
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-300"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </SectionHeader>

        {/* แถบแยกร้าน */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {SHOP_TABS.map(id => (
            <button
              key={id}
              onClick={() => setShopTab(id)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${shopTab === id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {shopConfig[id].name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title={`จำนวนใบ (${periodLabel})`}
            value={qtStats.count.toLocaleString()}
            sub="นับตามวันที่ออกใบ"
            icon={<FileText size={22} className="text-blue-500" />}
            accent="bg-blue-50"
          />
          <StatCard
            title={`มูลค่ารวม (${periodLabel})`}
            value={baht(qtStats.totalValue)}
            sub="รวมทุกสถานะ"
            icon={<TrendingUp size={22} className="text-primary-500" />}
            accent="bg-primary-50"
          />
          <StatCard
            title={`รับเงินแล้ว (${periodLabel})`}
            value={baht(qtStats.paidValue)}
            sub={`${qtStats.paidCount} ใบ · นับตามวันที่รับเงิน`}
            icon={<CheckCircle2 size={22} className="text-emerald-500" />}
            accent="bg-emerald-50"
          />
          <StatCard
            title="ค้างรับทั้งหมด"
            value={baht(qtStats.outstandingValue)}
            sub={`${qtStats.outstandingCount} ใบที่ยังไม่รับเงิน`}
            icon={<Wallet size={22} className="text-orange-500" />}
            accent="bg-orange-50"
          />
        </div>

        {/* ขั้นตอนสถานะ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {qtStats.steps.map(step => {
            const Icon = step.icon;
            const st = STEP_STYLES[step.id];
            return (
              <div key={step.id} className={`rounded-xl border p-4 ${st.soft}`}>
                <div className={`flex items-center gap-2 text-sm font-bold ${st.text}`}>
                  <Icon size={16} /> {step.shortLabel}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{step.count} <span className="text-sm font-medium text-gray-500">ใบ</span></p>
                <p className="text-xs text-gray-500 mt-0.5">{baht(step.value)}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* กราฟ 6 เดือน */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm">ยอด 6 เดือนล่าสุด</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span>ออกใบ</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>รับเงิน</span>
              </div>
            </div>
            <div className="flex items-end gap-2 sm:gap-4 h-44">
              {qtStats.months.map(m => (
                <div key={m.key} className="flex-1 flex flex-col items-center h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-1">
                    <div
                      className="w-1/2 max-w-[18px] bg-blue-400 rounded-t"
                      style={{ height: `${(m.issued / qtStats.monthMax) * 100}%` }}
                      title={`ออกใบ ${baht(m.issued)}`}
                    ></div>
                    <div
                      className="w-1/2 max-w-[18px] bg-emerald-500 rounded-t"
                      style={{ height: `${(m.paid / qtStats.monthMax) * 100}%` }}
                      title={`รับเงิน ${baht(m.paid)}`}
                    ></div>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2 whitespace-nowrap">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ค้างรับเงิน */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> ค้างรับเงิน (ส่งเอกสารแล้ว)
              </h3>
              <span className="text-xs text-gray-400">{qtStats.awaiting.length} ใบ</span>
            </div>
            {qtStats.awaiting.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">ไม่มีรายการค้างรับเงิน</p>
            ) : (
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {qtStats.awaiting.slice(0, 20).map(q => (
                      <tr key={q.id} onClick={goToShopMenu} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                        <td className="py-2 pr-2 font-mono text-xs text-gray-600 whitespace-nowrap">{q.qtNumber}</td>
                        <td className="py-2 pr-2 text-gray-800 truncate max-w-[140px]">{q.contact_name}</td>
                        <td className="py-2 pr-2 text-right font-semibold whitespace-nowrap">{baht(q.totalAmount)}</td>
                        <td className={`py-2 text-right text-xs whitespace-nowrap ${q.waitDays > 30 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          {q.waitDays !== null ? `${q.waitDays} วัน` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ใบล่าสุด */}
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm">ใบเสนอราคาล่าสุด</h3>
              <button onClick={goToShopMenu} className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                ไปที่ {shop.shortName}-ใบเสนอราคา <ArrowRight size={14} />
              </button>
            </div>
            {qtStats.latest.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">ยังไม่มีใบเสนอราคา</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {qtStats.latest.map(q => {
                    const opt = STATUS_OPTIONS.find(s => s.id === q.status) || STATUS_OPTIONS[0];
                    return (
                      <tr key={q.id} onClick={goToShopMenu} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                        <td className="py-2 pr-2 font-mono text-xs text-gray-600 whitespace-nowrap">{q.qtNumber}</td>
                        <td className="py-2 pr-2 text-gray-800 truncate max-w-[120px]">{q.contact_name}</td>
                        <td className="py-2 pr-2 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">{formatThaiDate(issueDateOf(q))}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.badgeClass}`}>{opt.shortLabel}</span>
                        </td>
                        <td className="py-2 text-right font-semibold whitespace-nowrap">{baht(q.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* สินค้ายอดนิยมในใบเสนอราคา */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3">สินค้าที่ออกใบบ่อยที่สุด ({periodLabel})</h3>
            {qtStats.topItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">ไม่มีข้อมูลในช่วงเวลานี้</p>
            ) : (
              <ol className="space-y-1.5 max-h-48 overflow-y-auto">
                {qtStats.topItems.map((it, i) => (
                  <li key={it.name} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-right text-xs font-bold text-gray-400">{i + 1}</span>
                    <span className="flex-1 truncate text-gray-800">{it.name}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{it.qty.toLocaleString()} {it.unit}</span>
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap w-24 text-right">{baht(it.value)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* ================= สินค้า ================= */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <SectionHeader title="สินค้า">
          <button
            onClick={() => onNavigateTab && onNavigateTab('products')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 self-start sm:self-auto"
          >
            ไปที่จัดการสินค้า <ArrowRight size={14} />
          </button>
        </SectionHeader>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="สินค้าทั้งหมด" value={productStats.total.toLocaleString()} icon={<Package size={22} className="text-primary-500" />} accent="bg-primary-50" />
          <StatCard title="เปิดขาย" value={productStats.active.toLocaleString()} icon={<Eye size={22} className="text-green-500" />} accent="bg-green-50" />
          <StatCard title="ปิดขาย" value={productStats.inactive.toLocaleString()} icon={<EyeOff size={22} className="text-gray-500" />} accent="bg-gray-100" />
          <StatCard title="หมดสต็อก" value={productStats.outOfStock.toLocaleString()} sub="เฉพาะที่เปิดขาย" icon={<PackageX size={22} className="text-red-500" />} accent="bg-red-50" />
          <StatCard title="ใกล้หมด" value={productStats.lowStock.length.toLocaleString()} sub={`คงเหลือ 1–${LOW_STOCK_THRESHOLD} ชิ้น`} icon={<AlertTriangle size={22} className="text-amber-500" />} accent="bg-amber-50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ตามหมวดหมู่ */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><Tags size={16} className="text-primary-500" /> จำนวนสินค้าตามหมวดหมู่</h3>
            {productStats.categoryCounts.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">ยังไม่มีสินค้า</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {productStats.categoryCounts.map(c => (
                  <li key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 truncate">{c.name}</span>
                      <span className="font-semibold text-gray-900">{c.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.count / productStats.catMax) * 100}%` }}></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ใกล้หมด */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> สินค้าใกล้หมด</h3>
            {productStats.lowStock.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">ไม่มีสินค้าใกล้หมด</p>
            ) : (
              <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {productStats.lowStock.map(p => (
                  <li key={p.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="truncate text-gray-800 pr-2">{p.name}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">เหลือ {p.stock_quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ต้องตรวจสอบ */}
          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2"><ImageOff size={16} className="text-gray-500" /> สินค้าที่ข้อมูลยังไม่ครบ</h3>
            <p className="text-xs text-gray-400 mb-3">{productStats.needsReview.length} รายการ (ส่วนใหญ่มาจากการเพิ่มอัตโนมัติจากใบเสนอราคา)</p>
            {productStats.needsReview.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">ข้อมูลสินค้าครบถ้วน</p>
            ) : (
              <ul className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                {productStats.needsReview.slice(0, 50).map(p => (
                  <li key={p.id} className="flex justify-between items-center gap-2 py-2 text-sm">
                    <span className="truncate text-gray-800">{p.name}</span>
                    <span className="flex gap-1 shrink-0">
                      {p.issues.map(iss => (
                        <span key={iss} className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{iss}</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminOverview;

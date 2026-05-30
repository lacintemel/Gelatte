import { useState } from 'react';
import { Ticket, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCoupons } from '../../context/CouponContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCoupons();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'percent', discount: 10, minOrder: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '2027-12-31', maxUses: 100, active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    addCoupon({ ...form, code: form.code.toUpperCase() });
    addToast(`Coupon ${form.code} created`, 'success');
    setForm({ code: '', type: 'percent', discount: 10, minOrder: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '2027-12-31', maxUses: 100, active: true });
    setShowForm(false);
  };

  const handleDelete = (id, code) => {
    if (window.confirm(t('cp_delete_confirm'))) {
      deleteCoupon(id);
      addToast(`Coupon ${code} deleted`, 'info');
    }
  };

  const toggleActive = (coupon) => {
    updateCoupon(coupon.id, { active: !coupon.active });
    addToast(`Coupon ${coupon.code} ${!coupon.active ? 'activated' : 'deactivated'}`, 'success');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">{t('cp_title')}</h1>
          <p className="text-warm-gray text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('cp_add')}
        </button>
      </div>

      {/* Coupons List */}
      {coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className={`p-5 rounded-2xl border transition-all ${coupon.active ? 'bg-ivory border-cream-dark/15' : 'bg-cream-light/50 border-cream-dark/10 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-gold-dark" />
                  </div>
                  <div>
                    <span className="font-display text-lg font-bold text-espresso tracking-wider">{coupon.code}</span>
                    <p className="text-xs text-warm-gray">
                      {coupon.type === 'percent' ? `${coupon.discount}%` : `₺${coupon.discount}`} {t('cp_discount').toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(coupon)} className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-espresso hover:bg-cream transition-all">
                    {coupon.active ? <ToggleRight className="w-5 h-5 text-mint" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete(coupon.id, coupon.code)} className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-cream-light">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">{t('cp_min_order')}</p>
                  <p className="text-sm font-semibold text-espresso">₺{coupon.minOrder}</p>
                </div>
                <div className="p-2 rounded-lg bg-cream-light">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">{t('cp_uses')}</p>
                  <p className="text-sm font-semibold text-espresso">{coupon.currentUses}/{coupon.maxUses}</p>
                </div>
                <div className="p-2 rounded-lg bg-cream-light">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">{t('cp_valid_to')}</p>
                  <p className="text-sm font-semibold text-espresso">{coupon.validTo ? new Date(coupon.validTo).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-4">
            <Ticket className="w-7 h-7 text-warm-gray" />
          </div>
          <p className="font-display text-lg text-espresso">{t('cp_no_coupons')}</p>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm animate-modal-overlay" onClick={() => setShowForm(false)} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-modal-content">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream transition-colors">
              <X className="w-4 h-4 text-walnut" />
            </button>

            <h2 className="font-display text-xl font-bold text-espresso mb-6">{t('cp_add')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_code')}</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="form-input" placeholder="SUMMER25" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_discount')}</label>
                  <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="form-input" min={1} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-input appearance-none cursor-pointer">
                    <option value="percent">{t('cp_type_percent')}</option>
                    <option value="fixed">{t('cp_type_fixed')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_min_order')}</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} className="form-input" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_max_uses')}</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} className="form-input" min={1} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_valid_from')}</label>
                  <input type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="form-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">{t('cp_valid_to')}</label>
                  <input type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="form-input" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors">
                {t('cp_add')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

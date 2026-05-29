import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, Image as ImageIcon, FileText, Type, LayoutTemplate } from 'lucide-react';

export default function AdminCMS() {
  const [settings, setSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    aboutUsText: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.cms.getPublicSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to load CMS settings', err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert settings object to array of { key, value }
      const settingsArray = Object.keys(settings).map((key) => ({
        key,
        value: settings[key] || '',
      }));
      
      const res = await api.cms.saveSettingsBulk(settingsArray);
      if (res.success) {
        showFeedback('Site içerikleri başarıyla güncellendi.');
      } else {
        showFeedback(res.error || 'Kaydedilirken hata oluştu.', 'error');
      }
    } catch {
      showFeedback('Beklenmeyen bir hata oluştu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success) {
        setSettings((prev) => ({ ...prev, heroImage: res.url }));
        showFeedback('Resim başarıyla yüklendi.');
      } else {
        showFeedback(res.error || 'Resim yüklenemedi.', 'error');
      }
    } catch {
      showFeedback('Resim yüklenirken hata oluştu.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-warm-gray animate-pulse">İçerikler yükleniyor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-espresso flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-gold" />
            İçerik Yönetimi (CMS)
          </h1>
          <p className="text-warm-gray mt-1">Ana sayfa, hakkımızda ve iletişim bilgilerini düzenleyin.</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`mb-6 p-4 rounded-xl ${feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Hero Section */}
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6">
          <h2 className="text-xl font-display font-bold text-espresso mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 text-gold" /> Ana Sayfa Karşılama Alanı (Hero)
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">Ana Başlık</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
                placeholder="Örn: Gerçek İtalyan Gelato Deneyimi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">Alt Açıklama</label>
              <textarea
                value={settings.heroSubtitle}
                onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
                placeholder="Müşterilerinizi karşılayan kısa bir yazı..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-espresso mb-2">Arka Plan Görseli</label>
              <div className="flex items-center gap-4">
                {settings.heroImage ? (
                  <img src={settings.heroImage} alt="Hero" className="w-32 h-20 object-cover rounded-lg border border-cream-dark" />
                ) : (
                  <div className="w-32 h-20 bg-champagne rounded-lg flex items-center justify-center border border-dashed border-cream-dark">
                    <ImageIcon className="w-6 h-6 text-warm-gray/50" />
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="cursor-pointer bg-champagne px-4 py-2 rounded-lg text-sm font-medium text-espresso border border-cream-dark hover:bg-cream-dark transition-colors inline-flex items-center gap-2">
                    {uploadingImage ? 'Yükleniyor...' : 'Yeni Görsel Yükle'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                  <p className="text-xs text-warm-gray mt-2">Önerilen boyut: 1920x1080px (Yatay). Cloudinary gerektirir.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Us */}
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6">
          <h2 className="text-xl font-display font-bold text-espresso mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" /> Hakkımızda Yazısı
          </h2>
          <div>
            <textarea
              value={settings.aboutUsText}
              onChange={(e) => setSettings({ ...settings, aboutUsText: e.target.value })}
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
              placeholder="Hikayenizi anlatın..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6">
          <h2 className="text-xl font-display font-bold text-espresso mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 text-gold" /> İletişim Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">Telefon Numarası</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
                placeholder="+90 555 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso mb-1">E-posta Adresi</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
                placeholder="info@gelatte.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-espresso mb-1">Açık Adres</label>
              <textarea
                value={settings.contactAddress}
                onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:ring-2 focus:ring-gold/50"
                placeholder="Muratpaşa, Antalya..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-espresso text-cream px-8 py-3 rounded-xl font-medium tracking-wide hover:bg-walnut-light transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

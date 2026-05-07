import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { ArrowLeft, Save } from 'lucide-react';
import ImageUpload from '../../components/admin/ImageUpload';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../data/translations';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useProducts();
  const { SUPPORTED_LANGS } = useLanguage();
  const [activeLang, setActiveLang] = useState('tr');
  
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: { tr: '', en: '', de: '', ru: '' },
    description: { tr: '', en: '', de: '', ru: '' },
    price: '',
    discount: '0',
    stock: '10',
    category: categories[0]?.id || '',
    badge: '',
    status: 'active',
  });
  
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const product = products.find(p => p.id === id);
      if (product) {
        const initialName = { tr: '', en: '', de: '', ru: '' };
        const initialDesc = { tr: '', en: '', de: '', ru: '' };
        
        SUPPORTED_LANGS.forEach(l => {
          if (product.name && typeof product.name === 'object') {
            initialName[l] = product.name[l] || '';
          } else {
            initialName[l] = translations[l]?.[product.name] || product.name || '';
          }
          
          if (product.description && typeof product.description === 'object') {
            initialDesc[l] = product.description[l] || '';
          } else {
            initialDesc[l] = translations[l]?.[product.description] || product.description || '';
          }
        });

        setFormData({
          name: initialName,
          description: initialDesc,
          price: product.price?.toString() || '',
          discount: product.discount?.toString() || '0',
          stock: product.stock?.toString() || '0',
          category: product.category || categories[0]?.id || '',
          badge: product.badge || '',
          status: product.status || 'active',
        });
        
        if (product.images && product.images.length > 0) {
          setImages(product.images);
        } else if (product.image) {
          setImages([product.image]);
        }
      } else {
        navigate('/admin/products');
      }
    }
  }, [id, isEditing, products, categories, navigate, SUPPORTED_LANGS]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLangFieldChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: value
      }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.tr?.trim() && !formData.name.en?.trim()) {
      newErrors.name = 'Product name is required (TR or EN)';
    }
    
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    const discountNum = parseFloat(formData.discount || 0);
    if (isNaN(discountNum) || discountNum < 0) {
      newErrors.discount = 'Discount cannot be negative';
    } else if (discountNum > priceNum) {
      newErrors.discount = 'Discount cannot exceed price';
    }
    
    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount || 0),
      stock: parseInt(formData.stock, 10),
      category: formData.category,
      badge: formData.badge || null,
      status: formData.status,
      image: images[0], // primary image for compatibility
      images: images,
    };

    if (isEditing) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }
    
    navigate('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-warm-gray hover:text-espresso">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-espresso">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-espresso text-cream px-6 py-2.5 rounded-xl font-medium tracking-wide flex items-center gap-2 hover:bg-walnut-light transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 space-y-4">
            <h2 className="font-display text-xl font-semibold text-espresso border-b border-cream-dark/25 pb-4">Basic Information</h2>
            
            {/* Language Tabs */}
            <div className="flex gap-2 mb-4 border-b border-cream-dark/25 pb-2">
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`px-4 py-1.5 rounded-t-lg text-sm font-medium uppercase transition-colors ${
                    activeLang === l 
                      ? 'bg-champagne text-espresso border-b-2 border-espresso' 
                      : 'text-warm-gray-dark hover:text-espresso hover:bg-cream'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">
                Product Name ({activeLang.toUpperCase()}) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name[activeLang] || ''}
                onChange={(e) => handleLangFieldChange(e, 'name')}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
                placeholder="e.g. Pistachio Gelato"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">
                Description ({activeLang.toUpperCase()})
              </label>
              <textarea
                name="description"
                value={formData.description[activeLang] || ''}
                onChange={(e) => handleLangFieldChange(e, 'description')}
                rows="4"
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                placeholder="Product description..."
              />
            </div>
          </div>

          <div className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 space-y-4">
            <h2 className="font-display text-xl font-semibold text-espresso border-b border-cream-dark/25 pb-4">Media</h2>
            <ImageUpload images={images} setImages={setImages} />
            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 space-y-4">
            <h2 className="font-display text-xl font-semibold text-espresso border-b border-cream-dark/25 pb-4">Pricing & Inventory</h2>
            
            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Price (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Discount (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              {errors.discount && <p className="text-red-500 text-xs mt-1">{errors.discount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                step="1"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 space-y-4">
            <h2 className="font-display text-xl font-semibold text-espresso border-b border-cream-dark/25 pb-4">Organization</h2>
            
            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label || c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-gray-dark mb-1">Badge</label>
              <select
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                <option value="">None</option>
                <option value="Signature">Signature</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Fresh Daily">Fresh Daily</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

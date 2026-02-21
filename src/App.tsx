/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Save, 
  User as UserIcon, 
  Shield, 
  Briefcase, 
  UserCircle 
} from 'lucide-react';
import { User, Product, View, Role } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('auth');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleLogin = async (role?: Role) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role === 'guest' ? {} : { username, password }),
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setView('list');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setUsername('');
    setPassword('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSave = async (productData: Partial<Product>) => {
    setLoading(true);
    try {
      const url = view === 'add' ? '/api/products' : `/api/products/${selectedProduct?.id}`;
      const method = view === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        fetchProducts();
        setView('list');
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';
  const canAdd = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#f5f5f0] shadow-2xl relative overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {view === 'auth' && (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center p-8"
          >
            <div className="text-center mb-12">
              <h1 className="serif text-5xl font-light mb-2">Parfum</h1>
              <p className="text-xs uppercase tracking-widest opacity-50">Luxury Fragrance Store</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold tracking-wider opacity-60 ml-1">Логин</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all"
                  placeholder="Введите логин"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold tracking-wider opacity-60 ml-1">Пароль</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button 
                onClick={() => handleLogin()}
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white rounded-2xl py-4 font-medium hover:bg-black transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#f5f5f0] px-2 opacity-40">Или</span></div>
              </div>

              <button 
                onClick={() => handleLogin('guest')}
                className="w-full border border-black/10 rounded-2xl py-4 font-medium hover:bg-black/5 transition-colors"
              >
                Войти как гость
              </button>

              <div className="mt-8 p-4 bg-black/5 rounded-2xl border border-black/5">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-2 text-center">Подсказка для входа</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="opacity-60">Админ:</div>
                  <div className="font-mono">admin / admin123</div>
                  <div className="opacity-60">Менеджер:</div>
                  <div className="font-mono">manager / manager123</div>
                  <div className="opacity-60">Пользователь:</div>
                  <div className="font-mono">user / user123</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={handleLogout} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="serif text-xl">Каталог</h2>
                  <div className="flex items-center gap-1 opacity-50 text-[10px] uppercase font-bold">
                    {user?.role === 'admin' && <Shield size={10} />}
                    {user?.role === 'manager' && <Briefcase size={10} />}
                    {user?.role === 'user' && <UserCircle size={10} />}
                    {user?.role === 'guest' && <UserIcon size={10} />}
                    <span>{user?.role}</span>
                  </div>
                </div>
              </div>
              {canAdd && (
                <button 
                  onClick={() => setView('add')}
                  className="bg-[#5A5A40] text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                  <Plus size={20} />
                </button>
              )}
            </header>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {products.map((product) => (
                <motion.div 
                  layoutId={`product-${product.id}`}
                  key={product.id}
                  className="bg-white rounded-3xl p-4 flex gap-4 shadow-sm border border-black/5 relative group"
                >
                  <div className="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A40] mb-1 block">
                          {product.category}
                        </span>
                        {product.discount > 0 && (
                          <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <h3 className="serif text-lg leading-tight mb-1">{product.name}</h3>
                      <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed mb-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                      <div className="opacity-50">Производитель: <span className="text-black font-medium">{product.manufacturer}</span></div>
                      <div className="opacity-50">Поставщик: <span className="text-black font-medium">{product.supplier}</span></div>
                      <div className="opacity-50">На складе: <span className="text-black font-medium">{product.stock} {product.unit}</span></div>
                      <div className="text-sm font-bold mt-1 col-span-2">
                        {product.price.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>

                  {/* Actions Overlay */}
                  {(canEdit || canDelete) && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setView('edit');
                          }}
                          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full hover:bg-white transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {(view === 'edit' || view === 'add') && (
          <ProductForm 
            product={selectedProduct} 
            onBack={() => {
              setView('list');
              setSelectedProduct(null);
            }}
            onSave={handleSave}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, onBack, onSave, loading }: { 
  product: Product | null, 
  onBack: () => void, 
  onSave: (data: Partial<Product>) => void,
  loading: boolean
}) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      category: '',
      description: '',
      manufacturer: '',
      supplier: '',
      price: 0,
      unit: 'мл',
      stock: 0,
      discount: 0,
      image: ''
    }
  );

  return (
    <motion.div 
      key="form"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-[#f5f5f0] z-20 flex flex-col"
    >
      <header className="p-6 flex justify-between items-center border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="serif text-xl">{product ? 'Изменить' : 'Добавить'}</h2>
        </div>
        <button 
          onClick={() => onSave(formData)}
          disabled={loading}
          className="bg-[#1a1a1a] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          <span>{loading ? '...' : 'Сохранить'}</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Image Preview */}
        <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-black/5 shadow-inner">
          {formData.image ? (
            <img src={formData.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <Plus size={48} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <FormField label="Наименование" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
          <FormField label="Категория" value={formData.category} onChange={v => setFormData({...formData, category: v})} />
          <FormField label="Описание" value={formData.description} onChange={v => setFormData({...formData, description: v})} multiline />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Производитель" value={formData.manufacturer} onChange={v => setFormData({...formData, manufacturer: v})} />
            <FormField label="Поставщик" value={formData.supplier} onChange={v => setFormData({...formData, supplier: v})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Цена (₽)" value={formData.price?.toString()} onChange={v => setFormData({...formData, price: parseFloat(v) || 0})} type="number" />
            <FormField label="Ед. измерения" value={formData.unit} onChange={v => setFormData({...formData, unit: v})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="На складе" value={formData.stock?.toString()} onChange={v => setFormData({...formData, stock: parseInt(v) || 0})} type="number" />
            <FormField label="Скидка (%)" value={formData.discount?.toString()} onChange={v => setFormData({...formData, discount: parseInt(v) || 0})} type="number" />
          </div>

          <FormField label="Ссылка на фото" value={formData.image} onChange={v => setFormData({...formData, image: v})} />
        </div>
      </div>
    </motion.div>
  );
}

function FormField({ label, value, onChange, type = 'text', multiline = false }: { 
  label: string, 
  value?: string, 
  onChange: (v: string) => void,
  type?: string,
  multiline?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold tracking-wider opacity-60 ml-1">{label}</label>
      {multiline ? (
        <textarea 
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all text-sm"
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-black/20 transition-all text-sm"
        />
      )}
    </div>
  );
}

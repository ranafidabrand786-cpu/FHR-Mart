
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Product, CartItem, User, Category } from './types';
import { MOCK_PRODUCTS, APP_CONFIG } from './constants';
import { getShoppingAdvice } from './geminiService';

// --- Utilities ---
const formatPrice = (price: number) => {
  try {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('PKR', 'Rs.');
  } catch (e) {
    // Fallback for older browsers (Android 6 / Vivo Y66)
    return 'Rs. ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

// --- Sub-components ---

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-blue-600' }) => (
  <span className={`${color} text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter`}>{children}</span>
);

const Navbar: React.FC<{ 
  cartCount: number; 
  wishlistCount: number;
  user: User | null; 
  onLogin: () => void; 
  onOpenCart: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}> = ({ cartCount, wishlistCount, user, onLogin, onOpenCart, searchTerm, setSearchTerm }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] glass px-4 py-2 border-b border-white/5 gpu-accel">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex flex-col -space-y-1 shrink-0">
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-gradient leading-none">FHR</span>
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-zinc-500 font-bold uppercase pl-0.5">Mart</span>
        </Link>

        <div className="flex-1 max-w-2xl relative group hidden sm:block">
          <input 
            type="text" 
            placeholder="Search premium store..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:border-blue-500/50 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 rounded-lg text-white">
            <i className="fa-solid fa-magnifying-glass text-xs"></i>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          <button onClick={onOpenCart} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <i className="fa-solid fa-cart-shopping text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-950 animate__animated animate__heartBeat animate__infinite">
                {cartCount}
              </span>
            )}
          </button>
          
          <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block"></div>

          {user ? (
            <Link to="/account" className="flex items-center gap-3 cursor-pointer p-1 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
              <img src={user.avatar} className="w-8 h-8 rounded-lg object-cover shadow-lg" alt="User" />
              <div className="hidden lg:flex flex-col text-left -space-y-1">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Premium</span>
                <span className="text-xs font-bold text-zinc-200">Account</span>
              </div>
            </Link>
          ) : (
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const ProductModal: React.FC<{
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
}> = ({ product, isOpen, onClose, onAddToCart, onToggleWishlist, isWishlisted }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'reviews'>('info');
  if (!product) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl transition-all duration-500 gpu-accel ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto lg:overflow-hidden no-scrollbar">
          <div className="lg:col-span-5 relative bg-black aspect-square lg:aspect-auto">
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 glass rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-xmark"></i></button>
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col h-full overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-2 mb-2">
              <Badge color="bg-orange-500">Official Store</Badge>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{product.category}</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">{product.name}</h2>
            
            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex text-yellow-500"><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star-half-stroke"></i></div>
              <span className="text-zinc-500 font-bold underline">{product.reviews} Ratings</span>
            </div>

            <div className="flex gap-4 border-b border-zinc-800 mb-6">
              {['info', 'specs'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-zinc-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 mb-8 min-h-[120px]">
              {activeTab === 'info' && <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specs || {}).map(([k, v]) => (
                    <div key={k} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 font-black uppercase">{k}</p>
                      <p className="text-xs font-bold text-zinc-300">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex flex-col items-center sm:items-start shrink-0">
                <span className="text-3xl font-black text-white">{formatPrice(product.price)}</span>
                <span className="text-xs text-zinc-600 line-through font-bold">{formatPrice(product.originalPrice)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => { onAddToCart(product); onClose(); }}
                  className="bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  Add To Cart
                </button>
                <button className="bg-zinc-100 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const AccountPage: React.FC<{ user: User | null; onLogin: () => void }> = ({ user, onLogin }) => {
  if (!user) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-lg mx-auto text-center h-screen flex flex-col justify-center animate__animated animate__fadeIn">
        <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-zinc-800">
           <i className="fa-solid fa-user-ninja text-4xl text-zinc-700"></i>
        </div>
        <h2 className="text-2xl font-black mb-4">Account Secure</h2>
        <p className="text-zinc-500 text-sm mb-8">Please login to access your FHR Mart account.</p>
        <button onClick={onLogin} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Sign In</button>
      </div>
    );
  }

  const sections = [
    { icon: 'fa-box-open', label: 'My Orders', desc: 'Track your packages' },
    { icon: 'fa-heart', label: 'Wishlist', desc: 'Your saved favorites' },
    { icon: 'fa-wallet', label: 'FHR Wallet', desc: 'Balance: ' + formatPrice(user.balance) },
    { icon: 'fa-location-dot', label: 'Addresses', desc: 'Manage your locations' },
  ];

  return (
    <div className="pt-24 pb-32 px-4 max-w-4xl mx-auto min-h-screen animate__animated animate__fadeIn">
      <div className="bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800 mb-8 flex flex-col items-center sm:flex-row sm:items-center gap-6 shadow-xl gpu-accel">
        <img src={user.avatar} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-blue-500/20" alt="Avatar" />
        <div className="text-center sm:text-left">
          <Badge color="bg-blue-600">Verified Member</Badge>
          <h1 className="text-3xl font-black mt-2">{user.name}</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
         {sections.map((s, i) => (
           <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-blue-500/40 transition-all cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800"><i className={`fa-solid ${s.icon} text-blue-500 text-xl`}></i></div>
              <div><h3 className="font-black text-sm uppercase">{s.label}</h3><p className="text-xs text-zinc-500">{s.desc}</p></div>
           </div>
         ))}
      </div>

      {/* Requested Branding Section */}
      <div className="mt-auto py-12 border-t border-zinc-900 text-center animate__animated animate__fadeInUp">
          <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                 <div className="h-[1px] w-6 bg-zinc-800"></div>
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Platform Architect</span>
                 <div className="h-[1px] w-6 bg-zinc-800"></div>
              </div>
              <p className="text-sm font-black italic tracking-tight text-zinc-300">
                 "Commitment to excellence in every digital heartbeat."
              </p>
              <div className="mt-2 flex flex-col items-center">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Powered by</span>
                 <span className="text-2xl font-black text-gradient uppercase tracking-tighter scale-110">Fida HussaiN Rana</span>
              </div>
              <div className="flex gap-2 mt-4">
                 <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-600/40"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-600/20"></div>
              </div>
          </div>
      </div>
    </div>
  );
};

// --- App Root ---

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'shipping' | 'payment'>('bag');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("Assalam-o-Alaikum! Looking for premium tech? I'm FHR Mart's AI guide. How can I assist you today?");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.ALL);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to bag!`);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]);
    showToast(wishlist.includes(product.id) ? "Removed from favorites" : "Saved to favorites");
  };

  const handleLogin = () => {
    setUser({ id: 'fida1', name: 'Fida Rana', email: 'fida@fhr.com', avatar: 'https://i.pravatar.cc/150?u=fida', balance: 500000, vouchers: [] });
    showToast("Welcome back, Fida Rana!");
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === Category.ALL || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-zinc-50 selection:bg-blue-500/30 font-jakarta pb-20 sm:pb-0 gpu-accel">
        <Navbar 
          cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
          wishlistCount={wishlist.length}
          user={user} 
          onLogin={handleLogin}
          onOpenCart={() => { setCheckoutStep('bag'); setIsCartOpen(true); }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-blue-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl animate__animated animate__fadeInDown">
            {toast}
          </div>
        )}

        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={
              <div className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 pb-20">
                {/* Banner */}
                <div className="relative aspect-[16/7] sm:aspect-[21/8] bg-zinc-900 rounded-[2rem] overflow-hidden mb-12 border border-white/5 shadow-2xl gpu-accel">
                  <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20">
                    <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-[8px] sm:text-xs mb-4">Powered by Fida HussaiN Rana</span>
                    <h1 className="text-3xl sm:text-6xl font-black mb-6 leading-tight">PREMIUM TECH<br/><span className="text-gradient">IN PAKISTAN.</span></h1>
                    <button className="bg-white text-black px-8 py-3 w-fit rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95">Shop Collection</button>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-4 mb-16 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth">
                  {Object.values(Category).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className="flex flex-col items-center gap-3 shrink-0"
                    >
                      <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center transition-all ${selectedCategory === cat ? 'bg-blue-600 border-blue-500 scale-110 shadow-lg shadow-blue-600/20' : 'bg-zinc-900 border-white/5'}`}>
                        <i className={`fa-solid ${cat === Category.ALL ? 'fa-border-all' : cat === Category.ELECTRONICS ? 'fa-laptop' : cat === Category.FASHION ? 'fa-shirt' : cat === Category.GROCERY ? 'fa-basket-shopping' : 'fa-bolt'} text-lg ${selectedCategory === cat ? 'text-white' : 'text-zinc-500'}`}></i>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-blue-400' : 'text-zinc-600'}`}>{cat}</span>
                    </button>
                  ))}
                </div>

                {/* Vouchers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center relative overflow-hidden gpu-accel">
                      <div className="absolute -left-4 w-8 h-8 bg-[#050505] rounded-full"></div>
                      <div className="absolute -right-4 w-8 h-8 bg-[#050505] rounded-full"></div>
                      <div>
                        <h3 className="text-2xl font-black text-white">Rs. 2k OFF</h3>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Premium Voucher</p>
                      </div>
                      <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95">Claim</button>
                    </div>
                  ))}
                </div>

                {/* Main Feed */}
                <div className="mb-20">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 px-2">Featured <span className="text-gradient">Products</span></h2>
                  <div className="product-grid">
                    {filteredProducts.map(p => (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} className="bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden hover:border-blue-500/40 transition-all group cursor-pointer gpu-accel">
                        <div className="aspect-[1/1] sm:aspect-[4/5] relative bg-zinc-950 overflow-hidden">
                          <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlist.includes(p.id) ? 'bg-red-500 text-white' : 'bg-black/40 text-white/50'}`}
                          >
                            <i className={`fa-${wishlist.includes(p.id) ? 'solid' : 'regular'} fa-heart text-xs`}></i>
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">{p.category}</p>
                          <h3 className="text-xs font-bold text-zinc-200 line-clamp-1 mb-2">{p.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-white">{formatPrice(p.price)}</span>
                            <div className="flex text-yellow-500 text-[10px]"><i className="fa-solid fa-star"></i><span className="ml-1 text-zinc-400">{p.rating}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            } />
            <Route path="/account" element={<AccountPage user={user} onLogin={handleLogin} />} />
          </Routes>
        </main>

        <footer className="bg-zinc-950 border-t border-white/5 pt-16 pb-32 sm:pb-16 px-6 text-center sm:text-left">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-gradient mb-4 tracking-tighter uppercase">FHR Mart Global</h2>
              <p className="text-zinc-500 text-xs max-w-sm mb-8 leading-relaxed font-medium">
                Premium electronics, global design, and Pakistani excellence. Crafted by <span className="text-white">Fida HussaiN Rana</span>.
              </p>
              <div className="flex justify-center sm:justify-start gap-4">
                {['instagram', 'twitter', 'facebook'].map(s => (
                  <a key={s} href="#" className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all">
                    <i className={`fa-brands fa-${s}`}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center items-center sm:items-end">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Designed for performance</p>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Compatible with Android 6.0+ & iOS</p>
            </div>
          </div>
        </footer>

        {/* Persistent Bottom Mobile Nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 py-4 px-8 flex justify-between items-center z-[70] gpu-accel">
           <Link to="/" className="flex flex-col items-center gap-1 text-blue-500"><i className="fa-solid fa-house-chimney text-xl"></i><span className="text-[8px] font-black uppercase">Home</span></Link>
           <button onClick={() => { setIsCartOpen(true); setCheckoutStep('bag'); }} className="flex flex-col items-center gap-1 text-zinc-500 relative"><i className="fa-solid fa-bag-shopping text-xl"></i><span className="text-[8px] font-black uppercase">Cart</span>{cart.length > 0 && <span className="absolute -top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
           <Link to="/account" className="flex flex-col items-center gap-1 text-zinc-500"><i className="fa-solid fa-user-astronaut text-xl"></i><span className="text-[8px] font-black uppercase">Account</span></Link>
        </div>

        {/* AI Assistant */}
        <div className={`fixed bottom-24 sm:bottom-10 right-6 z-[80] flex flex-col items-end gap-4 transition-all ${isAiOpen ? 'w-[300px] sm:w-[380px]' : 'w-auto'}`}>
          {isAiOpen && (
            <div className="glass w-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate__animated animate__fadeInUp animate__faster border border-blue-500/20 gpu-accel">
              <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><i className="fa-solid fa-robot text-sm"></i></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">FHR AI Assistant</p>
                </div>
                <button onClick={() => setIsAiOpen(false)}><i className="fa-solid fa-xmark text-sm opacity-50"></i></button>
              </div>
              <div className="p-5 h-56 overflow-y-auto bg-zinc-950/40 text-xs text-zinc-400 leading-relaxed scrollbar-thin">
                {aiLoading ? <div className="italic text-blue-400">Thinking...</div> : <div className="whitespace-pre-wrap">{aiMessage}</div>}
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!aiInput.trim()) return;
                setAiLoading(true);
                const query = aiInput;
                setAiInput("");
                const advice = await getShoppingAdvice(query, MOCK_PRODUCTS);
                setAiMessage(advice);
                setAiLoading(false);
              }} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                <input type="text" placeholder="Ask AI..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
                <button type="submit" className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center"><i className="fa-solid fa-paper-plane text-[10px]"></i></button>
              </form>
            </div>
          )}
          <button onClick={() => setIsAiOpen(!isAiOpen)} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-2xl transition-all active:scale-95 ${isAiOpen ? 'rotate-90' : 'rotate-0'}`}>
            <i className={`fa-solid ${isAiOpen ? 'fa-times' : 'fa-robot'}`}></i>
          </button>
        </div>

        {/* Product Modal */}
        <ProductModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart}
          onToggleWishlist={toggleWishlist}
          isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        />

        {/* Cart Drawer */}
        <div className={`fixed inset-0 z-[120] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950 shadow-2xl transition-transform duration-500 ease-out border-l border-zinc-800 gpu-accel ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest">{checkoutStep.toUpperCase()}</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center"><i className="fa-solid fa-xmark text-xs"></i></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {checkoutStep === 'bag' && (
                  cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-700 uppercase font-black text-[10px]">Bag is empty.</div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex gap-4 animate__animated animate__fadeInRight animate__faster">
                        <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[10px] font-black text-zinc-100 uppercase truncate">{item.name}</h4>
                          <p className="text-sm font-black text-white mt-1">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} className="text-zinc-600"><i className="fa-solid fa-minus text-[8px]"></i></button>
                            <span className="text-xs font-black">{item.quantity}</span>
                            <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} className="text-zinc-600"><i className="fa-solid fa-plus text-[8px]"></i></button>
                            <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="ml-auto text-red-900"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>

              <div className="p-6 border-t border-zinc-900 bg-zinc-950 space-y-4">
                <div className="flex justify-between items-center text-xl font-black">
                  <span className="text-zinc-500 text-xs uppercase">Total</span>
                  <span className="text-blue-500">{formatPrice(cartTotal)}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => {
                    if (checkoutStep === 'bag') setCheckoutStep('shipping');
                    else {
                      showToast("Order Successful!");
                      setCart([]);
                      setIsCartOpen(false);
                      setCheckoutStep('bag');
                    }
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                  {checkoutStep === 'bag' ? 'Checkout' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;

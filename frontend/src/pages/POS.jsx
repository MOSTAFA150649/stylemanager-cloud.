import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [settings, setSettings] = useState({ currency: '€', storeName: 'StyleManager' });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des produits');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      const exactMatch = products.find(p => p.reference && p.reference.toLowerCase() === searchTerm.trim().toLowerCase());
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchTerm('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm('');
      }
    }
  };

  const addToCart = (product, variant = null) => {
    if (product.variants && product.variants.length > 0 && !variant) {
      setSelectedProductForVariant(product);
      return;
    }

    const maxStock = variant ? variant.quantity : product.quantity;
    if (maxStock <= 0) return;

    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id.toString();
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
      if (existingItem.cartQuantity >= maxStock) return;
      setCart(cart.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, cartItemId, variant, cartQuantity: 1 }]);
    }
    
    setSelectedProductForVariant(null);
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    const item = cart.find(p => p.cartItemId === cartItemId);
    if (!item) return;
    
    const maxStock = item.variant ? item.variant.quantity : item.quantity;
    const newQty = item.cartQuantity + delta;
    
    if (newQty <= 0) {
      removeFromCart(cartItemId);
    } else if (newQty > maxStock) {
      return;
    } else {
      setCart(cart.map(p => p.cartItemId === cartItemId ? { ...p, cartQuantity: newQty } : p));
    }
  };

  const total = cart.reduce((acc, item) => acc + item.sellPrice * item.cartQuantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.cartQuantity,
        variantId: item.variant?.id
      }));

      const response = await axios.post(`${API_BASE_URL}/sales`, {
        items,
        paymentMethod: 'CASH',
        customerId: selectedCustomerId ? parseInt(selectedCustomerId) : null
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Vente finalisée avec succès !');
      setLastSale(response.data);
      setShowTicket(true);
      setCart([]);
      setSelectedCustomerId('');
      fetchProducts(); // Refresh stock
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Erreur lors de l’encaissement');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'cart'

  const printTicket = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b bg-white sticky top-0 z-20">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-4 font-bold text-sm border-b-2 transition ${activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          Produits ({filteredProducts.length})
        </button>
        <button 
          onClick={() => setActiveTab('cart')}
          className={`flex-1 py-4 font-bold text-sm border-b-2 transition ${activeTab === 'cart' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          Ticket ({cart.reduce((acc, item) => acc + item.cartQuantity, 0)})
        </button>
      </div>

      {/* Produits - Partie Gauche / Tab Produits */}
      <div className={`w-full lg:w-2/3 p-4 lg:p-6 overflow-y-auto ${activeTab === 'products' ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Caisse</h2>
          <div className="text-xs bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
            Mode En Ligne
          </div>
        </div>
        
        <div className="relative mb-8">
          <input
            type="text"
            autoFocus
            placeholder="Nom, référence ou scan..."
            className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium py-4 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <svg className="w-6 h-6 absolute left-4 top-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 font-bold shadow-sm">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl mb-6 font-bold shadow-sm">{success}</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-20 lg:mb-0">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className={`bg-white rounded-3xl shadow-sm p-3 lg:p-4 cursor-pointer hover:shadow-xl transition-all border border-slate-100 flex flex-col items-center group
                ${(!product.variants || product.variants.length === 0) && product.quantity <= 0 ? 'opacity-50 grayscale' : 'hover:-translate-y-2'}`}
            >
              <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-2xl bg-slate-50">
                {product.imageUrl ? (
                  <img src={`${API_BASE_URL.replace('/api', '')}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-2xl">
                     {product.name[0]}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                  <p className="text-blue-600 font-black text-xs lg:text-sm">{Number(product.sellPrice).toFixed(2)} {settings.currency}</p>
                </div>
              </div>
              <h3 className="font-bold text-center text-xs lg:text-sm mb-1 text-slate-800 line-clamp-1">{product.name}</h3>
              {product.variants && product.variants.length > 0 ? (
                <p className="text-[10px] text-blue-500 font-black bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-100">{product.variants.length} modèles</p>
              ) : (
                <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.quantity <= 5 ? 'bg-orange-100 text-orange-600 ring-1 ring-orange-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>Stock: {product.quantity}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panier - Partie Droite / Tab Ticket */}
      <div className={`w-full lg:w-1/3 bg-white border-l border-slate-200 flex flex-col h-full lg:shadow-2xl z-10 ${activeTab === 'cart' ? 'block' : 'hidden lg:flex'}`}>
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Votre Panier</h2>
            <span className="bg-slate-900 text-white text-[10px] font-black py-1 px-3 rounded-full shadow-lg">
              {cart.reduce((acc, item) => acc + item.cartQuantity, 0)} ITEMS
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="font-bold text-sm">Le ticket est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition">
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {item.name}
                  </h4>
                  {item.variant && <p className="text-[10px] font-black text-blue-600 bg-blue-50/50 inline-block px-2 py-0.5 rounded-lg mt-1">{item.variant.size} • {item.variant.color}</p>}
                  <p className="text-xs text-slate-500 font-bold mt-1">{Number(item.sellPrice).toFixed(2)} {settings.currency}</p>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-8 h-8 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition font-black"
                  >
                    -
                  </button>
                  <span className="font-black w-4 text-center text-slate-800 text-sm">{item.cartQuantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-8 h-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition shadow-md shadow-blue-200 font-black"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="ml-2 text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900 p-6 lg:p-8 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
          <div className="mb-4">
            <select 
              className="w-full p-4 bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition text-white font-bold text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- CLIENT DE PASSAGE --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>Total HT</span>
              <span>{total.toFixed(2)} {settings.currency}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest pb-4 border-b border-slate-800">
              <span>TVA ({settings.taxRate}%)</span>
              <span>{((total * settings.taxRate) / 100).toFixed(2)} {settings.currency}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-white text-sm font-bold opacity-60">NET À PAYER</span>
              <span className="text-3xl font-black text-white">{(total + (total * settings.taxRate) / 100).toFixed(2)} <span className="text-lg text-blue-400">{settings.currency}</span></span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-2xl
              ${cart.length === 0 || loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-blue-900/40'}`}
          >
            {loading ? 'CALCUL...' : 'VALIDER LA VENTE'}
          </button>
        </div>
      </div>
      {/* Modal Ticket */}
      {selectedProductForVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Sélectionner une variante pour {selectedProductForVariant.name}</h3>
            <div className="grid gap-3">
              {selectedProductForVariant.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => addToCart(selectedProductForVariant, v)}
                  disabled={v.quantity <= 0}
                  className={`p-3 rounded-lg border text-left flex justify-between items-center transition ${v.quantity > 0 ? 'bg-white border-blue-200 hover:bg-blue-50 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <span className="font-medium">{v.size || ''} {v.color || ''} {v.sku ? `(Réf: ${v.sku})` : ''}</span>
                  <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">Stock: {v.quantity}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedProductForVariant(null)} className="mt-6 w-full py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal Ticket d'impression */}
      {showTicket && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white print:absolute print:inset-0 print:block">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full modal-print print:shadow-none print:p-0">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-mono uppercase">{settings.storeName}</h2>
              {settings.address && <p className="text-xs font-mono text-gray-600">{settings.address}</p>}
              {settings.phone && <p className="text-xs font-mono text-gray-600">Tel: {settings.phone}</p>}
              <div className="mt-4">
                <p className="text-gray-500 font-mono text-sm">Ticket #00{lastSale.id}</p>
                <p className="text-gray-500 font-mono text-xs">{new Date(lastSale.createdAt).toLocaleString()}</p>
              </div>
              {settings.ticketHeader && <p className="text-xs font-mono italic mt-2 text-gray-500">{settings.ticketHeader}</p>}
            </div>
            
            <div className="border-t border-dashed border-gray-300 py-4 mb-4 font-mono text-sm">
              <table className="w-full">
                <tbody>
                  {lastSale.items && lastSale.items.map(item => (
                    <tr key={item.id} className="align-top">
                      <td className="py-1 pr-2">{item.quantity}x</td>
                      <td className="py-1">
                        {item.product ? item.product.name : 'Produit'}
                        {item.variant && <div className="text-[10px] text-gray-500">{item.variant.size} {item.variant.color}</div>}
                      </td>
                      <td className="py-1 text-right whitespace-nowrap">{Number(item.subtotal).toFixed(2)} {settings.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="space-y-1 font-mono text-sm mb-6 border-t border-dashed border-gray-300 pt-4">
               <div className="flex justify-between">
                 <span>Sous-total:</span>
                 <span>{Number(lastSale.totalAmount).toFixed(2)} {settings.currency}</span>
               </div>
               <div className="flex justify-between">
                 <span>TVA ({settings.taxRate}%):</span>
                 <span>{((lastSale.totalAmount * settings.taxRate) / 100).toFixed(2)} {settings.currency}</span>
               </div>
               <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                 <span>TOTAL:</span>
                 <span>{(lastSale.totalAmount + (lastSale.totalAmount * settings.taxRate) / 100).toFixed(2)} {settings.currency}</span>
               </div>
            </div>

            {settings.ticketFooter && (
              <div className="text-center font-mono text-xs text-gray-500 border-t border-dashed border-gray-300 pt-4 mb-6">
                {settings.ticketFooter}
              </div>
            )}
            
            <div className="flex justify-between print:hidden">
              <button 
                onClick={() => setShowTicket(false)} 
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition"
              >
                Fermer
              </button>
              <button 
                onClick={printTicket} 
                className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 flex items-center transition shadow pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;

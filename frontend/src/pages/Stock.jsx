import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ProductForm from '../components/ProductForm';
import API_BASE_URL from '../config';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, LOW, OUT
  const [settings, setSettings] = useState({ currency: '€' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_BASE_URL}/products`, config);
      setProducts(res.data);
    } catch (error) {
      console.error('Erreur chargement produits', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_BASE_URL}/settings`, config);
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product => {
    // Filtre recherche textuelle
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase()));
                        
    // Filtre alertes stock
    if (stockFilter === 'LOW') return matchSearch && product.quantity > 0 && product.quantity <= product.alertThreshold;
    if (stockFilter === 'OUT') return matchSearch && product.quantity === 0;
    
    return matchSearch;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter]);

  const handleExportExcel = () => {
    const dataToExport = filteredProducts.map(p => ({
      ID: p.id,
      Référence: p.reference || 'N/A',
      Nom: p.name,
      Catégorie: p.category?.name || 'N/A',
      Fournisseur: p.supplier?.name || 'N/A',
      'Prix Achat': p.buyPrice,
      'Prix Vente': p.sellPrice,
      Stock: p.quantity,
      'Valeur Stock (Vente)': p.quantity * p.sellPrice
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
    XLSX.writeFile(workbook, `inventaire_stylemanager_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {showForm && (
        <ProductForm 
          onCancel={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); fetchProducts(); }} 
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gestion du Stock</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-slate-800 transition shadow flex items-center text-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Ajouter un Produit (Photo)
        </button>
        <button 
          onClick={handleExportExcel}
          className="bg-emerald-600 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-emerald-700 transition shadow flex items-center text-sm ml-2"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0 text-left px-2 lg:px-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Inventaire</h1>
          <p className="text-slate-500 mt-1 text-sm">Gestion des stocks et alertes critiques.</p>
        </div>
        <div className="flex w-full sm:w-auto space-x-2">
          <button 
            onClick={() => setShowForm(true)}
            className="flex-1 sm:flex-none justify-center bg-slate-900 text-white font-bold py-3 px-6 rounded-2xl hover:bg-slate-800 transition shadow-lg flex items-center text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Nouveau
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none justify-center bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-emerald-700 transition shadow-lg flex items-center text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-8 p-4 lg:p-6 flex flex-col sm:flex-row gap-4 mx-2 lg:mx-0">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <select 
            className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 appearance-none"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="ALL">📦 Tout l'inventaire</option>
            <option value="LOW">⚠️ Stock faible</option>
            <option value="OUT">❌ Rupture</option>
          </select>
        </div>
      </div>

      <div className="mx-2 lg:mx-0">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-slate-400">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Produit</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fournisseur</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prix Achat</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prix Vente</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="6" className="px-8 py-16 text-center text-slate-400 font-bold">Aucun produit trouvé.</td></tr>
                  ) : (
                    currentItems.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group text-left">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.imageUrl ? (
                              <img src={`${API_BASE_URL.replace('/api', '')}${product.imageUrl}`} alt={product.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">{product.name[0]}</div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-black text-slate-900">{product.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono font-bold">{product.reference}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">{product.supplier?.name || '-'}</td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-500">{product.buyPrice} {settings.currency}</td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900">{product.sellPrice} {settings.currency}</td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-black rounded-xl ring-1 ${product.quantity === 0 ? 'bg-red-50 text-red-600 ring-red-100 animate-pulse' : product.quantity <= product.alertThreshold ? 'bg-orange-50 text-orange-600 ring-orange-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'}`}>
                            {product.quantity} EN STOCK
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                             <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                             <button className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition" onClick={() => {/* Delete logic */}}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 pb-20">
              {filteredProducts.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl text-center text-slate-400 font-bold">Aucun produit trouvé.</div>
              ) : (
                currentItems.map(product => (
                  <div key={product.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden text-left">
                    <div className="flex items-center mb-4">
                      {product.imageUrl ? (
                        <img src={`${API_BASE_URL.replace('/api', '')}${product.imageUrl}`} alt={product.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl">{product.name[0]}</div>
                      )}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="text-lg font-black text-slate-900 truncate">{product.name}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{product.reference || 'PAS DE RÉF'}</div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`px-2 py-1 text-[10px] font-black rounded-lg ring-1 ${product.quantity === 0 ? 'bg-red-50 text-red-600 ring-red-100' : product.quantity <= product.alertThreshold ? 'bg-orange-50 text-orange-600 ring-orange-100' : 'bg-emerald-50 text-emerald-600 ring-emerald-100'}`}>
                            STK: {product.quantity}
                         </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Prix Vente</p>
                        <p className="text-sm font-black text-slate-900">{product.sellPrice} {settings.currency}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Fournisseur</p>
                        <p className="text-sm font-bold text-slate-600 truncate">{product.supplier?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                       <button className="flex-1 bg-slate-50 text-blue-600 font-black py-2.5 rounded-xl text-xs">MODIFIER</button>
                       <button className="w-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && !loading && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
          >
            Précédent
          </button>
          <span className="text-slate-600 font-medium px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default Stock;

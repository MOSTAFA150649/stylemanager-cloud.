import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ currency: '€' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      const [statsRes, settingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/stats`, config),
        axios.get(`${API_BASE_URL}/settings`, config)
      ]);
      setStats(statsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0 text-left">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord</h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Résumé de l'activité commerciale et financière.</p>
        </div>
        <div className="flex space-x-3 print:hidden w-full sm:w-auto">
          <button 
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none justify-center bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 transition shadow-lg flex items-center text-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Imprimer
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 lg:opacity-10 group-hover:scale-110 transition">
            <svg className="w-12 lg:w-16 h-12 lg:h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"></path></svg>
          </div>
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase tracking-wider mb-1 lg:mb-2 text-left">Ventes Aujourd'hui</p>
          <h3 className="text-2xl lg:text-4xl font-black text-slate-900 text-left">{stats.todaySales}</h3>
          <p className="text-blue-600 font-bold mt-1 lg:mt-2 text-xs lg:text-base text-left">+{stats.todayRevenue.toFixed(2)} {settings.currency}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 lg:opacity-10 group-hover:scale-110 transition">
             <svg className="w-12 lg:w-16 h-12 lg:h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>
          </div>
          <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase tracking-wider mb-1 lg:mb-2 text-left">CA du Mois</p>
          <h3 className="text-2xl lg:text-4xl font-black text-slate-900 text-left">{stats.monthRevenue.toFixed(2)} {settings.currency}</h3>
          <p className="text-emerald-600 font-bold mt-1 lg:mt-2 text-xs lg:text-base text-left">{stats.monthSales} tickets</p>
        </div>

        <div className={`rounded-3xl shadow-sm p-6 lg:p-8 border relative overflow-hidden group ${stats.monthNetProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`${stats.monthNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} text-[10px] lg:text-sm font-bold uppercase tracking-wider mb-1 lg:mb-2 text-left`}>Bénéfice Net (Mois)</p>
          <h3 className={`text-2xl lg:text-4xl font-black text-left ${stats.monthNetProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{stats.monthNetProfit.toFixed(2)} {settings.currency}</h3>
          <p className="text-slate-500 font-medium mt-1 lg:mt-2 text-xs lg:text-base text-left italic opacity-75">Après frais & achats</p>
        </div>

        <div className={`rounded-3xl shadow-sm p-6 lg:p-8 border relative overflow-hidden group ${stats.lowStockCount > 0 ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100'}`}>
          <p className={`${stats.lowStockCount > 0 ? 'text-orange-600' : 'text-slate-500'} text-[10px] lg:text-sm font-bold uppercase tracking-wider mb-1 lg:mb-2 text-left`}>Alertes Stock</p>
          <h3 className={`text-2xl lg:text-4xl font-black text-left ${stats.lowStockCount > 0 ? 'text-orange-700' : 'text-slate-900'}`}>{stats.lowStockCount}</h3>
          <p className="text-slate-500 font-medium mt-1 lg:mt-2 text-xs lg:text-base text-left">Critiques</p>
        </div>
      </div>
      
      {/* Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Detailed List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900">Articles Critiques</h2>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Actions requises</span>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-slate-500 font-medium italic">Tout est en ordre ! Stock suffisant.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border text-slate-400 font-bold">
                      {p.imageUrl ? (
                        <img src={`${API_BASE_URL.replace('/api', '')}${p.imageUrl}`} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : p.name[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-500 font-mono">Fournisseur: {p.supplier?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${p.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>{p.quantity}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">En stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Overview Tip */}
        <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M21 11.5a1 1 0 0 0-.21-.61l-5-7A1 1 0 0 0 15 3.5h-6a1 1 0 0 0-.79.39l-5 7a1 1 0 0 0-.21.61v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8zM5.67 11.5l3.22-4.5h6.22l3.22 4.5H5.67z"></path></svg>
           </div>
           <h2 className="text-2xl font-black mb-4 relative z-10">Conseil de Gestion</h2>
           <p className="text-slate-300 leading-relaxed mb-6 relative z-10">
             Votre bénéfice net ce mois-ci est calculé en déduisant le coût d'achat des articles vendus et vos dépenses enregistrées (loyer, salaires, etc.) de votre chiffre d'affaires total.
           </p>
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 relative z-10 border border-white/10">
             <div className="flex items-center mb-4">
               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-4">
                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
               </div>
               <p className="font-bold">Analyse de Rentabilité</p>
             </div>
             <p className="text-sm text-slate-400">
               Pour augmenter votre marge, identifiez les produits avec le plus fort écart entre prix d'achat et de vente, ou négociez de meilleurs tarifs avec vos fournisseurs listés.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

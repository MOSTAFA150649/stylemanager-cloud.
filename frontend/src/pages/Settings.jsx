import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Ma Boutique',
    address: '',
    phone: '',
    currency: '€',
    taxRate: 20,
    ticketHeader: '',
    ticketFooter: 'Merci de votre visite !'
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings`);
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error('Erreur chargement settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await axios.put(`${API_BASE_URL}/settings`, settings);
      setSuccess('Paramètres enregistrés avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Paramètres de la Boutique</h1>
        <p className="text-slate-500 mt-1">Configurez les informations qui apparaîtront sur vos tickets et votre monnaie.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Infos Générales</h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom de la Boutique</label>
            <input type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Adresse</label>
            <textarea rows="2" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label>
            <input type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Calculs & Monnaie</h2>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Devise (Symbole)</label>
            <input type="text" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} placeholder="€, $, MAD, CFA..." />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Taux de TVA (%)</label>
            <input type="number" step="0.1" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value)})} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Personnalisation du Ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">En-tête (Message haut)</label>
              <textarea rows="3" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.ticketHeader} onChange={e => setSettings({...settings, ticketHeader: e.target.value})} placeholder="Ex: Bienvenue chez StyleManager..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pied de page (Message bas)</label>
              <textarea rows="3" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={settings.ticketFooter} onChange={e => setSettings({...settings, ticketFooter: e.target.value})} placeholder="Ex: Les articles ne sont pas remboursables..." />
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-white p-4 rounded-2xl shadow-md border border-slate-200">
          {success ? <span className="text-green-600 font-bold">{success}</span> : <span></span>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition transform hover:scale-105">
            Sauvegarder les Paramètres
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../config';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'AUTRE' });
  const [settings, setSettings] = useState({ currency: '€' });

  useEffect(() => {
    fetchExpenses();
    fetchSettings();
  }, []);

  const fetchExpenses = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const res = await axios.get(`${API_BASE_URL}/expenses`, config);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      await axios.post(`${API_BASE_URL}/expenses`, formData, config);
      setShowModal(false);
      setFormData({ description: '', amount: '', category: 'AUTRE' });
      fetchExpenses();
    } catch (err) {
      alert('Erreur lors de l\'ajout de la dépense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette dépense ?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        await axios.delete(`${API_BASE_URL}/expenses/${id}`, config);
        fetchExpenses();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = expenses.map(exp => ({
      ID: exp.id,
      Description: exp.description,
      Catégorie: exp.category,
      Date: new Date(exp.createdAt).toLocaleDateString(),
      Montant: exp.amount,
      Devise: settings.currency
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dépenses");
    XLSX.writeFile(workbook, `depenses_stylemanager_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Dépenses</h1>
          <p className="text-slate-500 mt-1">Suivez vos coûts fixes et variables pour calculer votre profit net.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition"
          >
            Export Excel
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition transform hover:scale-105"
          >
            + Nouvelle Dépense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Catégorie</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Montant</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-semibold text-slate-800">{exp.description}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(exp.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-bold text-red-600">
                  -{exp.amount.toFixed(2)} {settings.currency}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 font-medium">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Ajouter une dépense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <input required type="text" className="w-full p-3 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Loyer Mars" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Montant ({settings.currency})</label>
                <input required type="number" step="0.01" className="w-full p-3 border rounded-xl font-bold text-red-600" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label>
                <select className="w-full p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="LOYER">Loyer</option>
                  <option value="SALAIRE">Salaire</option>
                  <option value="ACHAT">Achat Marchandises</option>
                  <option value="TAXE">Taxes / Impôts</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="flex justify-end pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl mr-2 transition">Annuler</button>
                <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

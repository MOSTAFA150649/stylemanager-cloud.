import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'SELLER' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        await axios.put(`${API_BASE_URL}/users/${editingUser.id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/users`, formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', role: 'SELLER' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce membre de l\'équipe ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion de l'Équipe</h1>
          <p className="text-slate-500 mt-1">Gérez vos vendeurs et leurs accès à la boutique.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', role: 'SELLER' }); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition transform hover:scale-105"
        >
          + Nouveau Membre
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Utilisateur</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rôle</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date d'inscription</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3">
                      {u.email[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-800">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'PROPRIETAIRE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditingUser(u); setFormData({ email: u.email, role: u.role, password: '' }); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 font-medium mr-4">Modifier</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 font-medium">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">{editingUser ? 'Modifier le membre' : 'Ajouter un membre'}</h2>
            {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input required type="email" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{editingUser ? 'Nouveau Mot de passe (optionnel)' : 'Mot de passe'}</label>
                <input required={!editingUser} type="password" placeholder="••••••••" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rôle</label>
                <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="SELLER">Vendeur (Accès limité)</option>
                  <option value="PROPRIETAIRE">Propriétaire (Accès total)</option>
                </select>
              </div>
              <div className="flex justify-end pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl mr-2 transition">Annuler</button>
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

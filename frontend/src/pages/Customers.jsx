import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    loyaltyPoints: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', loyaltyPoints: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${API_BASE_URL}/customers/${editingCustomer.id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/customers`, formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client', error);
      alert('Erreur lors de la sauvegarde du client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Erreur lors de la suppression du client', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0 text-left">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Clients (CRM)</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Gérez votre base de fidélité et vos contacts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-6 rounded-2xl flex items-center justify-center transition shadow-xl shadow-blue-200 transform active:scale-95"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Nouveau Client
        </button>
      </div>

      <div className="mx-2 lg:mx-0">
        {loading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-slate-400">Chargement CRM...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="font-black text-slate-400 text-lg uppercase tracking-widest">Aucun client enregistré</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Client</th>
                    <th className="px-8 py-5">Contact</th>
                    <th className="px-8 py-5 text-center">Fidélité</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black mr-4">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </div>
                          <div>
                            <div className="font-black text-slate-900">{customer.firstName} {customer.lastName}</div>
                            <div className="text-[10px] text-slate-400 font-bold">Depuis le {new Date(customer.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-700">{customer.email || '—'}</div>
                        <div className="text-xs text-slate-500 font-bold">{customer.phone || '—'}</div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full ring-1 ring-emerald-100 uppercase tracking-wider">
                          {customer.loyaltyPoints} PTS
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <button onClick={() => handleOpenModal(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                           <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4 pb-20">
              {customers.map(customer => (
                <div key={customer.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col relative text-left">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mr-4 shadow-lg shadow-blue-200">
                      {customer.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl font-black text-slate-900 truncate">{customer.firstName} {customer.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{customer.phone || 'Pas de tel'}</div>
                    </div>
                    <div className="bg-emerald-50 px-3 py-1 rounded-xl ring-1 ring-emerald-100">
                      <span className="text-emerald-600 font-black text-xs">{customer.loyaltyPoints} <span className="text-[8px]">PTS</span></span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">E-mail</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{customer.email || '—'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenModal(customer)} className="flex-1 bg-slate-100 text-slate-700 font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-transform">Modifier</button>
                    <button onClick={() => handleDelete(customer.id)} className="w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingCustomer ? 'Modifier le client' : 'Ajouter un client'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
                  <input type="text" required className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                  <input type="text" required className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input type="tel" className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              {editingCustomer && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Points de fidélité</label>
                  <input type="number" min="0" className="w-full p-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.loyaltyPoints} onChange={e => setFormData({...formData, loyaltyPoints: parseInt(e.target.value) || 0})} />
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded shadow-sm hover:bg-slate-50 mr-3 transition">Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700 transition">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

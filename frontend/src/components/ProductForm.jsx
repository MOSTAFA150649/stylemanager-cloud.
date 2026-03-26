import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const ProductForm = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Photo, 2: Détails
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    buyPrice: '',
    sellPrice: '',
    quantity: '0',
    alertThreshold: '5',
    categoryId: '',
    supplierId: '',
    imageUrl: ''
  });

  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ size: '', color: '', sku: '', quantity: '1' });

  const handleAddVariant = () => {
    if (!newVariant.size && !newVariant.color) return;
    setVariants([...variants, { ...newVariant, quantity: Number(newVariant.quantity) }]);
    setNewVariant({ size: '', color: '', sku: '', quantity: '1' });
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/suppliers`);
        setSuppliers(res.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setStep(2); // On passe aux détails
    }
  };

  const handleRetake = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
        setUploading(false);
        return;
      }

      let finalImageUrl = formData.imageUrl;

      // 1. Upload l'image d'abord si elle existe
      if (photoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', photoFile);
        try {
          const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formDataUpload, {
            headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          finalImageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          const msg = uploadErr.response?.data?.error || "Erreur de connexion au serveur d'images.";
          alert(`Erreur Upload: ${msg}`);
          setUploading(false);
          return;
        }
      }

      // 2. Créer le produit
      const productPayload = { ...formData, imageUrl: finalImageUrl, variants };
      await axios.post(`${API_BASE_URL}/products`, productPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
    } catch (error) {
      console.error('Erreur save final', error);
      let errorMsg = "Erreur lors de la sauvegarde.";
      if (error.response) {
        errorMsg = `Serveur (${error.response.status}): ${error.response.data?.error || error.response.statusText}`;
      } else if (error.request) {
        errorMsg = "Pas de réponse du serveur (Problème réseau).";
      } else {
        errorMsg = `Erreur: ${error.message}`;
      }
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 1 ? '1. Prise de photo' : '2. Détails du produit'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-500 font-bold px-2 text-xl">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <p className="text-slate-500 text-center text-sm">Prenez en photo votre article ou sélectionnez une image de votre galerie.</p>
              
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition transform hover:scale-105">
                Ouvrir la Caméra
                {/* L'attribut capture="environment" force la caméra arrière sur mobile */}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handlePhotoCapture} 
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-center mb-6 relative group">
                {photoPreview && (
                  <div className="relative">
                    <img src={photoPreview} alt="Aperçu" className="h-32 w-32 object-cover rounded-xl shadow-md border-4 border-slate-100" />
                    <button type="button" onClick={handleRetake} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow hover:bg-red-600 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom du produit</label>
                  <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: T-Shirt Blanc Logo" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catégorie</label>
                  <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Sans catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fournisseur</label>
                  <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                    <option value="">Aucun fournisseur</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Réf / Code-barre</label>
                  <input type="text" className="w-full p-2 border rounded outline-none" 
                    value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantité Initiale</label>
                  <input required type="number" className="w-full p-2 border rounded outline-none" 
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prix d'Achat (€)</label>
                  <input type="number" step="0.01" className="w-full p-2 border rounded outline-none" 
                    value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prix de Vente (€)</label>
                  <input required type="number" step="0.01" className="w-full p-2 border rounded outline-none" 
                    value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} />
                </div>
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">Variantes (Tailles / Couleurs) - Optionnel</h3>
                  
                  {variants.length > 0 && (
                    <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 border-b pb-2">
                          <tr><th className="pb-2">Taille</th><th className="pb-2">Couleur</th><th className="pb-2">SKU</th><th className="pb-2">Qté</th><th></th></tr>
                        </thead>
                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={i} className="border-b last:border-0 border-slate-100">
                              <td className="py-2 text-slate-800 font-medium">{v.size || '-'}</td>
                              <td className="py-2 text-slate-800">{v.color || '-'}</td>
                              <td className="py-2 text-slate-500">{v.sku || '-'}</td>
                              <td className="py-2 font-bold text-slate-800">{v.quantity}</td>
                              <td className="py-2 text-right">
                                <button type="button" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <input type="text" placeholder="Taille (S, M...)" className="w-[20%] p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} />
                    <input type="text" placeholder="Couleur" className="w-[25%] p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} />
                    <input type="text" placeholder="Réf Variante (Optionnel)" className="w-[30%] p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={newVariant.sku} onChange={e => setNewVariant({...newVariant, sku: e.target.value})} />
                    <input type="number" placeholder="Qté" className="w-[15%] p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none" value={newVariant.quantity} onChange={e => setNewVariant({...newVariant, quantity: e.target.value})} />
                    <button type="button" onClick={handleAddVariant} className="bg-slate-200 text-slate-700 w-[10%] rounded hover:bg-slate-300 font-bold transition flex items-center justify-center">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {step === 2 && (
          <div className="p-4 border-t bg-slate-50 flex justify-end">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium mr-2 hover:bg-slate-200 rounded">
              Annuler
            </button>
            <button type="submit" form="productForm" disabled={uploading} className="bg-slate-900 text-white font-bold py-2 px-6 rounded shadow hover:bg-slate-800 disabled:opacity-50 flex items-center">
              {uploading ? 'Enregistrement...' : 'Enregistrer le stock'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;

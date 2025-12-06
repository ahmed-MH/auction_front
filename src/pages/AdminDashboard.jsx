import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Package, DollarSign, Tag, Plus, Edit2, Trash2, X, Search, Lock, Unlock, RefreshCw, AlertCircle, LogOut, TrendingUp, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminDashboard() {
 const [activeTab, setActiveTab] = useState('stats');
 const [showModal, setShowModal] = useState(false);
 const [modalType, setModalType] = useState('');
 const [editingItem, setEditingItem] = useState(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryName, setCategoryName] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [categories, setCategories] = useState([]);
 const [users, setUsers] = useState([]);
 const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalRevenue: 0, creditsPurchased: 0 });

 const getCurrentAdminId = () => localStorage.getItem('userId') || JSON.parse(localStorage.getItem('user') || '{}').id;
 const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('jwtToken') || '';
 const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` });

 useEffect(() => {
 const token = getAuthToken();
 const user = JSON.parse(localStorage.getItem('user') || '{}');
 const role = user.role || localStorage.getItem('userRole');
 if (!token) { window.location.href = '/auth'; return; }
 if (role !== 'ADMIN') { alert('Accès refusé'); window.location.href = '/auth'; return; }
 }, []);

 const handleLogout = () => {
 ['token', 'jwtToken', 'userEmail', 'userName', 'userRole', 'userId', 'user'].forEach(k => localStorage.removeItem(k));
 window.location.href = '/auth';
 };

 const fetchStats = async () => {
 try {
 setLoading(true);
 const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error(`Erreur ${res.status}`);
 const data = await res.json();
 setStats(data);
 setError(null);
 } catch (err) { setError('Erreur stats'); setStats({ totalUsers: users.length, totalProducts: 0, totalRevenue: 0, creditsPurchased: 0 }); } finally { setLoading(false); }
 };

 const fetchCategories = async () => {
 try {
 setLoading(true);
 const res = await fetch(`${API_BASE_URL}/categories`, { headers: getHeaders() });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error(`Erreur ${res.status}`);
 const data = await res.json();
 setCategories(Array.isArray(data) ? data : []);
 setError(null);
 } catch (err) { setError(err.message); setCategories([]); } finally { setLoading(false); }
 };

 const fetchUsers = async () => {
 try {
 setLoading(true);
 const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error(`Erreur ${res.status}`);
 const data = await res.json();
 const enriched = await Promise.all((Array.isArray(data) ? data : []).map(async (u) => {
 try {
 const eg = await fetch(`${API_BASE_URL}/users/${u.id}/encheres-gagnees`, { headers: getHeaders() });
 const ep = await fetch(`${API_BASE_URL}/users/${u.id}/encheres-participees`, { headers: getHeaders() });
 let encheresG = [], encheresP = [], totalGains = 0;
 if (eg.ok) { encheresG = await eg.json(); totalGains = encheresG.reduce((s, e) => s + ((e.prixFinal || 0) - (e.prixInitial || 0)), 0); }
 if (ep.ok) encheresP = await ep.json();
 return { ...u, encheresGagnees: encheresG.length, totalGains, encheresParticipees: encheresP.length, derniereEnchere: encheresP[0] || null };
 } catch { return { ...u, encheresGagnees: 0, totalGains: 0, encheresParticipees: 0, derniereEnchere: null }; }
 }));
 setUsers(enriched);
 setError(null);
 } catch (err) { setError('Erreur utilisateurs'); setUsers([]); } finally { setLoading(false); }
 };

 useEffect(() => { const t = getAuthToken(); if (t) { fetchStats(); fetchCategories(); fetchUsers(); } }, []);

 const handleTabChange = (tab) => { setActiveTab(tab); if (tab === 'stats') fetchStats(); else if (tab === 'categories') fetchCategories(); else if (tab === 'users') fetchUsers(); };

 const handleAddCategory = async () => {
 if (!categoryName.trim()) { setError('Nom vide'); return; }
 try {
 setLoading(true); setError(null);
 const res = await fetch(`${API_BASE_URL}/categories`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ libelleCategorie: categoryName.trim(), description: "" }) });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error('Erreur ajout');
 await fetchCategories(); setShowModal(false); setCategoryName(''); alert('Ajouté !');
 } catch (err) { setError(err.message); } finally { setLoading(false); }
 };

 const handleEditCategory = async () => {
 if (!categoryName.trim()) { setError('Nom vide'); return; }
 try {
 setLoading(true); setError(null);
 const res = await fetch(`${API_BASE_URL}/categories/${editingItem.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ libelleCategorie: categoryName.trim(), description: editingItem.description || "" }) });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error('Erreur modif');
 await fetchCategories(); setShowModal(false); setEditingItem(null); setCategoryName(''); alert('Modifié !');
 } catch (err) { setError(err.message); } finally { setLoading(false); }
 };

 const handleDeleteCategory = async (id) => {
 if (!window.confirm('Supprimer ?')) return;
 try {
 setLoading(true); setError(null);
 const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE', headers: getHeaders() });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error('Erreur suppression');
 await fetchCategories(); alert('Supprimé !');
 } catch (err) { setError(err.message); } finally { setLoading(false); }
 };

 const toggleUserStatus = async (id, curr) => {
 try {
 setLoading(true); setError(null); const ns = !curr;
 const res = await fetch(`${API_BASE_URL}/users/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ etatCompte: ns }) });
 if (res.status === 401 || res.status === 403) { handleLogout(); return; }
 if (!res.ok) throw new Error('Erreur statut');
 await fetchUsers(); alert(`${ns ? 'Activé' : 'Bloqué'} !`);
 } catch (err) { setError(err.message); } finally { setLoading(false); }
 };

 const openModal = (t, i = null) => { setModalType(t); setEditingItem(i); setCategoryName(i?.libelleCategorie || ''); setShowModal(true); setError(null); };
 const closeModal = () => { setShowModal(false); setEditingItem(null); setCategoryName(''); setError(null); };
 const filteredUsers = users.filter(u => u?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || u?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
 const refreshData = () => { if (activeTab === 'stats') fetchStats(); else if (activeTab === 'categories') fetchCategories(); else if (activeTab === 'users') fetchUsers(); };
 const userName = localStorage.getItem('userName') || 'Admin';
 const currentAdminId = getCurrentAdminId();

 return (
 <div className="min-h-screen bg-gray-50">
 <header className="bg-white shadow-sm border-b">
 <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
 <div><h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1><p className="text-sm text-gray-600 mt-1">Bienvenue, {userName}</p></div>
 <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"><LogOut className="w-4 h-4" />Déconnexion</button>
 </div>
 </header>

 <div className="max-w-7xl mx-auto px-4 py-6">
 {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><div className="flex-1"><p className="text-red-800 font-medium">Erreur</p><p className="text-red-700 text-sm">{error}</p></div><button onClick={() => setError(null)} className="text-red-600"><X className="w-5 h-5" /></button></div>}

 <div className="bg-white rounded-lg shadow-sm mb-6">
 <div className="flex border-b">
 {['stats', 'categories', 'users'].map(t => <button key={t} onClick={() => handleTabChange(t)} className={`px-6 py-3 font-medium ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>{t === 'stats' ? <><BarChart3 className="inline w-5 h-5 mr-2" />Statistiques</> : t === 'categories' ? <><Tag className="inline w-5 h-5 mr-2" />Catégories</> : <><Users className="inline w-5 h-5 mr-2" />Utilisateurs</>}</button>)}
 </div>
 </div>

 {activeTab === 'stats' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[{l:'Utilisateurs',v:stats.totalUsers,i:Users,c:'blue'},{l:'Produits',v:stats.totalProducts,i:Package,c:'green'},{l:'Revenus',v:`${stats.totalRevenue} TND`,i:DollarSign,c:'purple'},{l:'Crédits',v:stats.creditsPurchased,i:Tag,c:'orange'}].map((s,i)=><div key={i} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 border-${s.c}-500`}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">{s.l}</p><p className="text-3xl font-bold">{s.v||0}</p></div><s.i className={`w-12 h-12 text-${s.c}-500 opacity-20`}/></div></div>)}</div>}

 {activeTab === 'categories' && <div className="bg-white rounded-lg shadow-sm"><div className="p-6 border-b flex justify-between items-center"><h2 className="text-xl font-semibold">Gestion des Catégories</h2><button onClick={() => openModal('add')} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"><Plus className="w-5 h-5" />Nouvelle</button></div><table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y">{loading && categories.length === 0 ? <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</td></tr> : categories.length === 0 ? <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Aucune catégorie</td></tr> : categories.map(c => <tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm">{c.id}</td><td className="px-6 py-4 text-sm font-medium">{c.libelleCategorie||c.nom||'-'}</td><td className="px-6 py-4 text-sm text-right"><button onClick={() => openModal('edit', c)} disabled={loading} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-4 h-4 inline" /></button><button onClick={() => handleDeleteCategory(c.id)} disabled={loading} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4 inline" /></button></td></tr>)}</tbody></table></div>}

 {activeTab === 'users' && <div className="bg-white rounded-lg shadow-sm"><div className="p-6 border-b"><h2 className="text-xl font-semibold mb-4">Liste Utilisateurs</h2><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" /></div></div><table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activité</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y">{loading && users.length === 0 ? <tr><td colSpan="6" className="px-6 py-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan="6" className="px-6 py-8 text-center">Aucun utilisateur</td></tr> : filteredUsers.map(u => {const isCurr = String(u.id) === String(currentAdminId); return <tr key={u.id} className={`hover:bg-gray-50 ${isCurr?'bg-blue-50':''}`}><td className="px-6 py-4 text-sm font-medium">{u.nom||'N/A'}{isCurr && <span className="ml-2 text-xs text-blue-600 font-semibold">(Vous)</span>}</td><td className="px-6 py-4 text-sm text-gray-600">{u.email}</td><td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role==='ADMIN'?'bg-purple-100 text-purple-800':'bg-blue-100 text-blue-800'}`}>{u.role||'USER'}</span></td><td className="px-6 py-4 text-sm"><span className={`px-3 py-1 rounded-full text-xs font-medium ${u.etatCompte?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{u.etatCompte?'Actif':'Bloqué'}</span></td><td className="px-6 py-4 text-sm"><div className="space-y-1">{u.encheresGagnees>0&&<div className="flex items-center gap-1 text-green-700"><Award className="w-4 h-4"/><span className="text-xs">{u.encheresGagnees} gagné{u.encheresGagnees>1?'es':''} • +{u.totalGains} TND</span></div>}{u.encheresParticipees>0&&<div className="flex items-center gap-1 text-blue-700"><TrendingUp className="w-4 h-4"/><span className="text-xs">{u.encheresParticipees} en cours</span></div>}{u.encheresGagnees===0&&u.encheresParticipees===0&&<span className="text-xs text-gray-400">Aucune activité</span>}</div></td><td className="px-6 py-4 text-sm text-right">{!isCurr&&<button onClick={() => toggleUserStatus(u.id, u.etatCompte)} disabled={loading} className={`px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 ${u.etatCompte?'bg-red-100 text-red-700 hover:bg-red-200':'bg-green-100 text-green-700 hover:bg-green-200'}`}>{u.etatCompte?<><Lock className="w-4 h-4 inline mr-1"/>Bloquer</>:<><Unlock className="w-4 h-4 inline mr-1"/>Débloquer</>}</button>}</td></tr>})}</tbody></table></div>}
 </div>

 {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"><div className="flex items-center justify-between p-6 border-b"><h3 className="text-xl font-semibold">{modalType === 'add' ? 'Nouvelle Catégorie' : 'Modifier Catégorie'}</h3><button onClick={closeModal}><X className="w-6 h-6" /></button></div><div className="p-6"><div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Nom</label><input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} onKeyPress={(e) => {if (e.key === 'Enter') modalType === 'add' ? handleAddCategory() : handleEditCategory();}} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ex: Électronique" disabled={loading} autoFocus /></div><div className="flex gap-3 justify-end"><button onClick={closeModal} disabled={loading} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Annuler</button><button onClick={modalType === 'add' ? handleAddCategory : handleEditCategory} disabled={loading || !categoryName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{loading && <RefreshCw className="w-4 h-4 animate-spin" />}{modalType === 'add' ? 'Ajouter' : 'Enregistrer'}</button></div></div></div></div>}
 </div>
 );
}
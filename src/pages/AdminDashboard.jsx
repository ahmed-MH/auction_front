import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, Package, DollarSign, Tag, Plus, Edit2, X, Search,
  Lock, Unlock, RefreshCw, AlertCircle, LogOut, TrendingUp, Award,
  Activity, Download, Gavel, Play, CheckCircle, Eye, Bell, Trash2,
  MessageSquare, Mail, Clock
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import { useModal } from '../context/ModalContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { alert, confirm } = useModal();

  // ===========================================================================
  // 1. STATE & LOGIQUE
  // ===========================================================================

  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Données
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [encheres, setEncheres] = useState([]);
  const [selectedEnchere, setSelectedEnchere] = useState(null);

  // Helper: Détection robuste de format de date (String ISO ou Array [yyyy, MM, dd, ...])
  const parseDate = (date) => {
    if (!date) return null;
    if (Array.isArray(date)) {
      // [year, month, day, hour, minute, second]
      return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0, date[5] || 0);
    }
    return new Date(date);
  };

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0, totalProducts: 0, totalRevenue: 0, creditsPurchased: 0
  });
  const [topUsers, setTopUsers] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Interface
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [enchereFilter, setEnchereFilter] = useState('all');

  // New Admin Creation State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ nom: '', email: '', password: '' });

  // New State for Blocking Error Modal
  const [blockerError, setBlockerError] = useState(null);

  // Refs
  const prevUsersRef = useRef([]);
  const prevEncheresRef = useRef([]);
  const isFirstLoad = useRef(true);

  // Auth - Récupéré via localStorage (token géré par axios interceptor)
  const userName = localStorage.getItem('userName') || 'Admin';
  const currentAdminId = localStorage.getItem('userId');

  // --- NOTIFICATIONS ---
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('adminNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (type, message) => {
    setNotifications(prev => [{ id: Date.now(), type, message, timestamp: new Date() }, ...prev].slice(0, 50));
  };
  const removeNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  // --- INITIALISATION ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/api/auth'); return; }
    loadDashboardData();
    const interval = setInterval(() => checkForNewActivities(), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') fetchMessages();
  }, [activeTab]);

  // --- POLLING INTELLIGENT ---
  const checkForNewActivities = async () => {
    try {
      const usersRes = await api.get('/api/users');
      const currentUsers = usersRes.data;

      if (!isFirstLoad.current) {
        currentUsers.forEach(curr => {
          const prev = prevUsersRef.current.find(p => p.id === curr.id);
          if (prev && curr.soldeCredit > prev.soldeCredit) {
            addNotification('success', `💰 ${curr.nom} a acheté ${curr.soldeCredit - prev.soldeCredit} crédits !`);
          }
        });
      }
      prevUsersRef.current = currentUsers;

      const encheresRes = await api.get('/api/encheres');
      const currentEncheresData = encheresRes.data;

      // OPTIMIZATION: Use the enriched DTO data directly instead of fetching each enchere individually
      const enrichedCurrent = currentEncheresData;

      if (!isFirstLoad.current) {
        const newProducts = enrichedCurrent.filter(curr => !prevEncheresRef.current.find(prev => prev.id === curr.id));
        newProducts.forEach(p => addNotification('info', `📦 Nouveau produit : "${p.nomProduit}"`));

        enrichedCurrent.forEach(curr => {
          const prev = prevEncheresRef.current.find(p => p.id === curr.id);
          if (prev) {
            if (curr.montantActuel > prev.montantActuel) addNotification('warning', `🔨 Nouvelle enchère sur "${curr.nomProduit}"`);
            const wasActive = new Date(prev.dateFin) > new Date();
            const isNowFinished = new Date(curr.dateFin) <= new Date();
            if (wasActive && isNowFinished) addNotification('success', `🏆 Enchère terminée : "${curr.nomProduit}" !`);
          }
        });
      }
      prevEncheresRef.current = enrichedCurrent;
      if (isFirstLoad.current) isFirstLoad.current = false;
    } catch (e) { console.error("Polling error", e); }
  };

  const loadDashboardData = () => {
    fetchCategories();
    fetchStatsAndUsers();
    fetchEncheresAndCharts();
    fetchMessages();
  };

  const handleLogout = async () => {
    if (await confirm("Voulez-vous vraiment vous déconnecter ?", { title: "Déconnexion" })) {
      localStorage.clear();
      navigate('/auth');
    }
  };

  // --- API ---
  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/messages');
      setMessages(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const deleteMessage = async (id) => {
    if (!(await confirm("Supprimer ce message ?", { title: "Confirmation" }))) return;
    try {
      await api.delete(`/api/messages/${id}`);
      fetchMessages();
      addNotification('success', 'Message supprimé');
    } catch (e) { await alert("Erreur lors de la suppression", { variant: 'error' }); }
  };

  const fetchStatsAndUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/api/users');
      const usersData = usersRes.data;

      if (prevUsersRef.current.length === 0) prevUsersRef.current = usersData;

      let globalRevenue = 0;
      let totalEncheresCount = 0;

      const enrichedUsers = await Promise.all(usersData.map(async (u) => {
        try {
          const partRes = await api.get(`/api/participations/utilisateur/${u.id}`);
          const participations = partRes.data;

          const prodRes = await api.get(`/api/encheres/utilisateur/${u.id}`);
          const products = prodRes.data;

          totalEncheresCount += products.length;
          const wins = participations.filter(p => p.montant > 0);
          const totalGains = wins.reduce((acc, curr) => acc + curr.montant, 0);
          globalRevenue += totalGains;
          return { ...u, encheresGagnees: wins.length, totalGains, encheresParticipees: participations.length, encheresAjoutees: products.length };
        } catch { return { ...u, encheresGagnees: 0, totalGains: 0, encheresParticipees: 0, encheresAjoutees: 0 }; }
      }));

      setStats({ totalUsers: usersData.length, totalProducts: totalEncheresCount, totalRevenue: globalRevenue, creditsPurchased: 0 });
      setUsers(enrichedUsers);
      const activeUsers = enrichedUsers.filter(u => u.encheresParticipees > 0 || u.encheresAjoutees > 0);
      setTopUsers(activeUsers.sort((a, b) => (b.encheresParticipees + b.encheresAjoutees) - (a.encheresParticipees + a.encheresAjoutees)).slice(0, 10));
    } catch (err) { setError("Erreur lors du chargement des statistiques"); } finally { setLoading(false); }
  };

  // --- FONCTION GRAPHIQUE ROBUSTE ---
  const fetchEncheresAndCharts = async () => {
    const chartMap = new Map();
    const today = new Date();
    // 1. Initialiser les 7 derniers jours (même vides)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      chartMap.set(key, { date: label, encheres: 0, participants: 0, revenus: 0 });
    }

    try {
      const res = await api.get('/api/encheres');
      // OPTIMIZATION: Backend now returns full participation data
      const enrichedEncheres = res.data;

      setEncheres(enrichedEncheres);
      if (prevEncheresRef.current.length === 0) prevEncheresRef.current = enrichedEncheres;

      // 2. Remplir avec données
      enrichedEncheres.forEach(enchere => {
        const startDate = parseDate(enchere.dateDebut);
        if (startDate) {
          const dateKey = startDate.toISOString().split('T')[0];
          if (chartMap.has(dateKey)) chartMap.get(dateKey).encheres += 1;
        }
        if (enchere.participations && Array.isArray(enchere.participations)) {
          enchere.participations.forEach(p => {
            const partDate = parseDate(p.dateParticipation);
            if (partDate) {
              const datePartKey = partDate.toISOString().split('T')[0];
              if (chartMap.has(datePartKey)) {
                const stat = chartMap.get(datePartKey);
                stat.participants += 1;
                stat.revenus += (Number(p.montant) || 0);
              }
            }
          });
        }
      });
    } catch (err) { console.error("Erreur chart", err); }
    finally { setChartData(Array.from(chartMap.values())); }
  };

  // --- HANDLERS ---
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'stats') { fetchStatsAndUsers(); fetchEncheresAndCharts(); }
    else if (tabId === 'categories') fetchCategories();
    else if (tabId === 'users') fetchStatsAndUsers();
    else if (tabId === 'encheres') fetchEncheresAndCharts();
    else if (tabId === 'messages') fetchMessages();
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      setLoading(true);
      await api.post('/api/categories', { libelleCategorie: categoryName.trim(), description: "" });
      await fetchCategories();
      setShowModal(false);
      setCategoryName('');
      addNotification('success', 'Catégorie ajoutée !');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleEditCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      setLoading(true);
      await api.put(`/api/categories/${editingItem.id}`, { libelleCategorie: categoryName.trim(), description: editingItem.description || "" });
      await fetchCategories();
      setShowModal(false);
      setEditingItem(null);
      setCategoryName('');
      addNotification('success', 'Catégorie modifiée !');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleDeleteCategory = async (id) => {
    // 1. Confirm intention
    if (!(await confirm("Voulez-vous vraiment supprimer cette catégorie ?", { title: "Suppression" }))) return;

    try {
      setLoading(true);
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
      addNotification('success', 'Catégorie supprimée !');
    } catch (err) {
      // 2. Catch backend validation error
      const msg = err.response?.data?.message || err.message;
      if (msg && (msg.toLowerCase().includes("contient des enchères") || msg.toLowerCase().includes("impossible de supprimer"))) {
        // Show specific modal
        setBlockerError("Cette catégorie ne peut pas être supprimée car elle contient des enchères actives ou passées. Veuillez d'abord supprimer les enchères associées.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, curr) => {
    try {
      setLoading(true);
      await api.patch(`/api/users/${id}/status`, { etatCompte: !curr });
      await fetchStatsAndUsers();
      addNotification('success', `Utilisateur ${!curr ? 'activé' : 'bloqué'} !`);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.nom || !newAdmin.email || !newAdmin.password) return alert("Veuillez remplir tous les champs");
    try {
      setLoading(true);
      await api.post('/api/admin/create', newAdmin);
      await fetchStatsAndUsers(); // Refresh list
      setShowAdminModal(false);
      setNewAdmin({ nom: '', email: '', password: '' });
      addNotification('success', 'Administrateur créé avec succès !');
    } catch (err) { setError(err.response?.data?.message || err.message); } finally { setLoading(false); }
  };

  const deleteEnchere = async (id) => {
    if (!(await confirm('Supprimer cette enchère définitivement ?', { title: "Suppression" }))) return;
    try {
      setLoading(true);
      await api.delete(`/api/encheres/${id}`);
      await fetchEncheresAndCharts();
      addNotification('success', 'Enchère supprimée !');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const exportData = () => { const dataStr = JSON.stringify(activeTab === 'users' ? users : activeTab === 'encheres' ? encheres : categories, null, 2); const linkElement = document.createElement('a'); linkElement.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)); linkElement.setAttribute('download', 'export.json'); linkElement.click(); };

  const openModal = (t, i = null) => { setModalType(t); setEditingItem(i); setCategoryName(i?.libelleCategorie || ''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingItem(null); setCategoryName(''); };

  const filteredUsers = users.filter(u => u?.nom?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEncheres = encheres.filter(e => {
    const matchSearch = e?.nomProduit?.toLowerCase().includes(searchTerm.toLowerCase());
    if (enchereFilter === 'all') return matchSearch;
    if (enchereFilter === 'active') return matchSearch && e.statut === 'EN_COURS';
    if (enchereFilter === 'expired') return matchSearch && e.statut !== 'EN_COURS';
    return matchSearch;
  });

  // ===========================================================================
  // 2. RENDU DU DESIGN (PREMIUM)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* HEADER AVEC NOTIFICATIONS STYLISÉES */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Bienvenue, {userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => loadDashboardData()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Actualiser">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50 transform origin-top-right transition-all">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800">Notifications ({notifications.length})</h3>
                      {notifications.length > 0 && (
                        <button onClick={() => setNotifications([])} className="text-xs text-orange-600 hover:text-orange-700 font-medium">Tout effacer</button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">Aucune nouvelle notification</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors ${n.type === 'success' ? 'bg-green-50/50' : n.type === 'warning' ? 'bg-yellow-50/50' : ''}`}>
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-red-500 self-start"><X className="w-4 h-4" /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm">
                <LogOut className="w-4 h-4" />Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1"><p className="text-red-800 font-semibold">Erreur</p><p className="text-red-700 text-sm">{error}</p></div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {[
              { id: 'stats', label: 'Statistiques', icon: BarChart3 },
              { id: 'encheres', label: 'Enchères', icon: Gavel },
              { id: 'categories', label: 'Catégories', icon: Tag },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'messages', label: 'Messages', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 min-w-[140px] px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                    ? 'border-b-4 border-orange-600 text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENU : STATS */}
        {activeTab === 'stats' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4"><Users className="w-8 h-8 opacity-80" /><span className="text-xs bg-blue-400 px-2 py-1 rounded-full">+12%</span></div>
                <p className="text-sm opacity-90 mb-1">Utilisateurs</p><p className="text-4xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4"><Package className="w-8 h-8 opacity-80" /><span className="text-xs bg-green-400 px-2 py-1 rounded-full">+8%</span></div>
                <p className="text-sm opacity-90 mb-1">Enchères</p><p className="text-4xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4"><DollarSign className="w-8 h-8 opacity-80" /><span className="text-xs bg-purple-400 px-2 py-1 rounded-full">+23%</span></div>
                <p className="text-sm opacity-90 mb-1">Revenus (Est.)</p><p className="text-4xl font-bold">{stats.totalRevenue.toFixed(0)} DT</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4"><Activity className="w-8 h-8 opacity-80" /><span className="text-xs bg-orange-400 px-2 py-1 rounded-full">+15%</span></div>
                <p className="text-sm opacity-90 mb-1">Participations</p><p className="text-4xl font-bold">{topUsers.reduce((a, u) => a + u.encheresParticipees, 0)}</p>
              </div>
            </div>

            {/* --- GRAPHIQUES CORRIGÉS ET STYLISÉS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Évolution (7 jours)</h3>

                {/* FIX POUR AFFICHAGE BLANC : Style inline forcé */}
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} domain={[0, 'auto']} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="encheres" stroke="#f97316" strokeWidth={2} name="Enchères" dot={{ r: 4 }} isAnimationActive={false} />
                      <Line type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={2} name="Offres" dot={{ r: 4 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Volume d'offres (7 jours)</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 'auto']} />
                      <Tooltip formatter={(value) => [`${value} DT`, 'Revenus']} />
                      <Legend />
                      <Bar dataKey="revenus" fill="#10b981" name="Volume (DT)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">🏆 Top Utilisateurs</h2><button onClick={exportData} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white"><Download className="w-4 h-4" />Exporter</button></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-4 text-left">Rang</th><th className="px-6 py-4 text-left">Utilisateur</th><th className="px-6 py-4 text-center">Créées</th><th className="px-6 py-4 text-center">Participations</th><th className="px-6 py-4 text-right">Gains</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <td className="px-6 py-4"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-400 text-white' : 'bg-orange-100 text-gray-700'}`}>{idx + 1}</div></td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{user.nom}</td>
                        <td className="px-6 py-4 text-center">{user.encheresAjoutees}</td>
                        <td className="px-6 py-4 text-center">{user.encheresParticipees}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">{user.totalGains} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CONTENU : MESSAGES (STYLE PREMIUM AJOUTÉ) */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6" /> Boîte de Réception</h2>
                <p className="opacity-90 text-sm mt-1">{messages.length} message(s)</p>
              </div>
              <button onClick={fetchMessages} className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition"><RefreshCw className="w-5 h-5 text-white" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600">Auteur</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600">Sujet</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600">Message</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-12 text-center text-gray-500">Chargement...</td></tr>
                  ) : messages.length === 0 ? (
                    <tr><td colSpan="5" className="p-16 text-center text-gray-400"><Mail className="w-12 h-12 mb-4 mx-auto text-gray-300" />Aucun message.</td></tr>
                  ) : messages.map(msg => (
                    <tr key={msg.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        <div className="font-medium text-gray-700">{new Date(msg.dateEnvoi).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(msg.dateEnvoi).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">{msg.name ? msg.name.charAt(0).toUpperCase() : "?"}</div>
                          <div><p className="font-bold text-gray-900 text-sm">{msg.name}</p><p className="text-xs text-gray-500">{msg.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 text-sm">{msg.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={msg.content}>{msg.content}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => setSelectedMessage(msg)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => deleteMessage(msg.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENU : ENCHERES */}
        {activeTab === 'encheres' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">Gestion des Enchères</h2>
              <div className="flex gap-2">
                <select onChange={(e) => setEnchereFilter(e.target.value)} className="border rounded p-2 text-sm"><option value="all">Toutes</option><option value="active">Actives</option><option value="expired">Terminées</option></select>
                <div className="relative"><Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" /><input placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 border rounded" /></div>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left">Titre</th><th className="px-6 py-4 text-center">Statut</th><th className="px-6 py-4 text-center">Prix</th><th className="px-6 py-4 text-center">Participants</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEncheres.map(e => {
                  return (
                    <tr key={e.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4 font-semibold">{e.nomProduit}</td>
                      <td className="px-6 py-4 text-center">{e.statut === 'EN_COURS' ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1"><Play className="w-3 h-3" />Active</span> : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Terminée</span>}</td>
                      <td className="px-6 py-4 text-center font-bold text-orange-600">{e.montantActuel} DT</td>
                      <td className="px-6 py-4 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{e.nombreParticipants}</span></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => setSelectedEnchere(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => deleteEnchere(e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENU : CATÉGORIES */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Catégories</h2>
              <button onClick={() => openModal('add')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:to-orange-700 shadow-md"><Plus className="w-4 h-4" />Ajouter</button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Nom</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold text-xs">{c.id}</span></td>
                    <td className="px-6 py-4 font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-orange-500" />{c.libelleCategorie}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal('edit', c)} className="text-orange-600 hover:bg-orange-100 px-3 py-1 rounded flex items-center gap-1">
                          <Edit2 className="w-4 h-4" />Modifier
                        </button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENU : UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
              <div className="flex gap-2 items-center">
                <button onClick={() => setShowAdminModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
                  <Users className="w-4 h-4" /> Nouveau Admin
                </button>
                <div className="relative"><Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" /><input placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 border rounded-lg" /></div>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left">Nom</th><th className="px-6 py-4 text-left">Email</th><th className="px-6 py-4 text-center">Rôle</th><th className="px-6 py-4 text-center">Statut</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 font-semibold">{u.nom}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{u.role || 'USER'}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${u.etatCompte ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.etatCompte ? 'Actif' : 'Bloqué'}</span></td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== parseInt(currentAdminId) && <button onClick={() => toggleUserStatus(u.id, u.etatCompte)} className={`px-3 py-1 rounded flex items-center gap-1 ml-auto ${u.etatCompte ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>{u.etatCompte ? <><Lock className="w-4 h-4" />Bloquer</> : <><Unlock className="w-4 h-4" />Activer</>}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL CATEGORIE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100"><h3 className="text-xl font-bold text-gray-900">{modalType === 'add' ? 'Nouvelle Catégorie' : 'Modifier'}</h3></div>
            <div className="p-6"><input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nom de la catégorie..." autoFocus /></div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
              <button onClick={modalType === 'add' ? handleAddCategory : handleEditCategory} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKER ERROR MODAL */}
      {blockerError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-l-4 border-red-500 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Action Impossible</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {blockerError}
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setBlockerError(null)}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USER DETAILS */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
              <div><h3 className="text-2xl font-bold">{selectedUser.nom}</h3><p className="opacity-90">{selectedUser.email}</p></div>
              <button onClick={() => setSelectedUser(null)} className="hover:bg-white/20 p-1 rounded"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-xs uppercase text-gray-500 font-bold">Enchères Créées</p><p className="text-2xl font-bold text-blue-600">{selectedUser.encheresAjoutees}</p></div>
              <div className="bg-green-50 p-4 rounded-lg text-center"><p className="text-xs uppercase text-gray-500 font-bold">Victoires</p><p className="text-2xl font-bold text-green-600">{selectedUser.encheresGagnees}</p></div>
              <div className="bg-orange-50 p-4 rounded-lg text-center col-span-2"><p className="text-xs uppercase text-gray-500 font-bold">Gains Totaux Estimés</p><p className="text-3xl font-bold text-orange-600">{selectedUser.totalGains} DT</p></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ENCHERE DETAILS (NEW ELEGANT DESIGN) */}
      {selectedEnchere && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedEnchere(null)} className="absolute top-4 right-4 bg-white/50 hover:bg-white rounded-full p-2 z-10 transition-colors"><X className="w-5 h-5 text-gray-600" /></button>

            {/* Left: Image / Visual */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100">
              <img
                src={selectedEnchere.imageUrls && selectedEnchere.imageUrls.length > 0 ? selectedEnchere.imageUrls[0] : "https://via.placeholder.com/400x600?text=Produit"}
                alt={selectedEnchere.nomProduit}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${selectedEnchere.statut === 'EN_COURS' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {selectedEnchere.statut === 'EN_COURS' ? 'Active' : 'Terminée'}
                  </span>
                  <h3 className="text-white text-2xl font-bold leading-tight">{selectedEnchere.nomProduit}</h3>
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Détails de l'enchère</h4>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-orange-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Prix Actuel</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedEnchere.montantActuel} DT</p>
                      <p className="text-xs text-gray-400">Prix départ: {selectedEnchere.prixDepart} DT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="text-xl font-bold text-gray-900">{selectedEnchere.nombreParticipants}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                      {selectedEnchere.description || "Aucune description fournie pour ce produit."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-400">
                <span>Fin le: {parseDate(selectedEnchere.dateFin)?.toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {parseDate(selectedEnchere.dateFin)?.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MESSAGE VIEW */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {selectedMessage.name ? selectedMessage.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-500">De : {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                </div>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8">
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Reçu le {new Date(selectedMessage.dateEnvoi).toLocaleDateString()} à {new Date(selectedMessage.dateEnvoi).toLocaleTimeString()}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium">Fermer</button>
                <a href={`mailto:${selectedMessage.email}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Répondre
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Award className="w-6 h-6" /> Ajouter un Administrateur</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newAdmin.nom}
                  onChange={e => setNewAdmin({ ...newAdmin, nom: e.target.value })}
                  placeholder="Ex: Admin Principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@auction.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowAdminModal(false)} className="px-4 py-2 text-gray-600 hover:bg-white border border-gray-200 rounded-lg transition-colors">Annuler</button>
              <button onClick={handleCreateAdmin} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition-colors font-medium">Créer Admin</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, ShoppingCart, Eye } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Charger depuis localStorage
    const wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
    setItems(wishlistData);
  }, []);

  const removeFromWishlist = (id) => {
    const newWishlist = items.filter(item => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setItems(newWishlist);
  };

  const total = items.reduce((sum, item) => sum + (item.montantActuel || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
          <span className="text-orange-500">❤️</span> Ma Liste de Souhaits ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-4">Votre wishlist est vide pour le moment.</p>
            <button 
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition"
            >
                Explorer les enchères
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Produit</th>
                    <th className="py-4 px-6 text-center">Prix Actuel</th>
                    <th className="py-4 px-6 text-center">Statut</th>
                    <th className="py-4 px-6 text-center">Fin</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      
                      {/* Image & Nom */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            <img 
                                src={item.image || "https://via.placeholder.com/150?text=No+Image"} 
                                alt={item.nomProduit} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{item.nomProduit}</p>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                {item.categorie || "Divers"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Prix */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-gray-900">{item.montantActuel} DT</span>
                        {item.prixDepart && <p className="text-xs text-gray-400 line-through">{item.prixDepart} DT</p>}
                      </td>

                      {/* Statut */}
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.statut === 'EN_COURS' ? 'bg-green-100 text-green-700' : 
                            item.statut === 'TERMINEE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.statut === 'EN_COURS' ? 'En Cours' : 'Terminée'}
                        </span>
                      </td>

                      {/* Date Fin */}
                      <td className="py-4 px-6 text-center text-sm text-gray-600">
                        {item.dateFin ? new Date(item.dateFin).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Table */}
            <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                    Total estimé des offres actuelles : <span className="font-bold text-gray-900">{total} DT</span>
                </p>
                <button 
                    onClick={() => { localStorage.removeItem("wishlist"); setItems([]); }}
                    className="text-red-600 text-sm hover:underline font-medium"
                >
                    Vider la liste
                </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
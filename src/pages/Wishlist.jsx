import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2 } from "lucide-react";

const Wishlist = () => {
  const navigate = useNavigate();

  // Charger le wishlist depuis le localStorage
  const [items, setItems] = useState([]);

  useEffect(() => {
    const wishlistData = JSON.parse(localStorage.getItem("wishlist")) || [];
    setItems(wishlistData);
  }, []);

  // Supprimer un produit du wishlist
  const removeFromWishlist = (id) => {
    const newWishlist = items.filter(item => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setItems(newWishlist);
  };

  const total = items.reduce((sum, item) => sum + item.montantActuel, 0);

  return (
    <>
      <Header />

      <div className="cart-container py-10">
        <h1 className="text-[#014152] text-center mb-10 text-2xl font-semibold">
          Your Wishlist ({items.length})
        </h1>

        {items.length === 0 ? (
          <p className="text-center text-gray-500">Votre wishlist est vide.</p>
        ) : (
          <div className="w-5/6 mx-auto bg-gray-100 p-6 rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-6 px-8 text-left font-semibold">Product</th>
                  <th className="py-3 px-4 text-left font-semibold">Category</th>
                  <th className="py-3 px-4 text-left font-semibold">Start Price</th>
                  <th className="py-3 px-4 text-left font-semibold">Current Bid</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Start Date</th>
                  <th className="py-3 px-4 text-left font-semibold">End Date</th>
                  <th className="py-3 px-4 text-left font-semibold">Winner</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-4 px-4 flex items-center gap-4 cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}>
                      <img src={item.image} alt={item.nomProduit} className="w-[70px] rounded-lg" />
                      <span className="font-medium">{item.nomProduit}</span>
                    </td>
                    <td className="py-4 px-4">{item.categorie}</td>
                    <td className="py-4 px-4">{item.prixDepart} DT</td>
                    <td className="py-4 px-4">{item.montantActuel} DT</td>
                    <td className="py-4 px-4">{item.statut}</td>
                    <td className="py-4 px-4">{new Date(item.dateDebut).toLocaleString()}</td>
                    <td className="py-4 px-4">{new Date(item.dateFin).toLocaleString()}</td>
                    <td className="py-4 px-4">{item.gagnant?.nom || "-"}</td>
                    <td className="py-4 px-4 flex gap-2">
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex items-center text-red-600 hover:text-white justify-center w-8 h-8 rounded-full bg-red-200 hover:bg-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right mt-6">
              <div className="text-lg font-semibold">
                Total Current Bids: <span className="text-[#014152]">{total} DT</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Wishlist;

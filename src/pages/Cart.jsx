import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Check, Trash2 } from "lucide-react";

const Cart = () => {
  // Example data mimicking your Encher entity
  const items = [
    {
      id: 1,
      nomProduit: "iPhone 13",
      prixDepart: 1500,
      montantActuel: 1800,
      categorie: { libelleCategorie: "Electronics" },
      dateDebut: new Date("2025-11-19T10:00"),
      dateFin: new Date("2025-11-22T10:00"),
      statut: "Pending",
      gagnant: null,
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200"
    },
    {
      id: 2,
      nomProduit: "iPhone 13",
      prixDepart: 1500,
      montantActuel: 2000,
      categorie: { libelleCategorie: "Electronics" },
      dateDebut: new Date("2025-11-19T10:00"),
      dateFin: new Date("2025-11-22T10:00"),
      statut: "Done",
      gagnant: { nom: "John Doe" },
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200"
    },
  ];

  const total = items.reduce((sum, item) => sum + item.montantActuel, 0);

  return (
    <>
      <Header />

      <div className="cart-container py-10">
        <h1 className="text-[#014152] text-center mb-10 text-2xl font-semibold">
          Your Auctions ({items.length})
        </h1>

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
                  <td className="py-4 px-4 flex items-center gap-4">
                    <img src={item.image} alt={item.nomProduit} className="w-[70px] rounded-lg" />
                    <span className="font-medium">{item.nomProduit}</span>
                  </td>
                  <td className="py-4 px-4">{item.categorie.libelleCategorie}</td>
                  <td className="py-4 px-4">{item.prixDepart} DT</td>
                  <td className="py-4 px-4">{item.montantActuel} DT</td>
                  <td className="py-4 px-4">{item.statut}</td>
                  <td className="py-4 px-4">{item.dateDebut.toLocaleString()}</td>
                  <td className="py-4 px-4">{item.dateFin.toLocaleString()}</td>
                  <td className="py-4 px-4">{item.gagnant ? item.gagnant.nom : "-"}</td>
                  <td className="py-4 px-4 flex gap-2">
                    <button className="flex items-center  text-red-600 hover:text-white justify-center w-8 h-8 rounded-full bg-red-200 hover:bg-red-500 transition">
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
            <button className="mt-4 bg-[#014152] text-white px-6 py-2 rounded-lg hover:bg-[#01607a] transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Cart;

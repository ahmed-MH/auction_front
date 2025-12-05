import React from "react";
import { useNavigate } from "react-router-dom";

export const AuctionCard = ({ id, name, oldPrice, countdown, image, status }) => {
  const navigate = useNavigate();

  const statusStyle =
    status === "TERMINEE"
      ? "bg-red-100 text-red-700 border border-red-300"
      : status === "EN_COURS"
      ? "bg-green-100 text-green-700 border border-green-300"
      : "bg-gray-100 text-gray-700 border border-gray-300";

  const goToDetails = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition">
      <img src={image} alt={name} className="w-full h-48 object-cover" />

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{name}</h3>

        <p className="text-orange-600 font-bold text-xl mb-2">{oldPrice}</p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-red-500 font-mono font-bold">{countdown}</span>

          {/* ⭐ Badge statut couleur */}
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold ${statusStyle}`}
          >
            {status}
          </span>
        </div>

        <button
          onClick={goToDetails}
          className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Place Bid
        </button>
      </div>
    </div>
  );
};

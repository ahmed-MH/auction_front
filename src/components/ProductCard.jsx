import React from "react";
import { useNavigate } from "react-router-dom";

export const AuctionCard = ({ id, name, oldPrice, countdown, image, status }) => {
  const navigate = useNavigate();
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
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {status}
          </span>
        </div>

        {/* ✅ Protected Place Bid */}
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

import React from "react";
import { useNavigate } from "react-router-dom";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export const AuctionCard = ({ id, name, oldPrice, countdown, image, status }) => {
  const [isLiked, setIsLiked] = useState(false);
  const isLoggedIn = !!localStorage.getItem("user");

  useEffect(() => {
    if (isLoggedIn) {
      checkWishlistStatus();
    }
  }, [id, isLoggedIn]);

  const checkWishlistStatus = async () => {
    try {
      const res = await api.get("/wishlist");
      if (Array.isArray(res.data)) {
        const found = res.data.some(item => item.id === parseInt(id));
        setIsLiked(found);
      }
    } catch (err) {
      // Silent fail for UI polish
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation(); // Prevent navigating to details
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      if (isLiked) {
        await api.delete(`/wishlist/${id}`);
        toast.success("Removed from wishlist");
        setIsLiked(false);
      } else {
        await api.post(`/wishlist/add/${id}`);
        toast.success("Added to wishlist");
        setIsLiked(true);
      }
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };
  const navigate = useNavigate();
  const goToDetails = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition relative">
      <button
        onClick={toggleWishlist}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition ${isLiked ? "bg-red-100 text-red-500" : "bg-white/80 text-gray-400 hover:text-red-500"}`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      </button>
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

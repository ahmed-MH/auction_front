import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await api.get("/wishlist");
            setWishlist(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            // Don't show error toast on 404 (empty wishlist) if backend returns 404 for empty
            if (err.response && err.response.status !== 404) {
                toast.error("Could not load wishlist");
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (enchereId) => {
        try {
            await api.delete(`/wishlist/${enchereId}`);
            toast.success("Removed from wishlist");
            // Optimistic update
            setWishlist(prev => prev.filter(item => item.id !== enchereId));
        } catch (err) {
            console.error("Error removing from wishlist:", err);
            toast.error("Failed to remove item");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-6">Your wishlist is empty.</p>
                        <Link to="/products">
                            <button className="bg-[#003847] text-white px-8 py-3 rounded-lg hover:bg-[#014152] transition">
                                Browse Auctions
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white border rounded-xl shadow hover:shadow-lg transition p-3 relative"
                            >
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="absolute top-2 right-2 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-200 transition z-10"
                                    title="Remove from wishlist"
                                >
                                    ✕
                                </button>

                                <img
                                    src={product.images && product.images.length > 0 ? product.images[0].url : "https://via.placeholder.com/400x300?text=No+Image"}
                                    alt={product.nomProduit}
                                    className="h-48 w-full object-cover rounded-lg"
                                />

                                <h2 className="mt-3 text-lg font-semibold text-gray-800 truncate">
                                    {product.nomProduit}
                                </h2>
                                <p className="text-orange-600 font-bold">{product.montantActuel || product.prixDepart} DT</p>

                                <Link to={`/product/${product.id}`}>
                                    <button className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                                        View Product
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;

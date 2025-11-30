import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Flame, Clock, ArrowRight } from "lucide-react";

const HotDeals = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/enchers");
                // Filter/Sort logic for "Hot Deals"
                // For now, let's assume "Hot" means ending soon or randomly selected for demo
                // We'll sort by dateFin if available, otherwise just take the first few
                let sortedProducts = res.data;

                if (sortedProducts.length > 0 && sortedProducts[0].dateFin) {
                    sortedProducts = sortedProducts.sort((a, b) => new Date(a.dateFin) - new Date(b.dateFin));
                }

                setProducts(sortedProducts);
            } catch (err) {
                console.error("Error fetching hot deals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Helper to calculate time left
    const calculateTimeLeft = (dateFin) => {
        if (!dateFin) return "N/A";
        const difference = +new Date(dateFin) - +new Date();
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            return `${days}d ${hours}h left`;
        }
        return "Ended";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <Flame className="w-8 h-8 text-yellow-300 animate-pulse" />
                        </div>
                        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Hot Deals & Live Auctions</h1>
                        <p className="text-xl text-orange-100 max-w-2xl mx-auto font-medium">
                            Don't miss out on these exclusive items ending soon! Bid now before it's too late.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-12">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-gray-700">No hot deals available right now.</h3>
                            <p className="text-gray-500 mt-2">Check back later for more auctions!</p>
                            <Link to="/products" className="inline-block mt-6 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                                Browse All Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                    {/* Image Container */}
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <img
                                            src={product.images && product.images.length > 0 ? product.images[0].url : "https://via.placeholder.com/400x300?text=No+Image"}
                                            alt={product.nomProduit}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                                                <Flame className="w-3 h-3 mr-1" /> HOT
                                            </span>
                                        </div>

                                        {/* Timer Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                            <div className="flex items-center text-white font-medium text-sm">
                                                <Clock className="w-4 h-4 mr-2 text-orange-400" />
                                                {calculateTimeLeft(product.dateFin)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-orange-600 transition-colors">
                                                {product.nomProduit}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 h-10">
                                                {product.description}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Bid</p>
                                                <p className="text-2xl font-extrabold text-orange-600">
                                                    {product.montantActuel || product.prixDepart} <span className="text-sm font-normal text-gray-500">DT</span>
                                                </p>
                                            </div>
                                        </div>

                                        <Link to={`/product/${product.id}`}>
                                            <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/30">
                                                Bid Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HotDeals;

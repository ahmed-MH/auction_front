import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Phone, User, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";

import Header from "../components/Header";
import Footer from "../components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [userPrice, setUserPrice] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem("user");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:8080/api/encheres/${id}`, { headers });
        setProduct(res.data);

        // Si ton backend fournit une liste de participants avec montant, tu peux l'utiliser
        if (res.data.participants) {
          setBidders(
            res.data.participants.map((p) => ({
              id: p.id,
              name: p.nom, // ou p.nom + " " + p.prenom selon ton utilisateur
              amount: p.montantActuel, // exemple
              time: "-", // à adapter si tu as l'heure des mises
            }))
          );
        }

      } catch (err) {
        console.error("Erreur récupération du produit :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBid = async () => {
    if (!userPrice) {
      alert("⚠️ Please enter your bid amount!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Ici tu peux appeler ton endpoint pour placer l'enchère
      // Exemple : POST /api/encheres/{id}/bid
      await axios.post(`http://localhost:8080/api/encheres/${id}/bid`, { montant: userPrice }, { headers });
      alert(`✅ Your bid (${userPrice} DT) has been submitted!`);
      setUserPrice("");

      // Rafraîchir la liste des enchères si nécessaire
    } catch (err) {
      console.error("Erreur lors de l'enchère :", err);
      alert("⚠️ Erreur lors de la soumission de votre enchère !");
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading product...</p>;
  }

  if (!product) {
    return <p className="text-center mt-20 text-red-500">Product not found!</p>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <nav className="px-8 md:px-24 py-6 text-sm text-gray-600">
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/")}>Home</span> /{" "}
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/products")}>Products</span> /{" "}
        <span className="text-orange-600 font-medium">{product.nomProduit}</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-8 md:px-24 pb-20 space-y-12">
        {/* Product Info Section */}
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl p-6 md:p-8 shadow-md">
          <div className="flex-shrink-0 w-full md:w-[320px] h-[400px]">
            <img
              src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "https://via.placeholder.com/400x300?text=No+Image"}
              alt={product.nomProduit}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.nomProduit}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Category: <span className="text-gray-700">{product.categorie?.libelleCategorie}</span>
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Initial price: <span className="text-orange-500 font-semibold">{product.prixDepart} DT</span>
              </p>
              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 rounded-full bg-gray-200 hover:text-white text-gray-400 flex items-center justify-center hover:bg-[#FF6B39] transition">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full text-gray-400 bg-gray-200 flex items-center hover:text-white justify-center hover:bg-[#FF6B39] transition">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Actual Price:</span>
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-800">{product.montantActuel} DT</span>
              </div>

              <div className="mt-4 flex gap-2">
                {isLoggedIn ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter your bid"
                      value={userPrice}
                      onChange={(e) => setUserPrice(e.target.value)}
                      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <button
                      onClick={handleBid}
                      className="bg-orange-600 text-white px-4 rounded hover:bg-orange-700 transition"
                    >
                      Bid
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="bg-[#003847] text-white  px-10 py-2 rounded hover:bg-gray-800 transition"
                  >
                    Login to bid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2 border-b w-full">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === "description" ? "bg-orange-500 text-white" : "text-[#003847] hover:bg-gray-200"}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === "similar" ? "bg-orange-500 text-white" : "text-[#003847] hover:bg-gray-200"}`}
              >
                Similar Auctions
              </button>
            </div>
          </div>

          <div className="mt-4">
            {activeTab === "description" && (
              <div className="text-gray-700 text-sm leading-relaxed">
                <p className="font-bold text-xl text-[#003847]">{product.nomProduit}</p>
                <br />
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === "similar" && (
              <div>
                <div onClick={() => navigate("/products")} className="flex justify-end mb-4">
                  <button className="text-orange-500 text-sm font-medium hover:underline">see more</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Ici tu peux mapper les autres enchères depuis ton API */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bidders Section */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Bidders List</h2>
          </div>
          <div className="space-y-4">
            {bidders.map((bidder) => (
              <div key={bidder.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{bidder.name}</h3>
                  <p className="text-sm text-gray-600">Bid Amount: <span className="text-orange-500 font-semibold">{bidder.amount}</span></p>
                  <p className="text-xs text-gray-500">Time: {bidder.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

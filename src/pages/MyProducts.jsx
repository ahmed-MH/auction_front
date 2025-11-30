import { useLocation, Link, useNavigate } from "react-router-dom";
import { Heart, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import api from "../services/api";

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("cat");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMyProducts, setShowMyProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérification connexion utilisateur
    const user = localStorage.getItem("user");
    const userIdFromStorage = localStorage.getItem("userId");
    setIsLoggedIn(!!user);
    setUserId(userIdFromStorage ? parseInt(userIdFromStorage) : null);

    // Récupération des enchères depuis l'API
    const fetchProducts = async () => {
      try {
        const res = await api.get("/enchers");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Erreur récupération des produits :", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get("/wishlist");
        if (Array.isArray(res.data)) {
          setWishlistIds(res.data.map(item => item.id));
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [isLoggedIn]);

  const toggleWishlist = async (e, id) => {
    e.preventDefault(); // Prevent link navigation
    if (!isLoggedIn) {
      toast.error("Please login to add to wishlist");
      navigate("/auth");
      return;
    }

    const isLiked = wishlistIds.includes(id);

    try {
      if (isLiked) {
        await api.delete(`/wishlist/${id}`);
        toast.success("Removed from wishlist");
        setWishlistIds(prev => prev.filter(wid => wid !== id));
      } else {
        await api.post(`/wishlist/add/${id}`);
        toast.success("Added to wishlist");
        setWishlistIds(prev => [...prev, id]);
      }
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this auction?")) return;

    try {
      await api.delete(`/enchers/${id}`);
      toast.success("Auction deleted successfully");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error deleting auction:", err);
      toast.error("Failed to delete auction");
    }
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    navigate(`/edit-auction/${id}`);
  };

  // Filtrage par catégorie et par propriétaire
  const filteredProducts = Array.isArray(products) ? products.filter((p) => {
    const categoryMatch = !currentCategory || (p.categorie && p.categorie.libelleCategorie === currentCategory);
    const ownerMatch = !showMyProducts || (p.createur && p.createur.id === userId);
    return categoryMatch && ownerMatch;
  }) : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {currentCategory
                ? `Products in "${currentCategory}"`
                : showMyProducts ? "My Products" : "All Products"}
            </h1>
            {isLoggedIn && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowMyProducts(false)}
                  className={`px-4 py-2 rounded-lg transition ${!showMyProducts ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setShowMyProducts(true)}
                  className={`px-4 py-2 rounded-lg transition ${showMyProducts ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  My Products
                </button>
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <Link to={`/add-bid`}>
              <button className="px-4 py-3 text-white rounded-lg bg-orange-500 hover:bg-[#003847] transition">
                Create an auction
              </button>
            </Link>
          ) : (
            <Link to={`/auth`}>
              <button
                className="px-4 py-3 text-white rounded-lg bg-[#003847]"
                title="You must be logged in"
              >
                Login to Create an auction
              </button>
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border rounded-xl shadow hover:shadow-lg transition p-3"
              >
                <div className="relative">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0].url : "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={product.nomProduit}
                    className="h-48 w-full object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition ${wishlistIds.includes(product.id) ? "bg-red-100 text-red-500" : "bg-white/80 text-gray-400 hover:text-red-500"}`}
                  >
                    <Heart className={`w-4 h-4 ${wishlistIds.includes(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                <h2 className="mt-3 text-lg font-semibold text-gray-800">
                  {product.nomProduit}
                </h2>
                <p className="text-orange-600 font-bold">{product.prixDepart} DT</p>

                {showMyProducts && product.createur && product.createur.id === userId ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => handleEdit(e, product.id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, product.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                ) : (
                  <Link to={`/product/${product.id}`}>
                    <button className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                      View Product
                    </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;

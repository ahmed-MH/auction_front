import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("cat");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérification connexion utilisateur
    const user = localStorage.getItem("user"); // ou le token selon ton app
    setIsLoggedIn(!!user);

    // Récupération des enchères depuis l'API
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get("http://localhost:8080/api/enchers", { headers });
        setProducts(res.data);
      } catch (err) {
        console.error("Erreur récupération des produits :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrage par catégorie si spécifiée
  const filteredProducts = products.filter(
    (p) => !currentCategory || (p.categorie && p.categorie.libelleCategorie === currentCategory)
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {currentCategory
              ? `Products in "${currentCategory}"`
              : "All Products"}
          </h1>

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
                <img
                  src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={product.nomProduit}
                  className="h-48 w-full object-cover rounded-lg"
                />

                <h2 className="mt-3 text-lg font-semibold text-gray-800">
                  {product.nomProduit}
                </h2>
                <p className="text-orange-600 font-bold">{product.prixDepart} DT</p>

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

export default Products;

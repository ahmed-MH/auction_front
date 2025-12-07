import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import api from "../api/axios"; // Import de votre configuration Axios

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour donner une icône selon le nom (car la DB ne stocke souvent que le nom)
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return "📦";
    const name = categoryName.toLowerCase();
    
    if (name.includes("electro") || name.includes("ordi") || name.includes("téléphone")) return "💻";
    if (name.includes("mode") || name.includes("vêtement") || name.includes("fashion")) return "👗";
    if (name.includes("maison") || name.includes("meuble") || name.includes("déco")) return "🏠";
    if (name.includes("art") || name.includes("peinture")) return "🎨";
    if (name.includes("sport") || name.includes("loisir")) return "⚽";
    if (name.includes("voiture") || name.includes("véhicule") || name.includes("auto")) return "🚗";
    if (name.includes("bijou") || name.includes("montre")) return "💎";
    if (name.includes("livre")) return "📚";
    
    return "📦"; // Icône par défaut
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Appel à votre API Spring Boot
        const res = await api.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Toutes les Catégories
        </h1>
        <p className="text-gray-500 text-center mb-12">
          Explorez nos différentes catégories pour trouver l'objet rare.
        </p>

        {loading ? (
          // SKELETON LOADING (Chargement)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500">Aucune catégorie disponible.</p>
        ) : (
          // LISTE DYNAMIQUE
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?cat=${cat.libelleCategorie}`} // Lien dynamique vers la page produits avec filtre
                className="flex flex-col items-center justify-center bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(cat.libelleCategorie)}
                </span>
                <span className="font-semibold text-gray-700 group-hover:text-orange-600 text-center">
                  {cat.libelleCategorie}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
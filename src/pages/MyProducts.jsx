import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { AuctionCard } from "../components/ProductCard";

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("cat");
  const searchParam = searchParams.get("search");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [category, setCategory] = useState(categoryParam || "");
  const [search, setSearch] = useState(searchParam || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("all"); // all, EN_COURS, TERMINEE
  const [sortBy, setSortBy] = useState("newest"); // newest, price_asc, price_desc

  useEffect(() => {
    setCategory(categoryParam || "");
    setSearch(searchParam || "");
  }, [categoryParam, searchParam]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/encheres");
        setProducts(res.data);
      } catch (err) {
        console.error("Erreur récupération des produits :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔹 Logic de Filtrage
  const filteredProducts = products
    .filter((p) => {
      // 1. Categorie
      if (category && p.categorie?.libelleCategorie !== category) return false;
      // 2. Recherche
      if (search) {
        const term = search.toLowerCase();
        const matchesName = p.nomProduit.toLowerCase().includes(term);
        const matchesDesc = p.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }
      // 3. Prix
      if (minPrice && p.montantActuel < parseFloat(minPrice)) return false;
      if (maxPrice && p.montantActuel > parseFloat(maxPrice)) return false;
      // 4. Statut
      if (status !== "all" && p.statut !== status) return false;

      return true;
    })
    .sort((a, b) => {
      // 5. Tri
      if (sortBy === "newest") return new Date(b.dateDebut) - new Date(a.dateDebut);
      if (sortBy === "price_asc") return a.montantActuel - b.montantActuel;
      if (sortBy === "price_desc") return b.montantActuel - a.montantActuel;
      return 0;
    });

  const resetFilters = () => {
    setCategory("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setStatus("all");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {search ? `Results for "${search}"` : category ? `Category: ${category}` : "All Auctions"}
            </h1>
            <p className="text-gray-500 mt-1">{filteredProducts.length} items found</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </button>

            {isLoggedIn ? (
              <Link to={`/add-bid`}>
                <button className="px-6 py-3 text-white rounded-lg bg-orange-500 hover:bg-[#003847] transition shadow-md font-medium">
                  + Create Auction
                </button>
              </Link>
            ) : (
              <Link to={`/auth`}>
                <button className="px-6 py-3 text-white rounded-lg bg-[#003847] shadow-md font-medium">
                  Login to Sell
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* 🧊 Sidebar Filters */}
          <div className={`md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2" /> Filters</h3>
                <button onClick={resetFilters} className="text-xs text-orange-600 hover:underline">Reset</button>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="status" value="all" checked={status === "all"} onChange={() => setStatus("all")} className="text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-sm text-gray-600">All</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="status" value="EN_COURS" checked={status === "EN_COURS"} onChange={() => setStatus("EN_COURS")} className="text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-sm text-gray-600">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="status" value="TERMINEE" checked={status === "TERMINEE"} onChange={() => setStatus("TERMINEE")} className="text-orange-600 focus:ring-orange-500" />
                    <span className="ml-2 text-sm text-gray-600">Ended</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (DT)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 border-gray-300 rounded-lg text-sm px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 border-gray-300 rounded-lg text-sm px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 📦 Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No products match your filters.</p>
                <button onClick={resetFilters} className="mt-4 text-orange-600 font-medium hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <AuctionCard
                    key={product.id}
                    id={product.id}
                    name={product.nomProduit}
                    oldPrice={`${product.montantActuel} DT`}
                    image={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "https://via.placeholder.com/400x300?text=No+Image"}
                    status={product.statut}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;

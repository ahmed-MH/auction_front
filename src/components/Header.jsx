import React, { useState, useEffect } from "react";
import axios from 'axios';
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, User, LogOut, ChevronDown, ChevronUp , ShoppingCart, Heart} from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false); // pour le dropdown
  const [categories, setCategories] = useState([]); // pour les données
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user"));

  useEffect(() => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Erreur chargement catégories :", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(null);
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <header className="flex w-full flex-col border-b border-[#d9d9d9] bg-white relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-[#014152] py-2 px-6 flex justify-between items-center text-sm text-white z-50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>+216 12 345 789</span>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span>email@gmail.com</span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>1000 Sousse, Tunisia</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="flex items-center gap-2 hover:text-orange-400"
              >
                <User className="w-4 h-4 text-orange-500" />
                <span>Login / Sinup</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/account"
                  className="flex items-center gap-2 hover:text-orange-400"
                >
                  <User className="w-4 h-4 text-orange-500" />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-orange-400 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex w-full items-center p-8 pt-16 justify-center relative">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-20">
            <img
              src="/logoDetail.png"
              alt="TuniBid Logo"
              className="w-90 h-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[754px] flex items-center gap-0 relative">
            {/* Categories Dropdown */}
            <div
              className="relative flex items-center bg-[#ece6f0] rounded-l-[22px] border-r border-[#c9c9c9] h-[46px] px-4 cursor-pointer"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <span className="font-medium text-black text-xl mr-2">
                Categories
              </span>
              {categoriesOpen ? (
                <ChevronUp className="w-4 h-4 text-black" />
              ) : (
                <ChevronDown className="w-4 h-4 text-black" />
              )}

              {/* Dropdown Menu */}
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.libelleCategorie.toLowerCase().replace(/ & | /g, "-")}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {cat.libelleCategorie}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative flex items-center bg-[#ece6f0] h-[44px] px-4">
              <input
                type="text"
                placeholder="search for a product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full border-0 bg-transparent font-medium text-[#757575] text-xl placeholder:text-[#757575] focus:outline-none"
              />
            </div>

            <button
              onClick={handleSearch}
              className="bg-[#ff6b39] hover:bg-[#ff6b39]/90 rounded-r-[22px] h-[44px] px-6 font-bold text-white text-xl"
            >
              Search
            </button>
          </div>

          {/* Menu */}
          <nav className="flex items-center space-x-8 ml-20">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex flex-col items-center text-[#014152] hover:text-orange-500 transition-colors"
            >
              <Heart className="w-6 h-6" />
              <span className="text-sm mt-1">Your Wishlist</span>
              {/* Badge */}
              <div className="absolute -top-2 -right-2 bg-[#FF6B39] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                2
              </div>
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative flex flex-col items-center text-[#014152] hover:text-orange-500 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm mt-1">Your Cart</span>
              {/* Badge */}
              <div className="absolute -top-2 -right-2 bg-[#FF6B39] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                2
              </div>
            </Link>
          </nav>
        </div>
      </header>

      <Navbar />
    </>
  );
};

export default Header;

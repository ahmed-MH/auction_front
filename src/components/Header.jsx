import React, { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import api from "../api/axios";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, User, LogOut, ShoppingCart, Heart } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("user"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State pour le menu mobile

  const { confirm } = useModal();

  const handleLogout = async () => {
    if (await confirm("Êtes-vous sûr de vouloir vous déconnecter ?", { title: "Déconnexion" })) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("wishlist");
      setIsLoggedIn(null);
      window.location.href = "/";
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistCount(wishlist.length);

    // Optionnel : écouter les changements du localStorage
    const handleStorageChange = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(updatedWishlist.length);
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <header className="flex w-full flex-col border-b border-[#d9d9d9] bg-white relative">
        {/* Top Bar - Hidden on mobile */}
        <div className="hidden md:flex bg-[#014152] py-2 px-6 justify-between items-center text-sm text-white z-50">
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
                <span>Login / Signup</span>
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
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Logo & Mobile Menu Button row */}
            <div className="flex w-full md:w-auto justify-between items-center">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logoDetail.png"
                  alt="TuniBid Logo"
                  className="w-32 md:w-48 h-auto object-contain"
                />
              </Link>

              {/* Mobile Menu Toggle & Wishlist specific for mobile header if needed, 
                  but for now let's keep wishlist in main nav or create a specific mobile header area */}
              <div className="flex items-center gap-4 md:hidden">
                {/* Mobile Wishlist Icon */}
                <Link
                  to="/wishlist"
                  className="relative text-[#014152]"
                >
                  <Heart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-[#FF6B39] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {wishlistCount}
                    </div>
                  )}
                </Link>
                {/* Hamburger handled in Navbar or here? 
                    Actually, passing state to Navbar might be best, 
                    OR we just put the toggle here and pass the "isOpen" prop to Navbar. */}
              </div>
            </div>

            {/* Search Bar - Full width on mobile, auto on desktop */}
            <div className="w-full md:flex-1 md:max-w-2xl md:mx-8">
              <div className="flex w-full items-center relative">
                <div className="flex-1 relative flex items-center bg-[#ece6f0] rounded-l-full h-11 px-4">
                  <input
                    type="text"
                    placeholder="Search for a product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full border-0 bg-transparent font-medium text-gray-600 text-base placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-[#ff6b39] hover:bg-[#ff6b39]/90 rounded-r-full h-11 px-6 font-bold text-white transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Desktop Actions (Wishlist) - Hidden on mobile, shown in bottom nav or menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/wishlist"
                className="relative flex flex-col items-center text-[#014152] hover:text-orange-500 transition-colors"
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm mt-1">Wishlist</span>
                {wishlistCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-[#FF6B39] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </div>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Navbar receives mobile state if we want to toggle it, 
          but usually Navbar contains the links. 
          Let's pass a prop or handle it inside Navbar if it has its own toggle.
          For this refactor, I'll pass nothing yet and refactor Navbar next to be responsive. */}
      <Navbar />
    </>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import api from '../api/axios'; // Assurez-vous que le chemin est bon
import { ChevronDown } from 'lucide-react'; // Icône pour le menu déroulant

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Récupérer les catégories depuis la base de données
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Erreur chargement catégories navbar:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="bg-white text-black shadow-sm border-b border-gray-100 p-4 sticky top-0 z-40">
      <div className="container mx-auto">

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center">
          <span className="font-bold text-gray-800">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {/* Desktop & Mobile Menu Links */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:justify-center md:space-x-8 mt-4 md:mt-0`}>

          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {/* --- HOME --- */}
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}
            >
              Home
            </NavLink>

            {/* --- HOT DEALS --- */}
            <NavLink
              to="/hot-deals"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}
            >
              Hot Deals
            </NavLink>

            {/* --- CATEGORIES (DROPDOWN DYNAMIQUE) --- */}
            <div
              className="relative group h-full"
            >
              <button
                className={`flex items-center gap-1 hover:text-orange-600 transition cursor-pointer w-full md:w-auto text-left`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => window.innerWidth >= 768 && setIsDropdownOpen(true)}
              >
                Categories <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu Déroulant */}
              {categories.length > 0 && (
                <div
                  className={`${isDropdownOpen ? 'block' : 'hidden'} md:absolute md:top-full md:left-1/2 md:transform md:-translate-x-1/2 md:mt-2 w-full md:w-56 bg-white md:rounded-xl md:shadow-xl border-l-2 md:border border-gray-100 overflow-hidden transition-all duration-200 z-50 pl-4 md:pl-0`}
                  onMouseLeave={() => window.innerWidth >= 768 && setIsDropdownOpen(false)}
                >
                  <div className="py-2 flex flex-col">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?cat=${cat.libelleCategorie}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {cat.libelleCategorie}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-xs font-bold text-center text-orange-600 hover:bg-gray-50"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Voir toutes les catégories
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* --- PRODUCTS --- */}
            <NavLink
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}
            >
              Products
            </NavLink>

            {/* --- CONTACT --- */}
            <NavLink
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}
            >
              Contact
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
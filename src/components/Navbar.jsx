import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import api from '../api/axios'; // Assurez-vous que le chemin est bon
import { ChevronDown } from 'lucide-react'; // Icône pour le menu déroulant

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <nav className="bg-white text-black shadow-sm border-b border-gray-100 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-center items-center">
        <div className="flex space-x-8 items-center">
          
          {/* --- HOME --- */}
          <NavLink to="/" className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}>
            Home
          </NavLink>

          {/* --- HOT DEALS --- */}
          <NavLink to="/hot-deals" className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}>
            Hot Deals
          </NavLink>

          {/* --- CATEGORIES (DROPDOWN DYNAMIQUE) --- */}
          <div 
            className="relative group h-full flex items-center"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <Link 
              to="/categories" 
              className={`flex items-center gap-1 hover:text-orange-600 transition cursor-pointer ${isDropdownOpen ? 'text-orange-600' : ''}`}
            >
              Categories <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </Link>

            {/* Menu Déroulant */}
            {categories.length > 0 && (
              <div 
                className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
              >
                <div className="py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?cat=${cat.libelleCategorie}`} // Redirige vers la page produits filtrée
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)} // Ferme le menu au clic
                    >
                      {cat.libelleCategorie}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link 
                    to="/categories" 
                    className="block px-4 py-2 text-xs font-bold text-center text-orange-600 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Voir toutes les catégories
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* --- PRODUCTS --- */}
          <NavLink to="/products" className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}>
            Products
          </NavLink>

          {/* --- CONTACT --- */}
          <NavLink to="/contact" className={({ isActive }) => `hover:text-orange-600 transition ${isActive ? 'font-bold text-orange-600' : ''}`}>
            Contact
          </NavLink>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
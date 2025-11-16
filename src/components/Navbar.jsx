import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Erreur chargement catégories :", err));
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Hot Deals', path: '/hot-deals' },
    { name: 'Categories', path: '/categories', dropdown: categories},
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white text-black shadow-md p-4 relative">
      <div className="container mx-auto flex justify-center">
        <div className="flex space-x-8">
          {links.map((link) => {
            if (link.dropdown) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className="flex items-center cursor-pointer text-black hover:text-orange-500 font-medium transition-colors px-2 py-1">
                    <span>{link.name}</span>
                    {openDropdown === link.name ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                  </div>

                  {openDropdown === link.name && (
                    <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md z-50 w-40">
                      {link.dropdown.map((cat) => (
                        <NavLink
                          key={cat.id}
                          to={`/categories/${cat.libelleCategorie.toLowerCase().replace(/ |&/g, "-")}`}
                          className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        >
                          {cat.libelleCategorie}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `relative px-2 py-1 text-black hover:text-orange-500 transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>
                    {isActive && (
                      <span
                        className="absolute left-0 bottom-0 w-full h-1"
                        style={{ backgroundColor: '#FF6B39' }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

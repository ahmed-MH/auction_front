import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Hot Deals', path: '/hot-deals' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white text-black shadow-md p-4 relative">
      <div className="container mx-auto flex justify-center">
        <div className="flex space-x-8">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `relative px-2 py-1 text-black hover:text-orange-500 transition-colors ${isActive ? 'font-semibold' : ''
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
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

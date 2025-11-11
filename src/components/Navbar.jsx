import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ isLoggedIn, isAdmin }) => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <NavLink to="/" className="hover:text-gray-200">AuctionApp</NavLink>
        </div>
        <div className="flex space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-gray-200 ${isActive ? 'underline' : ''}`
            }
          >
            Home
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink
                to="/add-product"
                className={({ isActive }) =>
                  `hover:text-gray-200 ${isActive ? 'underline' : ''}`
                }
              >
                Add Product
              </NavLink>
              <NavLink
                to="/my-products"
                className={({ isActive }) =>
                  `hover:text-gray-200 ${isActive ? 'underline' : ''}`
                }
              >
                My Products
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hover:text-gray-200 ${isActive ? 'underline' : ''}`
                }
              >
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin-dashboard"
                  className={({ isActive }) =>
                    `hover:text-gray-200 ${isActive ? 'underline' : ''}`
                  }
                >
                  Admin Dashboard
                </NavLink>
              )}
              <button className="hover:text-gray-200">Logout</button>
            </>
          )}
          {!isLoggedIn && (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `hover:text-gray-200 ${isActive ? 'underline' : ''}`
              }
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
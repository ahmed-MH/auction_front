import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import { AuthSection as Footer } from "../components/Footer";
import {  Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Laptop Lenovo",
    price: "710.000 DT",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
  },
  {
    id: 2,
    name: "iPhone 15",
    price: "2.500.000 DT",
    category: "phones",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
  },
  {
    id: 3,
    name: "Casque JBL",
    price: "500.000 DT",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
  },
  {
    id: 4,
    name: "Camera Canon",
    price: "980.000 DT",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400",
  },
];

const Products = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("cat");

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrage par catégorie + recherche
  const filteredProducts = products
    .filter((p) => !currentCategory || p.category === currentCategory)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {currentCategory
            ? `Products in "${currentCategory}"`
            : "All Products"}
        </h1>

        {/* Search bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition p-3"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-48 w-full object-cover rounded-lg"
              />

              <h2 className="mt-3 text-lg font-semibold text-gray-800">
                {product.name}
              </h2>
              <p className="text-orange-600 font-bold">{product.price}</p>

              <Link to={`/product/${product.id}`}>
                <button className="mt-3 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                  View Product
                </button>
              </Link>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No products found</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;

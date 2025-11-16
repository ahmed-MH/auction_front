import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const categories = [
  { name: "Electronics", icon: "💻", route: "/products?cat=electronics" },
  { name: "Phones", icon: "📱", route: "/products?cat=phones" },
  { name: "Fashion", icon: "👗", route: "/products?cat=fashion" },
  { name: "Home & Kitchen", icon: "🏠", route: "/products?cat=home" },
  { name: "Sports", icon: "⚽", route: "/products?cat=sports" },
  { name: "Cars & Bikes", icon: "🚗", route: "/products?cat=cars" },
];

const Categories = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Browse Categories
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.route}
              className="flex flex-col items-center justify-center bg-white shadow-md rounded-xl p-6 border hover:shadow-lg hover:border-orange-500 transition cursor-pointer"
            >
              <span className="text-4xl mb-3">{cat.icon}</span>
              <span className="font-semibold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;

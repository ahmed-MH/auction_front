import React, { useState } from "react"; 
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import { MainContentSection } from "../components/MainContent"; 
import Navbar from "../components/Navbar";

// ✅ Fake Data Product List (to replace with API later)
const products = [
  {
    id: "1",
    name: "PC Portable Lenovo ThinkPad E14",
    price: "799.000 DT",
    description: "Un PC puissant pour les professionnels.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "iPhone 15",
    price: "1,200.000 DT",
    description: "Il vient avec un écran de 6,1 pouces. Il est équipé de la puce A16 Bionic, qui offre des performances rapides et efficaces. L'appareil photo principal de 48 mégapixels permet de capturer des photos détaillées, et le téléphone prend en charge la recharge sans fil et la connectivité 5G. Il est disponible en plusieurs couleurs, notamment le noir, le blanc, le bleu, le rose et le jaune.",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Casque JBL",
    price: "180.000 DT",
    description: "Casque audio JBL avec un son immersif.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Caméra Digital Ordro HDV-D395",
    price: "350.000 DT",
    description: "Caméra HD avec zoom optique et haute performance.",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
  },
];

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);

  const [userPrice, setUserPrice] = useState("");

  if (!product) {
    return (
      <div className="text-center mt-20 text-red-500 text-2xl">
        ❌ Produit introuvable
      </div>
    );
  }

  const handleBid = () => {
    alert(`✅ Your bid (${userPrice} DT) has been submitted!`);
  };

  return (
    <div className="bg-white w-full min-w-[1440px] relative">
      <MainContentSection />
      <Header />
     

      <nav className="px-[91px] pt-[278px] pb-6">
        <div className="font-body-base">
          <span className="text-black">Home / Products / </span>
          <span className="text-[#ff6b39]">{product.name}</span>
        </div>
      </nav>

      <main className="px-[91px] pb-20">
        <div className="bg-[#f5f5f5] rounded-lg p-8 mb-8">
          <h1 className="text-center font-semibold text-[32px] mb-8">
            {product.name}
          </h1>

          <div className="flex gap-8 bg-white rounded-lg p-8">
            {/* ✅ Product Image */}
            <div className="w-[280px] h-[280px] flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* ✅ Product Info */}
            <div className="flex-1">
              <h2 className="font-semibold text-2xl mb-2">{product.name}</h2>

              {/* ✅ Initial Price */}
              <p className="text-lg font-bold text-gray-800 mb-2">
                Initial Price: <span className="text-orange-600">{product.price}</span>
              </p>

              <p className="leading-relaxed text-gray-700 mb-6">
                {product.description}
              </p>

              {/* ✅ Bid Section */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <label className="font-semibold text-gray-700 block mb-2">
                  💰 Give your price:
                </label>
                <input
                  type="number"
                  placeholder="0000.000 DT"
                  className="w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring focus:ring-orange-300"
                  value={userPrice}
                  onChange={(e) => setUserPrice(e.target.value)}
                />

                <button
                  onClick={handleBid}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md w-full font-semibold"
                >
                  Submit Bid
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;

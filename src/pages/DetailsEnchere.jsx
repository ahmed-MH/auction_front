import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Phone , User, ArrowLeft, ArrowRight } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

// ✅ Fake Data Product List
const products = [
  {
    id: "1",
    name: "iPhone 15",
    price: "1,200.000",
    category: "Electronics",
    description:
      "A high-tech device, it is important to use the Canon camera as is. This tool is not made up of features or components that will go too far. It is important to use the camera that was necessary from the comfort and not only in a technical device, and the equipment has a very important meaning, that is why it is special.",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
  },
];
// ✅ Fake bidders list
const bidders = [
  { id: 1, name: "John Doe", amount: "1,100.000 DT", time: "10:15 AM" },
  { id: 2, name: "Jane Smith", amount: "1,150.000 DT", time: "10:20 AM" },
  { id: 3, name: "Alice Johnson", amount: "1,180.000 DT", time: "10:30 AM" },
];

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((item) => item.id === id) || products[0];
  const [userPrice, setUserPrice] = useState("");
  const [activeTab, setActiveTab] = useState("description","name"); 
  const navigate = useNavigate();

  const handleBid = () => {
    if (!userPrice) {
      alert("⚠️ Please enter your bid amount!");
      return;
    }
    alert(`✅ Your bid (${userPrice} DT) has been submitted!`);
    setUserPrice("");
  };
  const isLoggedIn = localStorage.getItem("user");
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <nav className="px-8 md:px-24 py-6 text-sm text-gray-600">
        <span className="hover:text-orange-600 cursor-pointer">Home</span> /{" "}
        <span className="hover:text-orange-600 cursor-pointer">Products</span> /{" "}
        <span className="text-orange-600 font-medium">{product.name}</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-8 md:px-24 pb-20 space-y-12">
        {/* Product Info Section */}
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl p-6 md:p-8 shadow-md">
          <div className="flex-shrink-0 w-full md:w-[320px] h-[400px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">
              Category: <span className="text-gray-700">{product.category}</span>
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Initial price: <span className="text-orange-500 font-semibold">{product.price}</span>
              </p>
              <div className="flex items-center space-x-2">
                <button className="w-8 h-8 rounded-full bg-gray-200 hover:text-white text-gray-400 flex items-center justify-center hover:bg-[#FF6B39] transition">
                  <Heart className="w-4 h-4"/>
                </button>
                <button className="w-8 h-8 rounded-full text-gray-400 bg-gray-200 flex items-center hover:text-white justify-center hover:bg-[#FF6B39] transition">
                  <Phone className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Actual Price:</span>
              </p>
              <div className="flex items-end space-x-2">
                <span className="text-4xl font-bold text-gray-800">{product.price}</span>
                <span className="text-2xl text-gray-600 mb-1">DT</span>
              </div>

              <div className="mt-4 flex gap-2">
                {/* 🟠 Si user est connecté → afficher input + bouton Bid */}
                {isLoggedIn ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter your bid"
                      value={userPrice}
                      onChange={(e) => setUserPrice(e.target.value)}
                      className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />

                    <button
                      onClick={handleBid}
                      className="bg-orange-600 text-white px-4 rounded hover:bg-orange-700 transition"
                    >
                      Bid
                    </button>
                  </>
                ) : (
                  /* 🔴 User non connecté → bouton Login to Bid */
                  <button
                    onClick={() => navigate("/auth")}
                    className="bg-[#003847] text-white  px-10 py-2 rounded hover:bg-gray-800 transition"
                  >
                    Login to bid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Auctions Section */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-8 mb-8">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2 border-b w-full">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition ${
                  activeTab === "description"
                    ? "bg-orange-500 text-white"
                    : "text-[#003847] hover:bg-gray-200"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`px-6 py-3 rounded-t-lg font-semibold transition ${
                  activeTab === "similar"
                    ? "bg-orange-500 text-white"
                    : "text-[#003847] hover:bg-gray-200"
                }`}
              >
                Similar Auctions
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4">
            {activeTab === "description" && (
              <div className="text-gray-700 text-sm leading-relaxed">
                <p className="font-bold text-xl text-[#003847]">{product.name}</p><br /><p>{product.description}</p>
              </div>
            )}
            {activeTab === "similar" && (
              <div>
                <div onClick={() => navigate("/products")} className="flex justify-end mb-4">
                  <button className="text-orange-500 text-sm font-medium hover:underline">
                    see more
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.concat(products).map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{item.price}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-800">12:30:45</span>
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                            Bid
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Bidders List Section */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Bidders List</h2>
            <div className="flex items-center space-x-2">
              <button className="w-8 h-8 bg-gray-300 text-white rounded flex items-center justify-center hover:bg-[#FF6B39]">
                <ArrowLeft className="w-3 h-3"/>
              </button>
              <button className="w-8 h-8 bg-[#FF6B39] text-white rounded flex items-center justify-center text-sm hover:bg-[#FF6B39]">
                1
              </button>
              <button className="w-8 h-8 bg-[#003847] text-white rounded flex items-center justify-center text-sm hover:bg-[#FF6B39]">
                2
              </button>
              <button className="w-8 h-8 bg-[#003847] text-white rounded flex items-center justify-center text-sm hover:bg-[#FF6B39]">
                3
              </button>
              <button className="w-8 h-8 bg-[#003847] text-white rounded flex items-center justify-center hover:bg-[#FF6B39]">
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {bidders.map((bidder) => (
              <div
                key={bidder.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{bidder.name}</h3>
                  <p className="text-sm text-gray-600">
                    Bid Amount: <span className="text-orange-500 font-semibold">{bidder.amount}</span>
                  </p>
                  <p className="text-xs text-gray-500">Time: {bidder.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

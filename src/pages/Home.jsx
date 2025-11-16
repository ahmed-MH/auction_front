// pages/Home.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MainContentSection } from '../components/MainContent';
import { AuctionCard } from '../components/ProductCard'; 
import { Link } from "react-router-dom";
const Home = () => {
  const currentAuctions = [
    { 
      id: 1,
      name: "PC Portable Lenovo", 
      price: "710.000 DT", 
      time: "12:30:45",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    },
    { 
      id: 2,
      name: "iPhone 15", 
      price: "2.500.000 DT", 
      time: "12:30:45",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    { 
      id: 3,
      name: "Casque JBL", 
      price: "500.000 DT", 
      time: "12:30:45",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop"
    },
    { 
      id: 4,
      name: "Camera Digital", 
      price: "268.000 DT", 
      time: "12:30:45",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    }
  ];
  

  const endedAuctions = [
    { 
      name: "PC Portable Lenovo", 
      price: "710.000 DT", 
      status: "Sold last night",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
    },
    { 
      name: "iPhone 15", 
      price: "2.500.000 DT", 
      status: "Sold last night",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    { 
      name: "Casque JBL", 
      price: "500.000 DT", 
      status: "Sold last night",
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop"
    },
    { 
      name: "Camera Digital", 
      price: "268.000 DT", 
      status: "Sold last night",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    }
  ];

  return (
  
    <div className="min-h-screen bg-white">
       
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="relative rounded-2xl text-white text-left py-16 px-10 mb-12 bg-cover bg-center flex flex-col justify-center" style={{ backgroundImage: "url('/banner1.png')" }}>
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your bids, your winnings!
            </h1>
            <p className="text-l mb-8 opacity-90">
              Participate in real-time auctions and win your favorite products            </p><br />
            <Link
              to="/products"
              className="bg-[#003847] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#014152] transition-colors text-lg inline-block"
            >
              View all auctions
            </Link>
          </div>
        </section>

        {/* Current Auctions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Current auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentAuctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              id={auction.id}
              name={auction.name}
              oldPrice={auction.price}
              countdown={auction.time}
              image={auction.image}
              status="Live"
            />
          ))}
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* 🟧 Banner 1 - Orange gradient */}
          <div
            className="border-2 rounded-xl p-8 text-center relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/banner2.png')" }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B39]/80 to-[#FF6B39]/40"></div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-4">
                The only case you need.
              </h3>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Bid Now
              </button>
            </div>
          </div>

          {/* 🟦 Banner 2 - Blue gradient */}
          <div
            className="border-2 rounded-xl p-8 text-center relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/banner3.png')" }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003847]/80 to-[#003847]/40"></div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Save up to 30%
              </h3>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Bid Now
              </button>
            </div>
          </div>
        </section>


        {/* Ended Auctions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Auctions ended recently</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {endedAuctions.map((auction, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Product Image */}
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  <img 
                    src={auction.image} 
                    alt={auction.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Ended
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">{auction.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">Final Price: <span className="text-green-600 font-bold">{auction.price}</span></p>
                  <p className="text-gray-500 text-xs mb-4">{auction.status}</p>
                  <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Trust and Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">✓</span>
              </div>
              <h4 className="font-semibold text-gray-800 text-lg mb-2">Secure payment</h4>
              <p className="text-gray-600">Your transactions are protected</p>
            </div>
            <div className="p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">✓</span>
              </div>
              <h4 className="font-semibold text-gray-800 text-lg mb-2">Seller Verification</h4>
              <p className="text-gray-600">All sellers are verified</p>
            </div>
            <div className="p-6">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold">✓</span>
              </div>
              <h4 className="font-semibold text-gray-800 text-lg mb-2">24/7 Support</h4>
              <p className="text-gray-600">We're here to help anytime</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import api from "../api/axios";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuctionCard } from '../components/ProductCard';
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Headphones, ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';

const Home = () => {
  const [currentAuctions, setCurrentAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Catégories rapides (Mock ou à récupérer via API)
  const categories = [
    { name: "Electronics", icon: "💻" },
    { name: "Fashion", icon: "👗" },
    { name: "Home", icon: "🏠" },
    { name: "Art", icon: "🎨" },
    { name: "Sports", icon: "⚽" },
  ];

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get("/api/encheres");
        const allAuctions = res.data;

        // Filtrer les enchères
        const current = allAuctions.filter(a =>
          a.statut === "EN_COURS" ||
          (new Date(a.dateFin) > new Date() && a.statut !== "TERMINEE")
        );

        const ended = allAuctions.filter(a =>
          a.statut === "TERMINEE" ||
          new Date(a.dateFin) <= new Date()
        );

        const mapAuction = (a) => ({
          id: a.id,
          name: a.nomProduit,
          price: (a.montantActuel || a.prixDepart),
          currency: "DT",
          time: calculateTimeLeft(a.dateFin),
          image: a.imageUrls && a.imageUrls.length > 0 ? a.imageUrls[0] : "https://via.placeholder.com/400x300?text=No+Image",
          dateFin: a.dateFin,
          status: a.statut,
          isHot: new Date(a.dateFin) - new Date() < 86400000 // Moins de 24h
        });

        setCurrentAuctions(current.map(mapAuction));
        setEndedAuctions(ended.slice(0, 4).map(mapAuction)); 
      } catch (err) {
        console.error("Error fetching auctions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const calculateTimeLeft = (dateFin) => {
    if (!dateFin) return null;
    const diff = new Date(dateFin) - new Date();
    if (diff <= 0) return "Terminé";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}j ${hours}h restants`;
    return `${hours}h restants`;
  };

  // Composant Skeleton pour le chargement
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-16">
        
        {/* --- 1. HERO SECTION --- */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl text-white h-[500px] flex items-center">
          {/* Background Image avec Overlay */}
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" 
               style={{ backgroundImage: "url('/banner1.png')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>

          <div className="relative z-10 px-10 md:px-16 max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-500 text-orange-400 text-sm font-semibold mb-6 backdrop-blur-sm">
              🚀 Enchères en direct
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Vos enchères, <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">vos victoires.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Participez aux meilleures enchères du moment et remportez des produits exclusifs à des prix imbattables.
            </p>
            <div className="flex gap-4">
              <Link to="/products" className="bg-orange-600 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2">
                Commencer <ArrowRight className="w-5 h-5"/>
              </Link>
              <Link to="/auth" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                S'inscrire
              </Link>
            </div>
          </div>
        </section>



        {/* --- 3. CURRENT AUCTIONS --- */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Zap className="w-6 h-6"/></div>
            <h2 className="text-3xl font-bold text-gray-900">Enchères en cours</h2>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : currentAuctions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-lg">Aucune enchère active pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentAuctions.map((auction) => (
                <div key={auction.id} className="relative">
                  {/* Badge Hot */}
                  {auction.isHot && (
                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                      HOT 🔥
                    </div>
                  )}
                  <AuctionCard
                    id={auction.id}
                    name={auction.name}
                    oldPrice={`${auction.price} ${auction.currency}`}
                    countdown={auction.time}
                    image={auction.image}
                    status="Live"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- 4. BANNERS PROMO --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group rounded-2xl overflow-hidden h-64 flex items-center shadow-lg">
            <img src="/banner2.png" alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-transparent"></div>
            <div className="relative z-10 p-10">
              <span className="text-orange-200 font-bold tracking-wider text-xs uppercase">Promo Spéciale</span>
              <h3 className="text-3xl font-bold text-white mb-4 mt-2">Électronique <br/> Premium</h3>
              <button className="text-white border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg hover:bg-white hover:text-orange-600 transition-all font-semibold">
                Voir l'offre
              </button>
            </div>
          </div>

          <div className="relative group rounded-2xl overflow-hidden h-64 flex items-center shadow-lg">
            <img src="/banner3.png" alt="Promo" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
            <div className="relative z-10 p-10">
              <span className="text-blue-200 font-bold tracking-wider text-xs uppercase">Nouvel Arrivage</span>
              <h3 className="text-3xl font-bold text-white mb-4 mt-2">Mode & <br/> Accessoires</h3>
              <button className="text-white border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg hover:bg-white hover:text-blue-900 transition-all font-semibold">
                Voir l'offre
              </button>
            </div>
          </div>
        </section>

        {/* --- 5. ENDED AUCTIONS --- */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gray-200 rounded-lg text-gray-700"><Clock className="w-6 h-6"/></div>
            <h2 className="text-3xl font-bold text-gray-900">Dernières ventes</h2>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : endedAuctions.length === 0 ? (
            <p className="text-gray-500">Pas d'enchères terminées récemment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {endedAuctions.map((auction, index) => (
                <div key={index} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="h-56 bg-gray-100 relative overflow-hidden">
                    <img
                      src={auction.image}
                      alt={auction.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold border-2 border-white px-4 py-1 rounded-full">Vendu</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">{auction.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 text-xs">Prix final</span>
                      <span className="text-green-600 font-extrabold text-lg">{auction.price} {auction.currency}</span>
                    </div>
                    <Link to={`/product/${auction.id}`}>
                      <button className="w-full bg-gray-50 text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-sm">
                        Voir les détails
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- 6. TRUST SECTION (Refactorisé) --- */}
        <section className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Pourquoi nous choisir ?</h2>
            <p className="text-gray-500">Une plateforme sécurisée et transparente pour toutes vos enchères.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Paiement Sécurisé", 
                desc: "Transactions chiffrées et protégées.", 
                icon: <Shield className="w-8 h-8 text-orange-600"/>,
                color: "bg-orange-50"
              },
              { 
                title: "Vendeurs Vérifiés", 
                desc: "Identité contrôlée pour chaque vendeur.", 
                icon: <CheckCircle className="w-8 h-8 text-blue-600"/>,
                color: "bg-blue-50"
              },
              { 
                title: "Support 24/7", 
                desc: "Une équipe dédiée à votre écoute.", 
                icon: <Headphones className="w-8 h-8 text-purple-600"/>,
                color: "bg-purple-50"
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 text-center group">
                <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
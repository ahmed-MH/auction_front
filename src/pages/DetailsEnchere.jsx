import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { format } from "date-fns";

// --- IMPORT DES ICONES ---
import { Heart, Phone, User, Pencil, Trash2, Trophy, AlertTriangle } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// --- IMPORT DES COMPOSANTS ---
import { AuctionCard } from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ÉTATS ---
  const [product, setProduct] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [winner, setWinner] = useState(null);
  
  const [userPrice, setUserPrice] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Récupération user
  const isLoggedIn = !!localStorage.getItem("user");
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem("user")) : null;

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer le produit
        const res = await api.get(`/api/encheres/${id}`);
        const productData = res.data;
        setProduct(productData);

        // Initialiser l'image
        if (productData.imageUrls && productData.imageUrls.length > 0) {
          setSelectedImage(productData.imageUrls[0]);
        } else {
          setSelectedImage("https://via.placeholder.com/400x300?text=No+Image");
        }

        // 2. Récupérer les participations
        fetchParticipations();

        // 3. Produits similaires
        if (productData.categorie?.id) {
          fetchSimilarProducts(productData.categorie.id, productData.id);
        }

        // 4. Si terminée, chercher le gagnant
        const now = new Date();
        const endDate = new Date(productData.dateFin);
        if (productData.statut === 'TERMINEE' || now > endDate) {
          fetchWinner(productData.id);
        }

      } catch (err) {
        console.error("Erreur chargement global :", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAllData();
  }, [id]);

  const fetchParticipations = async () => {
    try {
      const res = await api.get(`/api/participations/enchere/${id}`);
      setParticipations(res.data.sort((a, b) => b.montant - a.montant));
    } catch (error) {
      console.warn("Pas de participations trouvées");
      setParticipations([]);
    }
  };

  const fetchWinner = async (enchereId) => {
    try {
      const res = await api.get(`/api/participations/enchere/${enchereId}/gagnant`);
      setWinner(res.data);
    } catch (err) {
      // Ignorer erreur 404 si pas de gagnant
    }
  };

  const fetchSimilarProducts = async (catId, currentId) => {
    try {
      const res = await api.get(`/api/encheres/categorie/${catId}`);
      setSimilarProducts(res.data.filter((p) => p.id !== currentId));
    } catch (err) {
      console.error("Erreur similaires");
    }
  };

  const safeFormatDate = (dateString) => {
    try {
      if (!dateString) return "Date inconnue";
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return "Date invalide";
    }
  };

  // --- LOGIQUE ENCHÈRE ---
  const handleBid = async () => {
    // 1. Vérification User et ID Enchère
    if (!currentUser || !currentUser.id) {
        alert("Veuillez vous connecter !");
        navigate("/auth");
        return;
    }
    if (!id) {
        alert("Erreur technique : ID Enchère manquant.");
        return;
    }

    // 2. Nettoyage prix
    const sanitizedPrice = userPrice.toString().replace(',', '.');
    const bidAmount = parseFloat(sanitizedPrice);

    if (!userPrice || isNaN(bidAmount)) {
      alert("⚠️ Veuillez entrer un montant valide !");
      return;
    }

    if (product.montantActuel && bidAmount <= product.montantActuel) {
      alert(`⚠️ Votre enchère doit être supérieure à ${product.montantActuel} DT`);
      return;
    }

    // 3. Vérif Solde
    if (currentUser.soldeCredit < bidAmount) {
      const manquant = bidAmount - currentUser.soldeCredit;
      if (window.confirm(`Solde insuffisant (Manque ${manquant.toFixed(2)} DT). Recharger ?`)) {
        navigate("/account");
      }
      return;
    }

    setBidLoading(true);

    try {
      console.log(`Envoi API: EnchereID=${id}, UserID=${currentUser.id}, Montant=${bidAmount}`);

      // 4. APPEL API POST
      await api.post(
        `/api/participations/enchere/${id}/utilisateur/${currentUser.id}`,
        {}, // Body vide car on utilise @RequestParam
        { params: { montant: bidAmount } } // Params URL
      );

      alert(`✅ Enchère de ${bidAmount} DT placée avec succès !`);
      setUserPrice("");
      
      // 5. Rafraîchir les données
      const res = await api.get(`/api/encheres/${id}`);
      setProduct(res.data);
      fetchParticipations();

      // Mettre à jour solde utilisateur localement (optionnel mais recommandé)
      const updatedUser = { ...currentUser, soldeCredit: currentUser.soldeCredit - bidAmount };
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (err) {
      console.error("Erreur API :", err);
      let msg = "Erreur technique lors de l'enchère.";
      if (err.response?.data) {
          msg = typeof err.response.data === "string" ? err.response.data : err.response.data.message || msg;
      }
      alert(`⚠️ ${msg}`);
    } finally {
      setBidLoading(false);
    }
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (!wishlist.find(i => i.id === product.id)) {
      wishlist.push({ ...product, image: selectedImage });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("Ajouté aux favoris !");
    } else {
      alert("Déjà dans les favoris.");
    }
  };


  // --- RENDU ---
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Enchère introuvable</h2>
        <button onClick={() => navigate("/products")} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded">
          Retour
        </button>
      </div>
    );
  }

  const now = new Date();
  const endDate = new Date(product.dateFin);
  const isEnded = product.statut === 'TERMINEE' || now > endDate;
  const isOwner = currentUser && product.createurId === currentUser.id;

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      <nav className="px-6 md:px-24 py-4 text-sm text-gray-500 bg-gray-50">
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/")}>Accueil</span> /{" "}
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/products")}>Enchères</span> /{" "}
        <span className="text-orange-600 font-medium">{product.nomProduit}</span>
      </nav>

      <main className="flex-1 px-6 md:px-24 py-8 space-y-12">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Images */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="relative group rounded-xl overflow-hidden shadow-lg border border-gray-100">
              <img src={selectedImage} alt={product.nomProduit} className="w-full h-[400px] object-cover" />
              {product.imageUrls && product.imageUrls.length > 1 && (
                <>
                   {/* Flèches si besoin */}
                </>
              )}
            </div>
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.imageUrls.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImage(url)} className={`w-16 h-16 rounded-lg border-2 flex-shrink-0 overflow-hidden ${selectedImage === url ? 'border-orange-500' : 'border-transparent'}`}>
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Produit */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.nomProduit}</h1>
                <p className="text-gray-500 text-sm">Catégorie: <span className="font-medium">{product.categorie?.libelleCategorie}</span></p>
              </div>
              {isEnded && <span className="px-4 py-1 bg-red-100 text-red-700 font-bold rounded-full text-xs">TERMINÉE</span>}
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed text-lg line-clamp-4">{product.description}</p>
            
            <div className="mt-6 flex gap-8 text-sm text-gray-500 border-y border-gray-100 py-4">
              <div><p>Début :</p><p className="font-semibold text-gray-800">{safeFormatDate(product.dateDebut)}</p></div>
              <div><p>Fin :</p><p className={`font-semibold ${isEnded ? 'text-red-500' : 'text-green-600'}`}>{safeFormatDate(product.dateFin)}</p></div>
            </div>

            {/* Zone Prix */}
            <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
              {isEnded ? (
                <div className="flex flex-col items-center text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mb-2" />
                  <h3 className="text-xl font-bold text-gray-800">Enchère Terminée</h3>
                  {winner ? (
                    <div className="mt-2">
                      <p className="text-gray-600">Gagnant : <span className="font-bold text-gray-900">{winner.nomUtilisateur}</span></p>
                      <p className="text-2xl font-bold text-green-600">{winner.montant} DT</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">Aucun gagnant.</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Prix actuel</p>
                      <p className="text-4xl font-bold text-orange-600">{product.montantActuel} DT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Départ: {product.prixDepart} DT</p>
                      <p className="text-xs text-blue-600 font-semibold">{participations.length} offres</p>
                    </div>
                  </div>

                  {!isOwner ? (
                    <div className="flex gap-3">
                      <input 
                        type="number" 
                        value={userPrice}
                        onChange={(e) => setUserPrice(e.target.value)}
                        placeholder={(product.montantActuel + 1) + " DT"}
                        className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-lg font-semibold focus:border-orange-500 focus:outline-none"
                      />
                      <button 
                        onClick={handleBid}
                        disabled={bidLoading}
                        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${bidLoading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
                      >
                        {bidLoading ? "..." : "Enchérir"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center font-medium">Vous êtes le vendeur.</div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {!isEnded && !isOwner && (
              <div className="mt-6 flex gap-4">
                <button onClick={handleWishlist} className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition font-medium"><Heart className="w-5 h-5" /> Favoris</button>
                <Link to="/contact" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition font-medium"><Phone className="w-5 h-5" /> Contacter</Link>
              </div>
            )}
            {isOwner && !isEnded && (
              <div className="mt-6 flex gap-4">
                 <button onClick={() => navigate("/edit-bid", { state: { product } })} className="flex items-center gap-2 text-blue-600 font-medium hover:underline"><Pencil className="w-4 h-4"/> Modifier</button>
                 <button onClick={async () => { if(window.confirm("Supprimer ?")) { await api.delete(`/api/encheres/${id}`); navigate("/products"); }}} className="flex items-center gap-2 text-red-600 font-medium hover:underline"><Trash2 className="w-4 h-4"/> Supprimer</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b flex gap-8">
            <button onClick={() => setActiveTab("description")} className={`pb-4 font-semibold text-lg transition ${activeTab === 'description' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}>Description</button>
            <button onClick={() => setActiveTab("similar")} className={`pb-4 font-semibold text-lg transition ${activeTab === 'similar' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}>Similaires</button>
          </div>
          <div className="py-8">
            {activeTab === "description" && <p className="text-gray-700">{product.description}</p>}
            {activeTab === "similar" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map(p => (
                  <AuctionCard key={p.id} id={p.id} name={p.nomProduit} oldPrice={p.montantActuel + " DT"} image={p.imageUrls?.[0]} status={p.statut} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Historique */}
        {participations.length > 0 && (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden mb-12">
            <div className="bg-gray-50 px-6 py-4 border-b"><h3 className="font-bold text-gray-800 flex items-center gap-2"><User className="w-5 h-5" /> Historique ({participations.length})</h3></div>
            <div className="divide-y">
              {participations.map((p, idx) => (
                <div key={p.id} className={`p-4 flex justify-between items-center hover:bg-gray-50 transition ${idx===0 && !isEnded ? 'bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{p.nomUtilisateur ? p.nomUtilisateur.charAt(0).toUpperCase() : "?"}</div>
                    <div>
                      <p className="font-medium text-gray-900">{p.nomUtilisateur} {idx===0 && !isEnded && <span className="text-xs bg-orange-500 text-white px-2 rounded-full ml-2">Leader</span>}</p>
                      <p className="text-xs text-gray-500">{safeFormatDate(p.dateParticipation)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-gray-700">{p.montant} DT</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
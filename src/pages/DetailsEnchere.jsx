import React, { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { format } from "date-fns";

// --- IMPORT DES ICONES ---
import { Heart, Phone, User, Pencil, Trash2, Trophy, AlertTriangle, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// --- IMPORT DES COMPOSANTS ---
import { AuctionCard } from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alert, confirm } = useModal();

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

  // --- 1. CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // A. Récupérer le produit
        const res = await api.get(`/api/encheres/${id}`);
        const productData = res.data;
        setProduct(productData);

        // B. Initialiser l'image principale
        if (productData.imageUrls && productData.imageUrls.length > 0) {
          setSelectedImage(productData.imageUrls[0]);
        } else {
          setSelectedImage("https://via.placeholder.com/400x300?text=No+Image");
        }

        // C. Récupérer les participations
        fetchParticipations();

        // D. Produits similaires
        if (productData.categorie?.id) {
          fetchSimilarProducts(productData.categorie.id, productData.id);
        }

        // E. Si terminée, chercher le gagnant
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

  // --- APPELS API AUXILIAIRES ---

  const fetchParticipations = async () => {
    try {
      const res = await api.get(`/api/participations/enchere/${id}`);
      // Tri du plus grand montant au plus petit
      setParticipations(res.data.sort((a, b) => b.montant - a.montant));
    } catch (error) {
      setParticipations([]);
    }
  };

  const fetchWinner = async (enchereId) => {
    try {
      const res = await api.get(`/api/participations/enchere/${enchereId}/gagnant`);
      setWinner(res.data);
    } catch (err) {
      // Pas de gagnant ou erreur 404 normale si personne n'a enchéri
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

  // --- 2. LOGIQUE ENCHÈRE (Corrigée) ---
  const handleBid = async () => {
    // A. Vérifications préliminaires
    if (!currentUser) {
      await alert("Veuillez vous connecter pour enchérir !", { variant: "warning", title: "Connexion requise" });
      navigate("/auth");
      return;
    }

    // B. Nettoyage et conversion du prix
    const sanitizedPrice = userPrice.toString().replace(',', '.');
    const bidAmount = parseFloat(sanitizedPrice);

    if (!userPrice || isNaN(bidAmount)) {
      await alert("Veuillez entrer un montant valide !", { variant: "error" });
      return;
    }

    if (product.montantActuel && bidAmount <= product.montantActuel) {
      await alert(`Votre enchère doit être supérieure à ${product.montantActuel} DT`, { variant: "warning" });
      return;
    }

    // C. Vérification Solde
    if (currentUser.soldeCredit < bidAmount) {
      const manquant = bidAmount - currentUser.soldeCredit;
      if (await confirm(`Solde insuffisant (Manque ${manquant.toFixed(2)} DT). Voulez-vous recharger votre compte ?`, { title: "Solde Insuffisant", variant: "error" })) {
        navigate("/account");
      }
      return;
    }

    setBidLoading(true);

    try {
      // D. APPEL API (POST avec Query Params)
      await api.post(
        `/api/participations/enchere/${id}/utilisateur/${currentUser.id}`,
        {}, // Body vide
        { params: { montant: bidAmount } } // Params URL
      );

      await alert(`Enchère de ${bidAmount} DT placée avec succès !`, { variant: "success", title: "Félicitations" });
      setUserPrice("");

      // E. Rafraîchissement des données
      const res = await api.get(`/api/encheres/${id}`);
      setProduct(res.data);
      fetchParticipations();

      // Mise à jour locale du solde (optionnel)
      const updatedUser = { ...currentUser, soldeCredit: currentUser.soldeCredit - bidAmount }; // Note: C'est une estimation, le backend gère le vrai solde
      // localStorage.setItem("user", JSON.stringify(updatedUser)); // Décommentez si vous voulez mettre à jour le localstorage

    } catch (err) {
      console.error("Erreur API :", err);
      let msg = "Erreur technique lors de l'enchère.";
      if (err.response && err.response.data) {
        // Gère les messages string ou objet JSON
        msg = typeof err.response.data === "string" ? err.response.data : (err.response.data.message || msg);
      }
      await alert(msg, { variant: "error", title: "Erreur" });
    } finally {
      setBidLoading(false);
    }
  };

  // --- 3. LOGIQUE WISHLIST (Corrigée pour éviter les objets) ---
  const handleWishlist = async () => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    // Vérifier si existe déjà
    const exists = wishlist.some(item => item.id === product.id);

    if (!exists) {
      // On crée un objet "plat" (Flat object) pour éviter les erreurs d'objets imbriqués
      const wishlistItem = {
        id: product.id,
        nomProduit: product.nomProduit,
        montantActuel: product.montantActuel,
        prixDepart: product.prixDepart,
        image: selectedImage, // L'image affichée
        categorie: product.categorie?.libelleCategorie || "Autre", // STRING (Important !)
        dateFin: product.dateFin,
        statut: product.statut
      };

      wishlist.push(wishlistItem);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      await alert("Produit ajouté à votre liste de souhaits !", { variant: "success" });
    } else {
      await alert("Ce produit est déjà dans votre liste.", { variant: "info" });
    }
  };


  // --- RENDU CONDITIONNEL ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
        <p className="mt-4 text-gray-500">Chargement de l'enchère...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Enchère introuvable</h2>
        <button onClick={() => navigate("/products")} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
          Retour aux produits
        </button>
      </div>
    );
  }

  const now = new Date();
  const endDate = new Date(product.dateFin);
  const isEnded = product.statut === 'TERMINEE' || now > endDate;
  const isOwner = currentUser && product.createurId === currentUser.id;

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />

      {/* Fil d'ariane */}
      <nav className="px-6 md:px-24 py-4 text-sm text-gray-500 bg-gray-50 border-b border-gray-100">
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/")}>Accueil</span> /{" "}
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/products")}>Enchères</span> /{" "}
        <span className="text-orange-600 font-medium">{product.nomProduit}</span>
      </nav>

      <main className="flex-1 px-6 md:px-24 py-10 space-y-12">
        <div className="flex flex-col md:flex-row gap-12">

          {/* A. GALERIE D'IMAGES */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              <img src={selectedImage} alt={product.nomProduit} className="w-full h-[450px] object-contain p-4 transition-transform duration-500 group-hover:scale-105" />

              {/* Navigation Images */}
              {product.imageUrls && product.imageUrls.length > 1 && (
                <>
                  {/* Vous pouvez ajouter des flèches ici si nécessaire */}
                </>
              )}
            </div>

            {/* Miniatures */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all ${selectedImage === url ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Vue ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* B. INFORMATIONS & ACTIONS */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.nomProduit}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  {product.categorie?.libelleCategorie || "Divers"}
                </span>
              </div>
              {isEnded ? (
                <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg uppercase text-xs tracking-wider border border-red-200">Terminée</span>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg uppercase text-xs tracking-wider border border-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En Direct
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-lg mb-8 border-b border-gray-100 pb-6">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date de début</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> {safeFormatDate(product.dateDebut)}
                </p>
              </div>
              <div className={`p-4 rounded-xl border ${isEnded ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <p className={`text-xs uppercase font-bold mb-1 ${isEnded ? 'text-red-500' : 'text-green-600'}`}>
                  {isEnded ? "Date de fin" : "Se termine le"}
                </p>
                <p className={`font-semibold flex items-center gap-2 ${isEnded ? 'text-red-700' : 'text-green-800'}`}>
                  <Clock className="w-4 h-4" /> {safeFormatDate(product.dateFin)}
                </p>
              </div>
            </div>

            {/* --- ZONE D'ENCHÈRE --- */}
            <div className="mt-auto bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-xl shadow-orange-50/50">
              {isEnded ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="p-4 bg-yellow-100 rounded-full mb-3 shadow-inner"><Trophy className="w-10 h-10 text-yellow-600" /></div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Enchère Clôturée</h3>
                  {winner ? (
                    <div className="mt-2 bg-yellow-50 px-6 py-3 rounded-xl border border-yellow-200">
                      <p className="text-gray-600 text-sm">Remportée par</p>
                      <p className="text-xl font-bold text-gray-900">{winner.nomUtilisateur}</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{winner.montant} DT</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">Aucune offre n'a été faite pour ce produit.</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Offre actuelle la plus haute</p>
                      <p className="text-5xl font-extrabold text-orange-600 tracking-tight">{product.montantActuel} <span className="text-2xl text-gray-400 font-normal">DT</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Prix de départ</p>
                      <p className="text-lg font-bold text-gray-700">{product.prixDepart} DT</p>
                    </div>
                  </div>

                  {!isOwner ? (
                    <div className="flex flex-col gap-3">
                      {isLoggedIn ? (
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">DT</span>
                            <input
                              type="number"
                              value={userPrice}
                              onChange={(e) => setUserPrice(e.target.value)}
                              placeholder={(product.montantActuel + 1)}
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg font-bold focus:border-orange-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <button
                            onClick={handleBid}
                            disabled={bidLoading}
                            className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-orange-200 flex items-center gap-2 transition-all transform active:scale-95 ${bidLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:-translate-y-1'}`}
                          >
                            {bidLoading ? "Envoi..." : <>Enchérir <ArrowRight className="w-5 h-5" /></>}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => navigate('/auth')} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                          Se connecter pour enchérir
                        </button>
                      )}

                      {currentUser && currentUser.soldeCredit < (parseFloat(userPrice) || 0) && (
                        <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Solde insuffisant ({currentUser.soldeCredit} DT disponibles)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-center font-bold border border-blue-100 flex items-center justify-center gap-2">
                      <User className="w-5 h-5" /> Vous êtes le vendeur de cet objet
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Boutons Actions */}
            <div className="mt-6 flex flex-wrap gap-4">
              {!isOwner && (
                <>
                  <button
                    onClick={handleWishlist}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all"
                  >
                    <Heart className="w-5 h-5" /> Sauvegarder
                  </button>
                  <Link to="/contact" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                    <Phone className="w-5 h-5" /> Contacter
                  </Link>
                  <div className="ml-auto flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" /> Paiement Sécurisé
                  </div>
                </>
              )}

              {isOwner && !isEnded && (
                <div className="flex gap-4 w-full">
                  <button onClick={() => navigate("/edit-bid", { state: { product } })} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition"><Pencil className="w-4 h-4" /> Modifier l'annonce</button>
                  <button onClick={async () => { if (await confirm("Voulez-vous vraiment supprimer cette enchère ?", { title: "Supprimer", variant: "error" })) { await api.delete(`/api/encheres/${id}`); navigate("/products"); } }} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition"><Trash2 className="w-4 h-4" /> Supprimer</button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TABS (Description / Similaires) */}
        <div className="mt-12">
          <div className="border-b border-gray-200 flex gap-8">
            <button onClick={() => setActiveTab("description")} className={`pb-4 font-bold text-lg transition border-b-2 px-2 ${activeTab === 'description' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Description</button>
            <button onClick={() => setActiveTab("similar")} className={`pb-4 font-bold text-lg transition border-b-2 px-2 ${activeTab === 'similar' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Produits Similaires</button>
          </div>

          <div className="py-8 min-h-[200px]">
            {activeTab === "description" && (
              <div className="prose max-w-none text-gray-700 bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {activeTab === "similar" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.length > 0 ? similarProducts.map(p => (
                  <AuctionCard key={p.id} id={p.id} name={p.nomProduit} oldPrice={p.montantActuel + " DT"} image={p.imageUrls?.[0]} status={p.statut} />
                )) : (
                  <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Aucun produit similaire trouvé dans cette catégorie.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HISTORIQUE DES ENCHÈRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm"><User className="w-5 h-5 text-gray-600" /></div>
              Historique des offres
            </h3>
            <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">{participations.length} offres</span>
          </div>

          <div className="divide-y divide-gray-100">
            {participations.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Soyez le premier à enchérir !</div>
            ) : (
              participations.map((p, idx) => (
                <div key={p.id} className={`p-6 flex justify-between items-center hover:bg-gray-50 transition ${idx === 0 && !isEnded ? 'bg-orange-50/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${idx === 0 && !isEnded ? 'bg-orange-100 text-orange-600 border-2 border-white ring-2 ring-orange-200' : 'bg-gray-200 text-gray-600'}`}>
                      {p.nomUtilisateur ? p.nomUtilisateur.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {p.nomUtilisateur}
                        {idx === 0 && !isEnded && <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">En tête</span>}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">{safeFormatDate(p.dateParticipation)}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-xl ${idx === 0 && !isEnded ? 'text-orange-600' : 'text-gray-700'}`}>{p.montant} DT</span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
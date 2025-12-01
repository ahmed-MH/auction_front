import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Phone, User, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AuctionCard } from "../components/ProductCard";

import Header from "../components/Header";
import Footer from "../components/Footer";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [userPrice, setUserPrice] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  const isLoggedIn = !!localStorage.getItem("user");
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/enchers/${id}`);
        setProduct(res.data);

        setSelectedImage(
          res.data.imageUrls && res.data.imageUrls.length > 0
            ? res.data.imageUrls[0]
            : "https://via.placeholder.com/400x300?text=No+Image"
        );

        // CHARGER LES PARTICIPATIONS
        fetchParticipations();

        // CHARGER LES PRODUITS SIMILAIRES
        fetchSimilarProducts(res.data.categorie?.id, res.data.id);

      } catch (err) {
        console.error("Erreur récupération produit :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchParticipations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/participations/enchere/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const sortedParticipations = res.data.sort((a, b) => b.montant - a.montant);
      setParticipations(sortedParticipations);
    } catch (err) {
      console.error("Erreur récupération participations :", err);
    }
  };


  const fetchSimilarProducts = async (categoryId, currentProductId) => {
    if (!categoryId) return;

    try {
      const res = await axios.get("http://localhost:8080/api/enchers/categorie/" + categoryId);

      // Exclure le produit actuel
      const filtered = res.data.filter((p) => p.id !== currentProductId);

      setSimilarProducts(filtered);
    } catch (err) {
      console.error("Erreur récupération produits similaires :", err);
    }
  };

  const handleBid = async () => {
    if (!userPrice || isNaN(userPrice)) {
      alert("⚠️ Veuillez entrer un montant valide !");
      return;
    }

    const bidAmount = parseFloat(userPrice);

    if (bidAmount <= product.montantActuel) {
      alert(`⚠️ Votre enchère doit être supérieure à ${product.montantActuel} DT !`);
      return;
    }

    // ✅ Vérifier si l'utilisateur a assez de crédits
    if (currentUser && currentUser.soldeCredit < bidAmount) {
      const deficit = bidAmount - currentUser.soldeCredit;
      const confirmBuy = window.confirm(
        `⚠️ Solde insuffisant !\n\n` +
        `Votre solde actuel : ${currentUser.soldeCredit} crédits\n` +
        `Montant requis : ${bidAmount} crédits\n` +
        `Il vous manque : ${deficit.toFixed(2)} crédits\n\n` +
        `Voulez-vous acheter des crédits maintenant ?`
      );

      if (confirmBuy) {
        navigate("/account"); // Redirect to account page to buy credits
      }
      return;
    }

    setBidLoading(true);

    try {
      // Appel API pour ajouter la participation
      await axios.post(
        `http://localhost:8080/api/participations/enchere/${id}/utilisateur/${currentUser.id}?montant=${bidAmount}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      alert(`✅ Votre enchère de ${bidAmount} DT a été enregistrée !`);
      setUserPrice("");

      // Recharger le produit et les participations
      const productRes = await axios.get(
        `http://localhost:8080/api/enchers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProduct(productRes.data);

      fetchParticipations();

    } catch (err) {
      console.error("Erreur lors de l'enchère :", err);

      if (err.response && err.response.data) {
        alert(`⚠️ Erreur : ${err.response.data}`);
      } else {
        alert("⚠️ Erreur lors de la soumission de votre enchère !");
      }
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading product...</p>;
  if (!product)
    return <p className="text-center mt-20 text-red-500">Product not found!</p>;

  const now = new Date();
  const endDate = new Date(product.dateFin);
  const isEnded = now > endDate;

  const isOwner = currentUser && product.createurId === currentUser.id;
  const handleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    // Vérifier si le produit existe déjà
    const exists = wishlist.some(item => item.id === product.id);

    if (!exists) {
      wishlist.push({
        id: product.id,
        nomProduit: product.nomProduit,
        montantActuel: product.montantActuel,
        prixDepart: product.prixDepart,
        image: product.imageUrls?.[0] || "",
        categorie: product.categorie?.libelleCategorie,
        dateDebut: product.dateDebut,
        dateFin: product.dateFin,
        statut: product.statut
      });

      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("✔ Produit ajouté au Wishlist !");
    } else {
      alert("⚠ Ce produit est déjà dans le wishlist !");
    }
  };


  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <nav className="px-8 md:px-24 py-6 text-sm text-gray-600">
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/")}>
          Home
        </span>{" "}
        /{" "}
        <span className="hover:text-orange-600 cursor-pointer" onClick={() => navigate("/products")}>
          Products
        </span>{" "}
        / <span className="text-orange-600 font-medium">{product.nomProduit}</span>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-8 md:px-24 pb-20 space-y-12">
        {/* Product Info Section */}
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl p-6 md:p-8 shadow-md">
          {/* Images Section */}
          <div className="relative flex flex-col w-full md:w-[320px]">

            {/* BOUTON GAUCHE */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = product.imageUrls.indexOf(selectedImage);
                  const prevIndex =
                    (currentIndex - 1 + product.imageUrls.length) %
                    product.imageUrls.length;
                  setSelectedImage(product.imageUrls[prevIndex]);
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 z-10"
              >
                <IoIosArrowBack />
              </button>
            )}

            {/* IMAGE PRINCIPALE */}
            <img
              src={selectedImage}
              alt={product.nomProduit}
              className="w-full h-[400px] object-cover rounded-lg mb-4"
            />

            {/* BOUTON DROITE */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <button
                onClick={() => {
                  const currentIndex = product.imageUrls.indexOf(selectedImage);
                  const nextIndex = (currentIndex + 1) % product.imageUrls.length;
                  setSelectedImage(product.imageUrls[nextIndex]);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 z-10"
              >
                <IoIosArrowForward />
              </button>
            )}

            {/* MINIATURES */}
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex space-x-2 justify-center">
                {product.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden focus:outline-none ${selectedImage === url ? "border-orange-500" : "border-gray-300"
                      }`}
                  >
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.nomProduit}
            </h1>

            <p className="text-sm text-gray-500 mb-4">
              Catégorie:{" "}
              <span className="text-gray-700">
                {product.categorie?.libelleCategorie}
              </span>
            </p>

            <p className="text-sm text-gray-500 mb-2">
              Date de début:{" "}
              <span className="text-gray-700">
                {format(new Date(product.dateDebut), "dd/MM/yyyy HH:mm")}
              </span>
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Valable jusqu'à:{" "}
              <span className="text-gray-700 font-semibold">
                {format(new Date(product.dateFin), "dd/MM/yyyy HH:mm")}
              </span>
            </p>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>
            <div className="flex items-center space-x-2">
              {/* Afficher les boutons uniquement si l’enchère n’est pas terminée */}
              {!isEnded && (
                <>
                  {isOwner ? (
                    // ----- BOUTONS PROPRIÉTAIRE -----
                    <div className="mt-4 flex gap-2">

                      {/* Modifier */}
                      <button
                        onClick={() => navigate("/edit-bid", { state: { product } })}
                        title="Modifier l'enchère"
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={async () => {
                          if (!window.confirm("⚠️ Voulez-vous vraiment supprimer cette enchère ?")) return;

                          try {
                            const token = localStorage.getItem("token");

                            const imagesRes = await axios.get(
                              `http://localhost:8080/api/images/encher/${product.id}`,
                              { headers: { Authorization: `Bearer ${token}` } }
                            );

                            for (const img of imagesRes.data) {
                              await axios.delete(`http://localhost:8080/api/images/${img.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                            }

                            await axios.delete(`http://localhost:8080/api/enchers/${product.id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });

                            alert("Enchère supprimée avec succès !");
                            navigate("/products");

                          } catch (err) {
                            console.error("Erreur suppression :", err);
                            alert("Une erreur est survenue.");
                          }
                        }}
                        title="Supprimer l'enchère"
                        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  ) : (
                    // ----- BOUTONS VISITEURS -----
                    <div className="mt-4 flex gap-2">
                      {/* Wishlist */}
                      <button
                        onClick={handleWishlist}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:text-white text-gray-400 flex items-center justify-center hover:bg-[#FF6B39] transition"
                      >
                        <Heart className="w-4 h-4" />
                      </button>

                      {/* Contact */}
                      <Link to={`/contact/`}>
                        <button className="w-8 h-8 rounded-full text-gray-400 bg-gray-200 flex items-center hover:text-white justify-center hover:bg-[#FF6B39] transition">
                          <Phone className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
            <br />
            {/* PRIX ACTUEL */}
            <div className="border-t pt-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Prix de départ:</p>
                <span className="text-2xl font-semibold text-gray-600">
                  {product.prixDepart} DT
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {isEnded ? "Montant final:" : "Enchère actuelle:"}
                </p>
                <span className="text-4xl font-bold text-orange-600">
                  {product.montantActuel} DT
                </span>
              </div>

              {/* NOMBRE DE PARTICIPANTS */}
              <p className="text-sm text-gray-500 mb-4">
                {participations.length} participant(s)
              </p>

              {/* SECTION ENCHÈRE */}
              <div className="mt-4 flex gap-2">
                {!isEnded && !isOwner ? (
                  isLoggedIn ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        min={product.montantActuel + 0.01}
                        placeholder={`Min: ${product.montantActuel + 1} DT`}
                        value={userPrice}
                        onChange={(e) => setUserPrice(e.target.value)}
                        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 flex-1"
                      />
                      <button
                        onClick={handleBid}
                        disabled={bidLoading}
                        className={`px-6 py-2 rounded text-white font-semibold transition ${bidLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                          }`}
                      >
                        {bidLoading ? "En cours..." : "Enchérir"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate("/auth")}
                      className="bg-[#003847] text-white px-10 py-2 rounded hover:bg-gray-800 transition"
                    >
                      Connectez-vous pour enchérir
                    </button>
                  )
                ) : (
                  <p className="text-red-600 font-semibold">
                    {isOwner
                      ? "Vous êtes le créateur de cette enchère"
                      : `Enchère terminée- Gagnant : ${product.gagnantId ? participations.find(p => p.utilisateurId === product.gagnantId)?.nomUtilisateur : "Aucun"}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="bg-gray-100 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex space-x-2 border-b w-full">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === "description"
                  ? "bg-orange-500 text-white"
                  : "text-[#003847] hover:bg-gray-200"
                }`}
            >
              Description
            </button>

            <button
              onClick={() => setActiveTab("similar")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition ${activeTab === "similar"
                  ? "bg-orange-500 text-white"
                  : "text-[#003847] hover:bg-gray-200"
                }`}
            >
              Enchères similaires
            </button>
          </div>

          {/* CONTENU DES TABS */}
          <div className="mt-4">
            {activeTab === "description" && (
              <div className="text-gray-700 text-sm leading-relaxed">
                <p className="font-bold text-xl text-[#003847]">
                  {product.nomProduit}
                </p>
                <br />
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "similar" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {similarProducts.length === 0 ? (
                    <p className="text-gray-500">Aucun produit similaire.</p>
                  ) : (
                    similarProducts.map((item) => (
                      <AuctionCard
                        key={item.id}
                        id={item.id}
                        name={item.nomProduit}
                        oldPrice={`${item.montantActuel} DT`}
                        image={item.imageUrls?.[0] || "https://via.placeholder.com/200x150"}
                        status={item.statut}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LISTE DES PARTICIPANTS */}
        {(isEnded || isOwner) && participations.length > 0 && (
          <div className="bg-gray-100 rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              Liste des Participants
            </h2>

            <div className="space-y-4">
              {participations.map((participation, index) => (
                <div
                  key={participation.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition ${index === 0
                      ? "bg-orange-100 border-2 border-orange-400"
                      : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {participation.nomUtilisateur}
                      </h3>
                      {index === 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          En tête
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Montant:{" "}
                      <span className="text-orange-500 font-semibold text-lg">
                        {participation.montant} DT
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(participation.dateParticipation), "dd/MM/yyyy à HH:mm")}
                    </p>
                  </div>
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
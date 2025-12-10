import React, { useState, useEffect } from "react";
import api from "../api/axios";
import axios from "axios"; // Cloudinary needs raw axios
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

const EditBid = ({ currentUser, isUserLoaded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // peut contenir File ou {url}
  const [formData, setFormData] = useState({
    nomProduit: "",
    description: "",
    prixDepart: "",
    montantActuel: "",
    dateDebut: "",
    dateFin: "",
    categorieId: ""
  });
  const [loading, setLoading] = useState(false);

  const product = location.state?.product;


  // Charger les catégories
  useEffect(() => {
    api
      .get("/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Erreur chargement catégories :", err));
  }, []);


  // Pré-remplir le formulaire
  useEffect(() => {
    if (product) {
      setFormData({
        nomProduit: product.nomProduit || "",
        description: product.description || "",
        prixDepart: product.prixDepart || "",
        montantActuel: product.montantActuel || "",
        dateDebut: product.dateDebut || "",
        dateFin: product.dateFin || "",
        categorieId: product.categorie?.id || ""
      });
      setImages(product.imageUrls?.map(url => ({ url })) || []);
    }
  }, [product]);
  if (!isUserLoaded) return <div>Chargement...</div>;

  // ❌ User non connecté → redirection
  // Vérifier l'authentification directement depuis localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
  const userRole = localStorage.getItem("userRole") || user?.role;
  
  // ❌ User non connecté → redirection
  if (!user || !token) {
    return <Navigate to="/auth" replace />;
  }
  
  // ❌ Mauvais rôle → redirection (permettre USER uniquement)
  if (userRole !== "USER" && user?.role !== "USER") {
    return <Navigate to="/auth" replace />;
  }

  // Gestion inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion fichiers
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images sur Cloudinary
  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];
    for (const img of images) {
      if (img.url) {
        uploadedUrls.push(img.url);
        continue;
      }
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "encher");
      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dara2kftc/image/upload",
          data
        );
        uploadedUrls.push(res.data.secure_url);
      } catch (err) {
        console.error("Erreur upload image:", err);
      }
    }
    return uploadedUrls;
  };

  // Soumettre le formulaire (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    if (!token) {
      alert("Vous devez être connecté.");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      const imageUrls = await uploadImagesToCloudinary();

      const payload = {
        nomProduit: formData.nomProduit,
        description: formData.description,
        prixDepart: parseFloat(formData.prixDepart),
        montantActuel:
          formData.montantActuel !== ""
            ? parseFloat(formData.montantActuel)
            : parseFloat(formData.prixDepart),
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        categorieId: parseInt(formData.categorieId),
        images: imageUrls.map(url => ({ url }))
      };

      await api.put(
        `/api/encheres/${product.id}`,
        payload
      );

      alert("Enchère mise à jour avec succès !");
      navigate("/products");

    } catch (err) {
      console.error("Erreur mise à jour :", err);
      alert("Erreur lors de la mise à jour de l'enchère.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow flex justify-center items-start py-16 px-4 md:px-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Modifier l'enchère
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nom Produit */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Nom du produit
              </label>
              <input
                type="text"
                name="nomProduit"
                value={formData.nomProduit}
                onChange={handleChange}
                placeholder="Nom du produit"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Catégorie
              </label>
              <select
                name="categorieId"
                value={formData.categorieId}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              >
                <option value="" disabled>
                  Sélectionnez une catégorie...
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.libelleCategorie}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Prix de départ (DT)
              </label>
              <input
                type="text"
                name="prixDepart"
                value={formData.prixDepart}
                onChange={e => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value))
                    setFormData({ ...formData, prixDepart: value });
                }}
                placeholder="Prix de départ"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description détaillée"
                className="w-full px-4 py-3 border rounded-lg min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>

            {/* Upload Images */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Images
              </label>
              <label className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                <input type="file" className="hidden" multiple onChange={handleFilesChange} />
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full mb-3 text-2xl">
                  📁
                </div>
                <p className="text-gray-900 font-medium text-center">
                  Drop files here or <span className="text-orange-500 underline">browse</span>
                </p>
              </label>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.url || URL.createObjectURL(img)}
                        alt={`preview-${index}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
                }`}
            >
              {loading ? "Updating..." : "Mettre à jour"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditBid;

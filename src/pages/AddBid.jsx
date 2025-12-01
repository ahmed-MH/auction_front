import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Navigate } from "react-router-dom";


const AddBid = ({ currentUser }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
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

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Erreur chargement catégories :", err));
  }, []);
  
  if (!currentUser || currentUser.role !== "USER") {
    return <Navigate to="/auth" replace />;
  }

  // Gestion changement des inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion fichiers images
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images sur Cloudinary
  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = [];
    for (const img of images) {
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "encher"); // à configurer dans Cloudinary

      try {
        console.log("Uploading image to Cloudinary:", img.name);
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dara2kftc/image/upload",
          data
        );
        console.log("Upload successful:", res.data.secure_url);
        uploadedUrls.push(res.data.secure_url);
      } catch (err) {
        console.error("Erreur upload image:", img.name, err);
        console.error("Error details:", err.response?.data || err.message);
        // Continue with other images even if one fails
      }
    }
    console.log("Total images uploaded:", uploadedUrls.length, "out of", images.length);
    return uploadedUrls;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Récupération de l'utilisateur connecté
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token"); // Get token

    if (!userId || !token) {
      alert("Vous devez être connecté pour ajouter une enchère.");
      return;
    }

    setLoading(true); // Start loading

    // dates auto
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3);
    const dateDebutAuto = now.toISOString().slice(0, 16);
    const dateFinAuto = threeDaysLater.toISOString().slice(0, 16);

    // Log token for debugging
    console.log("Using Token:", token);
    console.log("Values - UserID:", userId, "CategoryID:", formData.categorieId);

    try {
      // 1️⃣ Upload images
      console.log("Starting image upload. Number of images:", images.length);
      const imageUrls = await uploadImagesToCloudinary();
      console.log("Image URLs received from Cloudinary:", imageUrls);

      // 2️⃣ Préparer payload pour Spring Boot
      // Backend expects EncherCreateDTO with flat IDs: getCategorieId() and getCreateurId()
      const payload = {
        nomProduit: formData.nomProduit,
        description: formData.description,
        prixDepart: parseFloat(formData.prixDepart),
        montantActuel:
          formData.montantActuel !== ""
            ? parseFloat(formData.montantActuel)
            : parseFloat(formData.prixDepart),
        dateDebut: dateDebutAuto,
        dateFin: dateFinAuto,
        statut: "EN_COURS",
        categorieId: parseInt(formData.categorieId), // Flat ID
        images: imageUrls.map((url) => ({ url })),
        createurId: parseInt(userId) // Flat ID
      };

      console.log("Sending payload:", payload);

      const res = await axios.post("http://localhost:8080/api/enchers", payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      alert("Enchère créée avec succès !");
      console.log(res.data);

      // reset form
      setFormData({
        nomProduit: "",
        description: "",
        prixDepart: "",
        montantActuel: "",
        dateDebut: "",
        dateFin: "",
        categorieId: ""
      });
      setImages([]);
      navigate("/products");

    } catch (err) {
      console.error("Erreur création enchère :", err);

      let errorMessage = "Erreur lors de la création de l'enchère.";
      const responseData = err.response?.data;

      if (err.response) {
        errorMessage += ` (Status: ${err.response.status})`;

        // Extract detailed message
        let serverMessage = "";
        if (typeof responseData === 'string') {
          serverMessage = responseData;
        } else if (responseData?.message) {
          serverMessage = responseData.message;
        }

        if (serverMessage) {
          errorMessage += `\nDétails: ${serverMessage}`;
        }

        // Handle Session Expiry (Check for "JWT" in the message)
        if (err.response.status === 403 || (serverMessage && serverMessage.includes("JWT"))) {
          alert("Votre session a expiré ou est invalide. Veuillez vous reconnecter.");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("user");
          navigate("/auth");
          return;
        }
      } else if (err.request) {
        errorMessage += "\nPas de réponse du serveur. Vérifiez votre connexion.";
      } else {
        errorMessage += `\n${err.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow flex justify-center items-start py-16 px-4 md:px-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Créer une nouvelle enchère
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
                {categories.map((cat) => (
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData({ ...formData, prixDepart: value });
                  }
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
              ></textarea>
            </div>

            {/* Upload Images */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Upload Images
              </label>

              <label className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFilesChange}
                />
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full mb-3 text-2xl">
                  📁
                </div>
                <p className="text-gray-900 font-medium text-center">
                  Drop files here or{" "}
                  <span className="text-orange-500 underline">browse</span>
                </p>
              </label>

              {/* Aperçu images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
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
              {loading ? "Creating Auction..." : "Submit Auction"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddBid;

import React, { useState, useEffect } from "react";
import axios from 'axios';
import Header from "../components/Header";
import Footer from "../components/Footer";


const AddBid = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [categories, setCategories] = useState([]); // pour les données
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Erreur chargement catégories :", err));
  }, []);
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };    
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert("⚠️ Please accept the terms!");
      return;
    }
    alert("Bid Submitted ✅");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow flex justify-center items-start py-16 px-4 md:px-12">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-full max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Create a New Auction
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Product Name */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Product Name</label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Category</label>
              <select
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                defaultValue=""
              >
                <option value="" disabled>Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.libelleCategorie} {/* ou libelle_categorie selon ton DTO */}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Condition (Used / New)</label>
              <input
                type="text"
                placeholder="Used or New"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Product Price (DT)</label>
              <input
                type="number"
                placeholder="Enter starting price"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Description</label>
              <textarea
                placeholder="Enter a detailed description"
                className="w-full px-4 py-3 border rounded-lg min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              ></textarea>
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-gray-900 font-medium mb-2">Upload Images</label>
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
                  Drop files here or <span className="text-orange-500 underline">browse</span>
                </p>
              </label>

              {/* Aperçu des images */}
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

            {/* Terms */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
              />
              <label className="text-gray-900">I accept the terms and conditions</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition ${
                acceptTerms ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!acceptTerms}
            >
              Submit Auction
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddBid;

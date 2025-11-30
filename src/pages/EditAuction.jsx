import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const EditAuction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nomProduit: "",
        description: "",
        prixDepart: "",
        montantActuel: "",
        dateDebut: "",
        dateFin: "",
        categorieId: ""
    });

    useEffect(() => {
        // Fetch categories
        api
            .get("/categories")
            .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error loading categories:", err));

        // Fetch auction data
        const fetchAuction = async () => {
            try {
                const res = await api.get(`/enchers/${id}`);
                const auction = res.data;

                setFormData({
                    nomProduit: auction.nomProduit || "",
                    description: auction.description || "",
                    prixDepart: auction.prixDepart || "",
                    montantActuel: auction.montantActuel || "",
                    dateDebut: auction.dateDebut || "",
                    dateFin: auction.dateFin || "",
                    categorieId: auction.categorie?.id || ""
                });

                setExistingImages(auction.images || []);
            } catch (err) {
                console.error("Error fetching auction:", err);
                toast.error("Failed to load auction data");
            } finally {
                setLoading(false);
            }
        };

        fetchAuction();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files]);
    };

    const removeNewImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImagesToCloudinary = async () => {
        const uploadedUrls = [];
        for (const img of images) {
            const data = new FormData();
            data.append("file", img);
            data.append("upload_preset", "encher");

            try {
                const res = await axios.post(
                    "https://api.cloudinary.com/v1_1/dqsqmemye/image/upload",
                    data
                );
                uploadedUrls.push(res.data.secure_url);
            } catch (err) {
                console.error("Error uploading image:", err);
            }
        }
        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Upload new images if any
            const newImageUrls = await uploadImagesToCloudinary();

            // Combine existing images with new ones
            const allImageUrls = [
                ...existingImages.map(img => img.url),
                ...newImageUrls
            ];

            const payload = {
                nomProduit: formData.nomProduit,
                description: formData.description,
                prixDepart: parseFloat(formData.prixDepart),
                montantActuel: parseFloat(formData.montantActuel || formData.prixDepart),
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                statut: "EN_COURS",
                categorie: { id: parseInt(formData.categorieId) },
                images: allImageUrls.map((url) => ({ url }))
            };

            console.log("Sending update payload:", payload);
            await api.put(`/enchers/${id}`, payload);

            toast.success("Auction updated successfully!");
            navigate("/products");
        } catch (err) {
            console.error("Error updating auction:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            toast.error(err.response?.data?.message || "Failed to update auction");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex justify-center items-center h-96">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="container mx-auto px-6 py-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Auction</h1>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Product Name</label>
                        <input
                            type="text"
                            name="nomProduit"
                            value={formData.nomProduit}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Starting Price (DT)</label>
                            <input
                                type="number"
                                name="prixDepart"
                                value={formData.prixDepart}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Category</label>
                            <select
                                name="categorieId"
                                value={formData.categorieId}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.libelleCategorie}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Existing Images</label>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {existingImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={img.url}
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <label className="block text-gray-700 font-semibold mb-2">Add New Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFilesChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`New ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/products")}
                            className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                        >
                            Update Auction
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default EditAuction;

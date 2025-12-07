import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axios"; // Assurez-vous d'importer votre instance axios
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        content: "", // Changé de 'message' à 'content' pour matcher le backend
    });

    const [status, setStatus] = useState("idle"); // idle, sending, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");

        try {
            // Appel API vers le backend
            await api.post("/api/messages", formData);
            
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", content: "" });
            
            // Remettre le statut à idle après 5 secondes
            setTimeout(() => setStatus("idle"), 5000);
        } catch (error) {
            console.error("Erreur envoi message", error);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-[#014152] to-[#022c38] text-white py-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <span className="bg-white/10 px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm">Support 24/7</span>
                        <h1 className="text-5xl font-bold mb-6">Contactez-nous</h1>
                        <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                            Une question sur une enchère ? Un problème technique ? 
                            Notre équipe est là pour vous répondre rapidement.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-12 -mt-16 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-sm">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Téléphone</h3>
                                <p className="text-gray-500 mb-4">Lun-Ven de 8h à 18h.</p>
                                <a href="tel:+21612345789" className="text-orange-600 font-bold hover:text-orange-700 text-lg">
                                    +216 12 345 789
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                                <p className="text-gray-500 mb-4">Réponse sous 24h garantie.</p>
                                <a href="mailto:support@tunibid.com" className="text-blue-600 font-bold hover:text-blue-700 text-lg">
                                    support@tunibid.com
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Siège Social</h3>
                                <p className="text-gray-500 mb-4">Venez nous rencontrer.</p>
                                <p className="text-gray-800 font-medium text-lg">
                                    1000 Sousse, Tunisie
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12 h-full">
                                <div className="flex items-center gap-3 mb-8">
                                    <MessageSquare className="w-8 h-8 text-[#014152]" />
                                    <h2 className="text-3xl font-bold text-gray-900">Envoyez un message</h2>
                                </div>

                                {status === "success" ? (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-green-800 mb-2">Message Envoyé !</h3>
                                        <p className="text-green-700 mb-6">Merci de nous avoir contactés. Nous reviendrons vers vous très vite.</p>
                                        <button onClick={() => setStatus("idle")} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition">
                                            Envoyer un autre message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {status === "error" && (
                                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-200">
                                                <AlertCircle className="w-5 h-5"/> Une erreur est survenue. Veuillez réessayer.
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Votre Nom</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Votre Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Sujet</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Comment pouvons-nous vous aider ?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                            <textarea
                                                name="content" // Important : doit matcher 'content' dans le state
                                                value={formData.content}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                                                placeholder="Détaillez votre demande..."
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === "sending"}
                                            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30"
                                        >
                                            {status === "sending" ? (
                                                <div className="flex items-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Envoi en cours...
                                                </div>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Envoyer le message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
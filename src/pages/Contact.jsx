import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        setStatus("sending");
        setTimeout(() => {
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-[#014152] text-white py-16">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Have questions about our auctions? Need help with your account?
                            We're here to help! Reach out to us using the form below.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-12 -mt-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Phone</h3>
                                <p className="text-gray-500 mb-4">Mon-Fri from 8am to 5pm.</p>
                                <a href="tel:+21612345789" className="text-orange-600 font-medium hover:underline">
                                    +216 12 345 789
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
                                <p className="text-gray-500 mb-4">Our friendly team is here to help.</p>
                                <a href="mailto:support@tunibid.com" className="text-orange-600 font-medium hover:underline">
                                    support@tunibid.com
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Office</h3>
                                <p className="text-gray-500 mb-4">Come say hello at our office headquarters.</p>
                                <p className="text-gray-800 font-medium">
                                    1000 Sousse, Tunisia
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 lg:p-12 h-full">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>

                                {status === "success" ? (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Message Sent!</h4>
                                            <p className="text-sm">We'll get back to you as soon as possible.</p>
                                        </div>
                                        <button
                                            onClick={() => setStatus("")}
                                            className="ml-auto text-green-600 hover:text-green-800"
                                        >
                                            Send another
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                                placeholder="How can we help?"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                                placeholder="Tell us more about your inquiry..."
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === "sending"}
                                            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center disabled:opacity-70"
                                        >
                                            {status === "sending" ? (
                                                <>Sending...</>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-2" />
                                                    Send Message
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

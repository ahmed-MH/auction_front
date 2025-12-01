import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, Package, Gavel, LogOut, Settings, CreditCard } from "lucide-react";

import SettingsModal from "../components/SettingsModal";
import BuyCreditsModal from "../components/BuyCreditsModal";

const MyAccount = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ auctions: 0, bids: 0 });
    const [loading, setLoading] = useState(true);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                const token = localStorage.getItem("token");

                if (!storedUser || !token) {
                    navigate("/auth");
                    return;
                }

                const userData = JSON.parse(storedUser);
                setUser(userData);

                const fetchStats = async (userId, token) => {
                    try {
                        const [auctionsRes, bidsRes] = await Promise.all([
                            fetch(`http://localhost:8080/api/enchers/utilisateur/${userId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            }),
                            fetch(`http://localhost:8080/api/participations/utilisateur/${userId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            })
                        ]);

                        const auctions = await auctionsRes.json();
                        const bids = await bidsRes.json();

                        setStats({
                            auctions: auctions.length,
                            bids: bids.length
                        });

                    } catch (error) {
                        console.error("Erreur récupération stats :", error);
                    }
                };

                await fetchStats(userData.id, token);

            } catch (error) {
                console.error("Failed to initialize user:", error);
                localStorage.clear();
                navigate("/auth");
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/");
    };

    // ✅ Mis à jour du solde utilisateur après paiement
    const handleCreditsUpdated = (updatedUser) => {
        setUser(updatedUser); // Solde et autres infos utilisateur sont mises à jour
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
                    <p className="text-gray-500 mt-2">Manage your profile and view your activity</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform transition-all hover:-translate-y-1 duration-300">
                            <div className="bg-gradient-to-r from-[#014152] to-[#025a70] h-32 relative">
                                <div className="absolute inset-0 bg-black/10"></div>
                            </div>
                            <div className="px-6 pb-8 relative">
                                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-xl mx-auto -mt-12 relative z-10 flex items-center justify-center text-4xl font-bold text-[#014152]">
                                    {user.nom ? user.nom.charAt(0).toUpperCase() : "U"}
                                </div>

                                <div className="text-center mt-4">
                                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                                        {user.nom}
                                    </h2>
                                    <div className="flex items-center justify-center text-gray-500 mt-2 text-sm font-medium">
                                        <Mail className="w-4 h-4 mr-2 text-orange-500" />
                                        {user.email}
                                    </div>
                                    <div className="mt-4">
                                        <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                            User
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                                    <button
                                        onClick={() => setIsSettingsOpen(true)}
                                        className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-gray-700 font-medium bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 group"
                                    >
                                        <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-orange-500" />
                                        Account Settings
                                    </button>

                                    <button
                                        onClick={() => setIsBuyCreditsOpen(true)}
                                        className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-green-700 font-medium bg-green-50 hover:bg-green-100 transition-all duration-200 group"
                                    >
                                        <CreditCard className="w-5 h-5 mr-3 text-green-600 group-hover:text-green-800" />
                                        Buy Credits ({user.soldeCredit} credits)
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-red-600 font-medium bg-red-50 hover:bg-red-100 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5 mr-3" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">My Auctions</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stats.auctions}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
                                    <Gavel className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">My Bids</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stats.bids}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Recent activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>

                            <div className="text-center py-10 text-gray-500">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                                <p>No recent activity found.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modals */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                onUserUpdated={handleCreditsUpdated} // Pour mettre à jour user global
                onLogout={handleLogout}
            />

            <BuyCreditsModal
                isOpen={isBuyCreditsOpen}
                onClose={() => setIsBuyCreditsOpen(false)}
                user={user}
                onCreditsUpdated={handleCreditsUpdated} // ✅ Correct prop
            />
        </div>
    );
};

export default MyAccount;

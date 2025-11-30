import React, { useState } from "react";
import { X, User, Lock, Trash2, AlertTriangle, Save, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const SettingsModal = ({ isOpen, onClose, user, onUserUpdated, onLogout }) => {
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Profile State
    const [profileData, setProfileData] = useState({
        nom: user.nom || "",
        email: user.email || "",
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    // Headers for API calls
    const getHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    // Handle Profile Update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            console.log("Sending profile update payload:", profileData);
            const res = await axios.put(
                "http://localhost:8080/api/profile/update",
                profileData,
                { headers: getHeaders() }
            );

            // Update local storage and parent state
            const updatedUser = { ...user, ...res.data };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            onUserUpdated(updatedUser);

            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to update profile. Please try again.";
            setMessage({ type: "error", text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
        } finally {
            setLoading(false);
        }
    };

    // Handle Password Update
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                ancienMotDePasse: passwordData.oldPassword,
                nouveauMotDePasse: passwordData.newPassword,
            };
            console.log("Sending password update payload:", payload);

            await axios.put(
                "http://localhost:8080/api/profile/password",
                payload,
                { headers: getHeaders() }
            );

            setMessage({ type: "success", text: "Password changed successfully!" });
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to update password. Check your current password.";
            setMessage({ type: "error", text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
        } finally {
            setLoading(false);
        }
    };

    // Handle Account Deletion
    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete("http://localhost:8080/api/profile/delete", {
                headers: getHeaders(),
            });
            onLogout();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to delete account.";
            setMessage({ type: "error", text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-1/3 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                        <button
                            onClick={() => { setActiveTab("profile"); setMessage({ type: "", text: "" }); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "profile"
                                ? "bg-white text-orange-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>General</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab("security"); setMessage({ type: "", text: "" }); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "security"
                                ? "bg-white text-orange-600 shadow-sm"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Lock className="w-4 h-4" />
                            <span>Security</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab("danger"); setMessage({ type: "", text: "" }); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "danger"
                                ? "bg-red-50 text-red-600"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Account</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {activeTab === "profile" && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.nom}
                                        onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "security" && (
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Updating Password..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === "danger" && (
                            <div className="space-y-6">
                                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-red-800">Delete Account</h3>
                                            <p className="text-red-600 mt-1 text-sm">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Deleting..." : "Delete My Account"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

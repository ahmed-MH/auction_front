import React, { useState } from "react";
import { useModal } from "../context/ModalContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Mail, Lock, User, ArrowRight, LogIn, UserPlus, CheckCircle } from "lucide-react";

const Auth = () => {
  const { alert } = useModal();
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({ nom: "", email: "", password: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      await alert("Veuillez entrer le code de vérification", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/verify", {
        email: formData.email,
        code: verificationCode,
      });

      await alert("Compte vérifié avec succès ! Veuillez vous connecter.", { variant: "success" });
      setIsVerifying(false);
      setIsLogin(true);
      setVerificationCode("");
      setFormData({ nom: "", email: "", password: "" });

    } catch (err) {
      const message = err.response?.data?.message || "Code invalide";
      await alert(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nom, email, password } = formData;

    if (!email || !password || (!isLogin && !nom)) {
      await alert("Tous les champs obligatoires doivent être remplis", { variant: "warning" });
      return;
    }

    setLoading(true);

    try {
      const url = isLogin ? "/api/auth/authenticate" : "/api/auth/register";
      const body = isLogin
        ? { email, password }
        : { nom, email, password, roles: ["USER"] };

      console.log("📤 Envoi requête:", { url, body });

      const response = await api.post(url, body);
      const data = response.data;

      console.log("📥 Réponse complète:", data);

      if (isLogin) {
        // ✅ LOGIN
        const token = data.accessToken || data.token || data.jwtToken || data.jwt;
        const userId = data.id || data.userId || data.user_id;
        const userName = data.nom || data.name || data.username || data.fullName;
        const userEmail = data.email;
        const userRole = data.role || (data.roles && data.roles[0]) || "USER";

        if (!token) {
          await alert("Token manquant dans la réponse du serveur", { variant: "error" });
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", userEmail);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("user", JSON.stringify(data));

        if (userRole === "ADMIN") {
          navigate("/admindashboard");
        } else {
          navigate("/");
        }
      } else {
        // ✅ SIGNUP -> Pass to Verification
        await alert("Inscription réussie ! Un code a été envoyé à votre email.", { variant: "success" });
        setIsVerifying(true);
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      let errMsg = err.response?.data?.message || "Erreur serveur";
      const status = err.response?.status;

      // Custom messages based on status code
      if (status === 404) {
        errMsg = "Aucun compte n'est associé à cet email. Veuillez vous inscrire.";
      } else if (status === 401 || status === 403) {
        errMsg = "Email ou mot de passe incorrect (ou compte non vérifié).";
      } else if (err.response?.data?.details) {
        const details = Object.values(err.response.data.details).join(", ");
        errMsg = `${errMsg}: ${details}`;
      }

      await alert(errMsg, { variant: "error", title: "Erreur" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#014152] via-[#01303f] to-[#01202a] z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B39] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0284a3] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-md w-full relative z-10 animate-fadeIn">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
              {isVerifying ? "Verify Account" : (isLogin ? "Welcome Back" : "Join Us Today")}
            </h2>
            <p className="text-blue-200 text-lg">
              {isVerifying
                ? "Enter the code sent to your email"
                : (isLogin ? "Enter your details to access your account" : "Start your journey with us")}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8 transform transition-all duration-300 hover:shadow-orange-900/20">
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 p-3 rounded-full shadow-inner">
                {isVerifying ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  isLogin ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {isVerifying ? (
              <form className="space-y-6" onSubmit={handleVerify}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="code"
                    placeholder="Verification Code (6 digits)"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-white/10 text-center tracking-widest text-xl"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transform transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed scale-100' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </button>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsVerifying(false)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Sign Up
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="nom"
                      placeholder="Full Name"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-white/10"
                      value={formData.nom}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-white/10"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-white/10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transform transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed scale-100' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {!isVerifying && (
              <div className="mt-8 text-center">
                <p className="text-gray-300">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ nom: "", email: "", password: "" });
                    }}
                    className="ml-2 text-orange-400 hover:text-orange-300 font-bold hover:underline transition-colors"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
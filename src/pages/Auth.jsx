import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ nom: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const { nom, email, password } = formData;
  
      if (!email || !password || (!isLogin && !nom)) {
        setError("Tous les champs obligatoires doivent être remplis");
        return;
      }
  
      setError("");
  
      try {
        const url = isLogin
          ? "http://localhost:8080/api/auth/authenticate"
          : "http://localhost:8080/api/auth/register";
  
        const body = isLogin
          ? { email, password }
          : { nom, email, password, roles: ["USER"] };
  
        console.log("📤 Envoi requête:", { url, body });
  
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
  
        // Toujours lire la réponse JSON
        let data;
        try {
          data = await response.json();
        } catch {
          data = { message: await response.text() };
        }
  
        console.log("📥 Réponse complète:", data);
        console.log("📥 Status:", response.status);
  
        if (!response.ok) {
          const errMsg = data?.message || "Erreur serveur";
          if (data?.details) {
            const details = Object.values(data.details).join(", ");
            setError(`${errMsg}: ${details}`);
          } else {
            setError(errMsg);
          }
          console.error("❌ Erreur:", data);
          return;
        }
  
        if (isLogin) {
          // ✅ LOGIN - Essayer toutes les variantes possibles
          const token = data.accessToken || data.token || data.jwtToken || data.jwt;
          const userId = data.id || data.userId || data.user_id;
          const userName = data.nom || data.name || data.username || data.fullName;
          const userEmail = data.email;
          const userRole = data.role || (data.roles && data.roles[0]) || "USER";
  
          console.log("🔍 Extraction des données:");
          console.log("  - Token:", token);
          console.log("  - Role:", userRole);
          console.log("  - User ID:", userId);
          console.log("  - User Name:", userName);
  
          if (!token) {
            setError("❌ Token manquant dans la réponse du serveur");
            console.error("Structure reçue:", Object.keys(data));
            return;
          }
  
          // Sauvegarder dans localStorage
          localStorage.setItem("token", token); // ✅ Sauvegarder aussi sous "token" pour cohérence avec axios.js
          localStorage.setItem("jwtToken", token);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", userName);
          localStorage.setItem("userEmail", userEmail);
          localStorage.setItem("userRole", userRole);
          localStorage.setItem("user", JSON.stringify(data));
      
          console.log("✅ Connexion réussie!");
          console.log("💾 localStorage:", {
            jwtToken: localStorage.getItem('jwtToken'),
            userRole: localStorage.getItem('userRole')
          });
      
          // Redirection selon le rôle
          if (userRole === "ADMIN") {
            console.log("➡️ Redirection vers /admindashboard");
            navigate("/admindashboard");
          } else {
            console.log("➡️ Redirection vers /");
            navigate("/");
          }
        } else {
          // ✅ SIGNUP - Inscription réussie
          alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
          console.log("✅ Nouvel utilisateur créé:", data);
          setIsLogin(true);
          setFormData({ nom: "", email: "", password: "" });
        }
      } catch (err) {
        setError(err.message || "Erreur réseau");
        console.error("❌ Erreur réseau:", err);
      }
    };
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <div className="text-gray-500 text-sm mb-6">Home / Login & Sign up</div>

        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          {isLogin ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Votre email..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Votre mot de passe..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Sign in
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign up</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="Votre nom..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={formData.nom}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Votre email..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Votre mot de passe..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Register
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => { 
                setIsLogin(!isLogin); 
                setError(""); 
                setFormData({ nom: "", email: "", password: "" });
              }}
              className="text-orange-600 hover:text-orange-800 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
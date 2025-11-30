// Auth.jsx
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
  
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
  
        // Toujours lire la réponse JSON pour éviter l'erreur Unexpected token
        let data;
        try {
          data = await response.json();
        } catch {
          data = { message: await response.text() };
        }
  
        if (!response.ok) {
          const errMsg = data?.message || "Erreur serveur";
          if (data?.details) {
            const details = Object.values(data.details).join(", ");
            setError(`${errMsg}: ${details}`);
          } else {
            setError(errMsg);
          }
          console.error("Erreur Auth:", data);
          return;
        }
  
        if (isLogin) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.id);
          localStorage.setItem("user", JSON.stringify(data));
  
          // 🔔 Affichage console pour debug
          console.log("Utilisateur connecté !");
          console.log("Infos utilisateur :", data);
  
          navigate("/");
        } else {
          alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
          console.log("Nouvel utilisateur créé :", data);
          setIsLogin(true);
          setFormData({ nom: "", email: "", password: "" });
        }
      } catch (err) {
        setError(err.message || "Erreur réseau");
        console.error("Erreur réseau :", err);
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
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
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

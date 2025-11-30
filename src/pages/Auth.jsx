// Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";
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
      toast.error("Tous les champs obligatoires doivent être remplis");
      return;
    }

    setError("");

    try {
      const endpoint = isLogin ? "/auth/authenticate" : "/auth/register";

      const body = isLogin
        ? { email, password }
        : { nom, email, password, roles: ["USER"] };

      const response = await api.post(endpoint, body);
      const data = response.data;

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("user", JSON.stringify(data));

        // 🔔 Affichage console pour debug
        console.log("Utilisateur connecté !");
        toast.success("Connexion réussie !");
        console.log("Infos utilisateur :", data);

        navigate("/");
      } else {
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        console.log("Nouvel utilisateur créé :", data);
        setIsLogin(true);
        setFormData({ nom: "", email: "", password: "" });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Erreur réseau";
      toast.error(errMsg);
      setError(errMsg);
      console.error("Erreur Auth :", err);
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

import React,{ useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProductDetails from "./pages/DetailsEnchere";
import AddBid from "./pages/AddBid";
import Products from "./pages/MyProducts";
import Categories from "./pages/Categories";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import MyAccount from "./pages/MyAccount";
import Contact from "./pages/Contact";
import EditBid from "./pages/EditBid";
import HotDeals from "./pages/HotDeals";
import Wishlist from "./pages/Wishlist";
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    // Récupère l'utilisateur depuis localStorage au chargement
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setCurrentUser(user);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/add-bid" element={<AddBid currentUser={currentUser} />} />
        <Route path="/edit-bid" element={<EditBid currentUser={currentUser} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admindashboard/products" element={<AdminProducts />} />
        <Route path="/admindashboard/users" element={<AdminUsers />} />
        <Route path="/admindashboard/transactions" element={<AdminTransactions />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/hot-deals" element={<HotDeals />} />

      </Routes>
    </Router>
  );
}

export default App;

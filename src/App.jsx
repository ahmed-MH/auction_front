import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProductDetails from "./pages/DetailsEnchere";
import AddBid from "./pages/AddBid";
import Products from "./pages/MyProducts";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/add-bid" element={<AddBid />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admindashboard/products" element={<AdminProducts />} />
        <Route path="/admindashboard/users" element={<AdminUsers />} />
        <Route path="/admindashboard/transactions" element={<AdminTransactions />} />
        
      </Routes>
    </Router>
  );
}

export default App;

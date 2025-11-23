import React from "react";
import { Link, useNavigate } from "react-router-dom";

const SidebarAdmin = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#014152] text-white h-screen p-5 space-y-6 fixed">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-3">
        <Link to="/admindashboard" className="hover:text-orange-400">Dashboard</Link>
        <Link to="/admindashboard/products" className="hover:text-orange-400">Products</Link>
        <Link to="/admindashboard/users" className="hover:text-orange-400">Users</Link>
        <Link to="/admindashboard/transactions" className="hover:text-orange-400">Transactions</Link>
      </nav>
      <button 
        onClick={logout}
        className="bg-orange-500 mt-10 px-4 py-2 rounded hover:bg-orange-600 w-full"
      >
        Logout
      </button>
    </div>
  );
};

export default SidebarAdmin;

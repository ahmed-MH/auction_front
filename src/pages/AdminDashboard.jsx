import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import StatsCards from "../components/StatsCards";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") window.location.href = "/login";

    setUsers(JSON.parse(localStorage.getItem("users")) || []);
    setProducts(JSON.parse(localStorage.getItem("products")) || []);
    setTransactions(JSON.parse(localStorage.getItem("transactions")) || []);
  }, []);

  const stats = [
    { title: "Total Users", value: users.length },
    { title: "Total Products", value: products.length },
    { title: "Paid Transactions", value: transactions.filter(t => t.status === "Payé").length },
  ];

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="ml-64 w-full p-10">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <StatsCards stats={stats} />
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Bienvenue Admin 👋</h2>
          <p>Gérez les produits, utilisateurs, transactions et statistiques ici.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

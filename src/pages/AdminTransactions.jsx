import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);
  }, []);

  const markPaid = (index) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index].status = "Payé";
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  };

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="ml-64 p-10 w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Transactions</h1>
        <table className="min-w-full border shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr key={index} className={txn.status !== "Payé" ? "bg-yellow-50" : ""}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{txn.user}</td>
                <td className="border p-2">{txn.amount}</td>
                <td className="border p-2">{txn.status}</td>
                <td className="border p-2">
                  {txn.status !== "Payé" && (
                    <button
                      onClick={() => markPaid(index)}
                      className="px-3 py-1 rounded bg-green-500 text-white"
                    >
                      Marquer Payé
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;

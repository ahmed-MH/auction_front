import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  const toggleBlock = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].blocked = !updatedUsers[index].blocked;
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="ml-64 p-10 w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
        <table className="min-w-full border shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className={user.blocked ? "bg-red-50" : ""}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">{user.blocked ? "Bloqué" : "Actif"}</td>
                <td className="border p-2">
                  <button
                    onClick={() => toggleBlock(index)}
                    className={`px-3 py-1 rounded ${
                      user.blocked ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {user.blocked ? "Débloquer" : "Bloquer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

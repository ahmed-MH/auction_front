import React, { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const toggleValidation = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index].validated = !updatedProducts[index].validated;
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="ml-64 p-10 w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
        <table className="min-w-full border shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className={!product.validated ? "bg-yellow-50" : ""}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.price}</td>
                <td className="border p-2">{product.validated ? "Validé" : "En attente"}</td>
                <td className="border p-2">
                  <button
                    onClick={() => toggleValidation(index)}
                    className={`px-3 py-1 rounded ${
                      product.validated ? "bg-gray-500 text-white" : "bg-green-500 text-white"
                    }`}
                  >
                    {product.validated ? "Retirer" : "Valider"}
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

export default AdminProducts;

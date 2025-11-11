import React, { useState } from "react";

const AddBid = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Bid Submitted ✅");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg p-8 border border-gray-300 w-full max-w-2xl">
        <h2 className="font-semibold text-gray-900 text-2xl mb-6">Add New Bid</h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Product Name */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Product Name</label>
            <input type="text" className="w-full px-4 py-3 border rounded-lg"/>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Category</label>
            <select className="w-full px-4 py-3 border rounded-lg bg-white">
              <option>Select category...</option>
              <option value="phones">Phones</option>
              <option value="laptops">Laptops</option>
              <option value="accessories">Accessories</option>
              <option value="clothes">Clothes</option>
              <option value="vehicles">Vehicles</option>
              <option value="food">Food</option>
            </select>
          </div>

          {/* Used / New */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Used / New</label>
            <input type="text" className="w-full px-4 py-3 border rounded-lg"/>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Product Price</label>
            <input type="number" className="w-full px-4 py-3 border rounded-lg"/>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Description</label>
            <textarea className="w-full px-4 py-3 border rounded-lg min-h-[120px] resize-none"></textarea>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label className="font-medium text-gray-900">Upload Image</label>
            <label className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center cursor-pointer hover:border-orange-500">
              <input type="file" className="hidden" />
              <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full mb-3">
                📁
              </div>
              <p className="text-gray-900 font-medium">
                Drop file here or <span className="text-orange-500 underline">browse</span>
              </p>
            </label>
          </div>

          {/* Terms */}
          <div className="flex gap-3">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
            />
            <label className="text-gray-900">Accept the terms</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg text-lg"
          >
            Submit Bid
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBid;

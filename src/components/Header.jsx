import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const isLoggedIn = localStorage.getItem("user");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      // Rediriger vers /products avec query param
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // reset input
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="flex w-full items-center gap-6 p-8 border-b border-[#d9d9d9] bg-white relative">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 bg-[#014152] py-2 px-6 flex justify-between items-center text-sm text-white z-50">
        <div className="flex space-x-4">
          <span>+216 12 345 789</span>
          <span>email@gmail.com</span>
          <span>1000 Sousse Tunisia</span>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <Link to="/auth" className="hover:text-orange-400">My Account</Link>
          ) : (
            <>
              <span className="text-orange-300">Welcome</span>
              <button onClick={handleLogout} className="hover:text-orange-400 font-semibold">Logout</button>
            </>
          )}
        </div>
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mt-6">
        <div className="relative w-[166px] h-[74px]">
          <div className="w-[51.48%] h-[94.63%] absolute top-0 left-0 bg-[url(https://c.animaapp.com/mgpaazvePRgFNy/img/840a3a1d-0dd5-49ec-a9fd-c19f96cbcd99-1-1.png)] bg-[100%_100%]" />
          <div className="w-[59.88%] h-[35.84%] absolute top-[29.73%] left-[40.36%] bg-[url(https://c.animaapp.com/mgpaazvePRgFNy/img/image-1-1.png)] bg-[100%_100%]" />
        </div>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 flex items-center gap-0 max-w-[754px] mt-10">
        <div className="relative flex items-center bg-[#ece6f0] rounded-l-[22px] border-r border-[#c9c9c9] h-[46px] px-4 min-w-[155px] cursor-pointer">
          <span className="font-medium text-black text-xl">Categories</span>
        </div>

        <div className="flex-1 relative flex items-center bg-[#ece6f0] h-[44px] px-4">
          <input
            type="text"
            placeholder="search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full border-0 bg-transparent font-medium text-[#757575] text-xl placeholder:text-[#757575] focus:outline-none"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#ff6b39] hover:bg-[#ff6b39]/90 rounded-r-[22px] h-[44px] px-6 font-bold text-white text-xl"
        >
          Search
        </button>
      </div>

      {/* Menu */}
      <div className="flex items-center gap-4 mt-10">
        <nav className="flex space-x-6">
          {["Home", "Categories", "Products"].map(item => (
            <Link
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
              className="text-[#014152] hover:text-orange-500 font-medium text-lg transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { Link } from "react-router-dom";

const categoriesData = [
  "Phones",
  "Laptops",
  "Accessories",
  "Clothes",
  "Vehicles",
  "Food",
];

const serviceData = [
  { label: "My Account", href: "/account" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Add Product", href: "/add-bid" },
  { label: "Categories", href: "/" },
  { label: "Contact", href: "/contact" },
];

const aboutUsData = [
  "1000 Sousse, Tunisia",
  "contact@gmail.com",
  "+216 12 345 678",
];

export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-300 py-8 px-8 ">
      <div className="flex flex-wrap gap-8 max-w-[1440px] mx-auto">

        {/* Logo + Social */}
        <div className="flex flex-col gap-6 w-[235px]">
          <div className="relative w-[235px] h-[101px]">
            <div className="absolute w-[51.48%] h-[98.15%] top-0 left-0 bg-[url(https://c.animaapp.com/mgpaazvePRgFNy/img/840a3a1d-0dd5-49ec-a9fd-c19f96cbcd99-1.png)] bg-cover" />
            <div className="absolute w-[59.88%] h-[37.18%] top-[21.78%] left-[40.36%] bg-[url(https://c.animaapp.com/mgpaazvePRgFNy/img/image-1.png)] bg-cover" />
          </div>

          <img
            className="w-36 h-6"
            alt="Social media links"
            src="https://c.animaapp.com/mgpaazvePRgFNy/img/button-list.svg"
          />
        </div>
        <nav className="flex flex-col w-[262px] gap-3"></nav>

        {/* Categories */}
        <nav className="flex flex-col w-[262px] gap-3">
          <h3 className="font-semibold text-gray-900 text-lg pb-2">Categories</h3>
          <ul className="flex flex-col gap-2">
            {categoriesData.map((label, idx) => (
              <li key={idx}>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-orange-500 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Service */}
        <nav className="flex flex-col w-[262px] gap-3">
          <h3 className="font-semibold text-gray-900 text-lg pb-2">Service</h3>
          <ul className="flex flex-col gap-2">
            {serviceData.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.href}
                  className="text-gray-700 hover:text-orange-500 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* About Us */}
        <address className="flex flex-col w-[262px] gap-3 not-italic">
          <h3 className="font-semibold text-gray-900 text-lg pb-2">About Us</h3>
          <ul className="flex flex-col gap-2">
            {aboutUsData.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        </address>

      </div>
    </footer>
  );
};
export default Footer;
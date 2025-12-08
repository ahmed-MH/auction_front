import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Send, MapPin, Phone, Mail } from "lucide-react";

const serviceData = [
  { label: "My Account", href: "/account" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Add Product", href: "/add-bid" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-[#014152] text-white pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">

          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              {/* Logo - Assuming we use the same logo but maybe need a white version or filter */}
              <img
                src="/logoDetail.png"
                alt="TuniBid Logo"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              The best place to buy and sell products through safe and exciting auctions. Join us today and start winning!
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF6B39] transition-colors">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF6B39] transition-colors">
                <Twitter className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF6B39] transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF6B39] transition-colors">
                <Linkedin className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>



          {/* Quick Links - Service */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-[#FF6B39] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {serviceData.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.href}
                    className="text-gray-300 hover:text-[#FF6B39] hover:pl-2 transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-[#FF6B39] rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-[#FF6B39] mt-1 shrink-0" />
                <span>1000 Sousse, Tunisia<br />Sahloul 4</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-[#FF6B39] shrink-0" />
                <span>+216 12 345 678</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-[#FF6B39] shrink-0" />
                <span>contact@tunibid.com</span>
              </li>
            </ul>

            {/* Newsletter Mini */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-3">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 w-full text-sm focus:outline-none focus:border-[#FF6B39] text-white"
                />
                <button className="bg-[#FF6B39] hover:bg-[#ff855e] px-4 py-2 rounded-r-lg text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TuniBid. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
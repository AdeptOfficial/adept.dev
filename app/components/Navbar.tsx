"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const tabs = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for admin flag
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <nav className="bg-[#1a1a1a] text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-center items-center relative">
        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex space-x-10 items-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="hover:text-blue-500 transition-all font-medium"
            >
              {tab.label}
            </Link>
          ))}

          {isAdmin && (
            <button
              onClick={handleLogout}
              className="ml-4 text-red-400 hover:text-red-500 transition-all font-medium"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-xl absolute right-6"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav - Full Width Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2 text-center">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setMenuOpen(false)}
              className="block hover:text-blue-500"
            >
              {tab.label}
            </Link>
          ))}

          {isAdmin && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block text-red-400 hover:text-red-500 w-full mt-2"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, MapPin, Menu, X, Coffee } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Archive Mode", href: "/game/archive" },
    { name: "Daily Game", href: "/game/daily" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass w-full border-b border-white/10 px-4 py-3 sm:px-8 grid grid-cols-2 md:grid-cols-3 items-center shadow-lg">
      {/* Brand Logo */}
      <div className="flex justify-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-blue-600 to-orange-500 p-2 rounded-xl text-white shadow-md transform group-hover:scale-105 transition-transform duration-200">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-orange-500 dark:from-blue-400 dark:to-orange-400 bg-clip-text text-transparent">
            UFGuessr
          </span>
        </Link>
      </div>

      {/* Desktop Links - Perfectly Centered */}
      <div className="hidden md:flex items-center justify-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 relative py-1 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Theme Toggler (Desktop) & Mobile Actions (Mobile) */}
      <div className="flex justify-end items-center gap-2.5">
        {/* Desktop Buy Me A Coffee */}
        <div className="hidden md:block">
          <a
            href="https://www.paypal.com/paypalme/samuelmorsics"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-yellow-400 flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm"
            aria-label="Buy Me A Coffee"
          >
            <Coffee className="h-4 w-4 text-amber-500 dark:text-yellow-400" />
            <span>Buy Me a Coffee</span>
          </a>
        </div>

        {/* Desktop Theme Toggler */}
        <div className="hidden md:block">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-yellow-400"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Buy Me A Coffee */}
          <a
            href="https://www.paypal.com/paypalme/samuelmorsics"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg glass text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-yellow-400 flex items-center gap-1.5 text-xs font-bold"
            aria-label="Buy Me A Coffee"
          >
            <Coffee className="h-3.5 w-3.5 text-amber-500 dark:text-yellow-400" />
            <span className="hidden xs:inline sm:inline">Buy Me a Coffee</span>
          </a>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg glass text-gray-600 dark:text-gray-300"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg glass text-gray-600 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0b1329] border-b border-gray-200 dark:border-white/10 shadow-2xl flex flex-col p-4 gap-3 md:hidden z-50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold p-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <a
            href="https://www.paypal.com/paypalme/samuelmorsics"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold p-2.5 rounded-xl text-amber-600 dark:text-yellow-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
          >
            <Coffee className="h-4 w-4" />
            <span>Buy Me a Coffee</span>
          </a>
        </div>
      )}
    </nav>
  );
}

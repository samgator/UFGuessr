"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, MapPin, Menu, X, Coffee, Settings, Zap, ZapOff, Check, Sliders, Github, Linkedin } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize theme & reduced motion from localStorage or system preference
  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Reduced motion initialization
    const savedMotion = localStorage.getItem("reduced_motion");
    const systemPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initialMotion = savedMotion !== null ? savedMotion === "true" : systemPrefersReduced;

    setReducedMotion(initialMotion);
    if (initialMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMotionChange = (isReduced: boolean) => {
    setReducedMotion(isReduced);
    localStorage.setItem("reduced_motion", isReduced ? "true" : "false");

    if (isReduced) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Archive Mode", href: "/game/archive" },
    { name: "Daily Game", href: "/game/daily" },
  ];

  return (
    <>
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

        {/* Header Action Buttons (Desktop & Mobile) */}
        <div className="flex justify-end items-center gap-1.5 sm:gap-2">
          {/* GitHub & LinkedIn Links */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <a
              href="https://github.com/samgator"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-white/10 shadow-sm"
              aria-label="GitHub Repository"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/samuelmorsics"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-white/10 shadow-sm"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-blue-500" />
            </a>
          </div>

          {/* Desktop Buy Me A Coffee */}
          <div className="hidden md:block">
            <a
              href="https://www.paypal.com/paypalme/samuelmorsics"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-amber-700 dark:hover:text-yellow-400 flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm"
              aria-label="Buy Me A Coffee"
            >
              <Coffee className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
              <span>Buy Me a Coffee</span>
            </a>
          </div>

          {/* Desktop Settings Button */}
          <div className="hidden md:block">
            <button
              onClick={() => setSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm cursor-pointer"
              aria-label="Open Settings"
            >
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Settings</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg glass text-gray-700 dark:text-gray-300 hover:text-blue-600"
              aria-label="Open Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg glass text-gray-700 dark:text-gray-300"
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
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSettingsOpen(true);
              }}
              className="text-sm font-semibold p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2 text-left"
            >
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Settings & Preferences</span>
            </button>
            <a
              href="https://www.paypal.com/paypalme/samuelmorsics"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold p-2.5 rounded-xl text-amber-800 dark:text-yellow-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
            >
              <Coffee className="h-4 w-4" />
              <span>Buy Me a Coffee</span>
            </a>

            {/* Mobile Social Links */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
              <a
                href="https://github.com/samgator"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold p-2.5 rounded-xl glass text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 border border-white/10"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/samuelmorsics"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold p-2.5 rounded-xl glass text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 border border-white/10"
              >
                <Linkedin className="h-4 w-4 text-blue-500" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-400 border border-blue-700 dark:border-blue-500/30 shadow-md">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">App Preferences</h2>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Customize theme and performance</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                aria-label="Close Settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-6">
              
              {/* Section 1: Appearance Theme */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Appearance Theme
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed -mt-1 font-medium">
                  Select your preferred visual interface color mode.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border-2 transition-all cursor-pointer shadow-sm ${
                      theme === "light"
                        ? "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Sun className={`h-4 w-4 ${theme === "light" ? "text-amber-300" : "text-amber-600"}`} />
                    <span>Light Mode</span>
                    {theme === "light" && <Check className="h-4 w-4 ml-auto stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border-2 transition-all cursor-pointer shadow-sm ${
                      theme === "dark"
                        ? "bg-blue-600 text-white border-blue-700 dark:bg-blue-600 dark:border-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Moon className={`h-4 w-4 ${theme === "dark" ? "text-blue-200" : "text-blue-600"}`} />
                    <span>Dark Mode</span>
                    {theme === "dark" && <Check className="h-4 w-4 ml-auto stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Section 2: Motion & Performance */}
              <div className="flex flex-col gap-2.5 border-t-2 border-slate-200 dark:border-slate-800 pt-5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  Motion & Performance
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed -mt-1 font-medium">
                  Reduce animations and visual transitions for lower latency on budget devices or accessibility needs.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => handleMotionChange(false)}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border-2 transition-all cursor-pointer shadow-sm ${
                      !reducedMotion
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Zap className={`h-4 w-4 ${!reducedMotion ? "text-amber-300" : "text-amber-600"}`} />
                    <span>Full Motion</span>
                    {!reducedMotion && <Check className="h-4 w-4 ml-auto stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMotionChange(true)}
                    className={`py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black border-2 transition-all cursor-pointer shadow-sm ${
                      reducedMotion
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <ZapOff className={`h-4 w-4 ${reducedMotion ? "text-orange-200" : "text-orange-600"}`} />
                    <span>Reduce Motion</span>
                    {reducedMotion && <Check className="h-4 w-4 ml-auto stroke-[3]" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

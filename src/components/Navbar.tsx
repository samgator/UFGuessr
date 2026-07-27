"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, MapPin, Menu, X, Coffee, Settings, Zap, ZapOff, Check, Sliders, Github, ExternalLink } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [coffeeOpen, setCoffeeOpen] = useState<boolean>(false);
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

        {/* Header Action Buttons */}
        <div className="flex justify-end items-center gap-1.5 sm:gap-2">
          {/* Desktop Buy Me A Coffee */}
          <div className="hidden md:block">
            <button
              onClick={() => setCoffeeOpen(true)}
              className="px-3.5 py-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-amber-700 dark:hover:text-yellow-400 flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm cursor-pointer"
              aria-label="Buy Me A Coffee"
            >
              <Coffee className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
              <span>Buy Me a Coffee</span>
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 text-xs font-bold border border-white/10 shadow-sm cursor-pointer"
            aria-label="Open Settings"
          >
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Three-line Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-white/10 shadow-sm cursor-pointer"
            aria-label="Toggle Menu"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 md:left-auto md:right-8 md:w-80 bg-white dark:bg-[#0b1329] border-b md:border border-gray-200 dark:border-white/10 md:rounded-2xl shadow-2xl flex flex-col p-4 gap-3 z-50">
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCoffeeOpen(true);
              }}
              className="text-sm font-semibold p-2.5 rounded-xl text-amber-800 dark:text-yellow-400 bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-left cursor-pointer w-full"
            >
              <Coffee className="h-4 w-4" />
              <span>Buy Me a Coffee</span>
            </button>

            {/* Social Links */}
            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
              <a
                href="https://github.com/samgator"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold p-2.5 rounded-xl glass text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 border border-white/10 w-full"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
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

      {/* Buy Me A Coffee Modal */}
      {coffeeOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-yellow-400 border border-amber-500/30 shadow-md">
                  <Coffee className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Buy Me a Coffee</h2>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Choose your preferred payment method</p>
                </div>
              </div>
              <button
                onClick={() => setCoffeeOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Payment Options */}
            <div className="flex flex-col gap-3">
              {/* PayPal */}
              <a
                href="https://www.paypal.com/paypalme/samuelmorsics"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-500 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.761.761 0 0 1 .753-.642h6.702c2.618 0 4.64.673 5.484 2.193.76 1.365.626 3.237-.348 4.79-.98 1.564-2.73 2.502-4.912 2.502H9.805a.64.64 0 0 0-.632.541l-.974 6.17-.123.774a.643.643 0 0 1-.63.542h-.37z" />
                      <path d="M8.88 13.916l.872-5.526a.761.761 0 0 1 .752-.642h4.57c1.78 0 3.16.458 3.738 1.493.52.933.427 2.213-.238 3.275-.67 1.069-1.865 1.71-3.357 1.71H10.14a.64.64 0 0 0-.632.541l-.628 3.978a.641.641 0 0 1-.63.542H6.55a.48.48 0 0 1-.474-.555l1.082-6.852a.76.76 0 0 1 .752-.642h.97z" opacity="0.8" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      PayPal
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      paypal.me/samuelmorsics
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </a>

              {/* Cash App */}
              <a
                href="https://cash.app/$samgator"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/40 border-2 border-slate-200 hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-500 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#00D632] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                    $
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Cash App
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      $samgator
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              </a>

              {/* Venmo */}
              <a
                href="https://account.venmo.com/u/sammorsics"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-sky-950/40 border-2 border-slate-200 hover:border-sky-500 dark:border-slate-700 dark:hover:border-sky-500 transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#008CFF] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                    v
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      Venmo
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      @sammorsics
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
              </a>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCoffeeOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

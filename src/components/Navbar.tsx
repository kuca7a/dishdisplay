"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid"; // Import icons from Heroicons

const Navbar = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    // Persist dark mode preference in localStorage
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  return (
    <nav className="bg-[#F0EAD6] dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-['Poller_One'] text-black dark:text-white"
          >
            Dish Display
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/about"
                className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Services
              </Link>
              <Link
                href="/team"
                className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Our Team
              </Link>
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-black dark:text-white px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-yellow-500" /> // Sun icon for light mode
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-300" /> // Moon icon for dark mode
            )}
          </button>

          {/* Auth Button */}
          <div className="hidden md:block">
            {!isAuthenticated ? (
              <button
                onClick={() => loginWithRedirect()}
                className="text-black dark:text-white px-6 py-2 rounded-sm font-['Fjalla_One'] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hover:cursor-pointer"
              >
                Log In
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-300 font-['Fjalla_One']">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className="text-black dark:text-white px-6 py-2 rounded-sm font-['Fjalla_One'] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black dark:text-white relative w-6 h-6"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 flex flex-col justify-center">
              <span
                className={`block w-6 h-0.5 bg-black dark:bg-white transform transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-black dark:bg-white mt-1.5 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-black dark:bg-white mt-1.5 transform transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-4 py-4">
            <Link
              href="/about"
              className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/services"
              className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/team"
              className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Team
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  loginWithRedirect();
                  setIsMenuOpen(false);
                }}
                className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-left"
              >
                Log In
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <span className="text-gray-700 dark:text-gray-300 font-['Fjalla_One']">
                  Welcome, {user?.name}
                </span>
                <button
                  onClick={() => {
                    logout({ returnTo: window.location.origin });
                    setIsMenuOpen(false);
                  }}
                  className="text-black dark:text-white font-['Fjalla_One'] hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-left"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

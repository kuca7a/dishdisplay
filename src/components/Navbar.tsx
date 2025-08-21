"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useState } from "react";
import { CircleUser } from "lucide-react";
import { Notable } from "next/font/google";
import { useUserType } from "@/hooks/use-user-type";

const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Navbar = () => {
  const { isAuthenticated, user } = useAuth0();
  const { userType } = useUserType();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Determine the profile link based on user type
  const getProfileLink = () => {
    if (userType === 'restaurant_owner') return '/profile';
    if (userType === 'diner') return '/diner';
    return '/profile'; // fallback
  };

  return (
    <nav className="bg-[#ffffff] shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`text-2xl font-semibold text-black ${notable.className}`}
          >
            DISH DISPLAY
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/about"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/licensing"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Licensing
              </Link>
              <Link
                href="/terms"
                className="text-black font-medium hover:text-gray-700 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>

          {/* Auth Button */}
          <div className="hidden md:block">
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="px-6 py-2 rounded-sm font-medium text-white bg-[#5F7161] hover:bg-[#4C5B4F] transition-colors hover:cursor-pointer"
              >
                Log In
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Welcome, {user?.name}
                </span>
                <a
                  href={getProfileLink()}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:text-[#5F7161] transition-colors"
                  title="Profile"
                >
                  <CircleUser />
                </a>
                {/* Log Out button removed */}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-black relative w-6 h-6"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 flex flex-col justify-center">
              <span
                className={`block w-6 h-0.5 bg-black transform transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-black mt-1.5 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-black mt-1.5 transform transition-all duration-300 ${
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
            {isAuthenticated && (
              <Link
                href={getProfileLink()}
                className="text-black font-medium hover:text-[#5F7161] transition-colors"
                onClick={() => setIsMenuOpen(false)}
                title="Profile"
              >
                Profile
              </Link>
            )}
            <Link
              href="/about"
              className="text-black font-medium hover:text-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-black font-medium hover:text-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-black font-medium hover:text-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy
            </Link>
            <Link
              href="/licensing"
              className="text-black font-medium hover:text-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Licensing
            </Link>
            <Link
              href="/terms"
              className="text-black font-medium hover:text-gray-700 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Terms
            </Link>
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="text-black font-medium hover:text-gray-700 transition-colors text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

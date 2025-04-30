"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const DashboardPage = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  if (!isAuthenticated) {
    return <p>Redirecting...</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Dashboard
          </h2>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Overview
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Profile
              </a>
            </li>
            <li>
              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
              >
                Log Out
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome, {user?.name}!
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          This is your dashboard. Use the sidebar to navigate through different
          sections.
        </p>
        {/* Add more content here */}
      </main>
    </div>
  );
};

export default DashboardPage;

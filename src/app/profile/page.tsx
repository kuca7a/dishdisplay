"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fjalla_One } from "next/font/google";
import Link from "next/link";

const fjallaOne = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 18) greeting = "Good afternoon";
  else if (hour >= 18 || hour < 4) greeting = "Good evening";
  return `${greeting}${name ? ", " + name.split(" ")[0] : ""}`;
}

const TABS = [
  { key: "profile", label: "🔧 Profile Management" },
  { key: "menu", label: "📸 Menu Management" },
  { key: "settings", label: "⚙️ Settings" },
  { key: "promote", label: "📣 Promote / Share" },
];

export default function ProfilePage() {
  const { isAuthenticated, user, isLoading, logout } = useAuth0();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Placeholder for onboarding checklist
  const menuItemsAdded = 3;
  const menuItemsGoal = 5;

  return (
    <div className={`min-h-screen bg-gray-50 flex ${fjallaOne.className}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-6">
        <div className="mb-10">
          <Link
            href="/"
            className="text-2xl tracking-tight text-black hover:underline"
          >
            <h1 className="font-['Notable']">Dish Display</h1>
          </Link>
        </div>
        <nav className="flex flex-col gap-2 relative">
          {TABS.map((tab, idx) => (
            <div key={tab.key} className="relative flex items-center">
              {activeTab === tab.key && (
                <span
                  className="absolute -left-3 h-8 w-1.5 bg-[#5F7161] rounded-full"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                />
              )}
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`pl-6 pr-4 py-2 rounded-lg text-left transition-colors w-full bg-transparent border-none outline-none focus:ring-0 ${
                  activeTab === tab.key
                    ? "text-black font-medium"
                    : "text-gray-600"
                } hover:bg-gray-100`}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 pt-10">
          {/* User Info Card */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-2 border border-gray-100">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || "Profile"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5F7161] flex items-center justify-center text-white text-xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-black truncate">
                {user?.name || "User"}
              </div>
              <div className="text-gray-500 text-sm truncate">
                {user?.email}
              </div>
            </div>
            {/* Dropdown arrow placeholder */}
            <span className="text-gray-400 text-lg">&#9662;</span>
          </div>
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="w-full px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors"
          >
            Log Out
          </button>
          <div className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Dish Display
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Welcome/Header Section */}
        <section className="flex items-center gap-6 mb-10">
          {/* Profile Photo/Logo removed */}
          <div>
            <div className="text-2xl font-bold text-[#5F7161] mb-1">
              {getGreeting(user?.name)}
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {user?.name || "Restaurant Name"}
            </div>
            {/* Onboarding checklist */}
            <div className="mt-2 text-sm text-gray-500">
              {menuItemsAdded}/{menuItemsGoal} menu items added
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <div className="bg-white rounded-xl shadow p-8 max-w-3xl">
          {activeTab === "profile" && (
            <form className="space-y-8">
              <div>
                <label className="block font-semibold mb-1" htmlFor="orgName">
                  Restaurant Name
                </label>
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  placeholder="Your restaurant name"
                />
                <p className="text-gray-500 text-sm mt-1">
                  This will be displayed on your public profile.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="orgBio">
                  Restaurant Bio
                </label>
                <textarea
                  id="orgBio"
                  name="orgBio"
                  rows={3}
                  maxLength={240}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  placeholder="Tell your story (max 240 characters)"
                />
                <p className="text-gray-500 text-sm mt-1">
                  This will be displayed on your public profile. Maximum 240
                  characters.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1" htmlFor="orgEmail">
                  Restaurant Email
                </label>
                <input
                  id="orgEmail"
                  name="orgEmail"
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  placeholder="info@example.com"
                />
                <div className="flex items-center mt-2">
                  <input
                    id="showEmail"
                    name="showEmail"
                    type="checkbox"
                    className="mr-2 accent-[#5F7161]"
                  />
                  <label htmlFor="showEmail" className="text-gray-700 text-sm">
                    Show email on public profile
                  </label>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  This is how customers can contact you for support.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  placeholder="Street address"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    name="city"
                    className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="state"
                    className="w-1/4 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    name="postal"
                    className="w-1/4 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                    placeholder="Postal code"
                  />
                </div>
                <select
                  name="country"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161] mb-2"
                >
                  <option value="">Select country</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="US">🇺🇸 United States</option>
                  {/* Add more countries as needed */}
                </select>
                <p className="text-gray-500 text-sm mt-1">
                  This is where your restaurant is registered.
                </p>
              </div>
              <div>
                <label className="block font-semibold mb-1">Currency</label>
                <select
                  name="currency"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                >
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  {/* Add more currencies as needed */}
                </select>
                <p className="text-gray-500 text-sm mt-1">
                  The currency that your restaurant will be collecting.
                </p>
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="reset"
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900"
                >
                  Save changes
                </button>
              </div>
            </form>
          )}
          {activeTab === "menu" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
              {/* Mock menu items grouped by category */}
              {[
                {
                  category: "Starter",
                  items: [
                    {
                      id: 1,
                      name: "Bruschetta",
                      price: 8,
                      image: "/pasta.jpg",
                    },
                    {
                      id: 2,
                      name: "Garlic Bread",
                      price: 6,
                      image: "/burger.jpg",
                    },
                  ],
                },
                {
                  category: "Main",
                  items: [
                    {
                      id: 3,
                      name: "Margherita Pizza",
                      price: 14,
                      image: "/pizza.jpg",
                    },
                    {
                      id: 4,
                      name: "Ramen Bowl",
                      price: 16,
                      image: "/ramen.jpg",
                    },
                  ],
                },
                {
                  category: "Dessert",
                  items: [
                    { id: 5, name: "Tiramisu", price: 7, image: "/pasta.jpg" },
                  ],
                },
                {
                  category: "Drink",
                  items: [
                    { id: 6, name: "Lemonade", price: 4, image: "/burger.jpg" },
                  ],
                },
              ].map((section) => (
                <div key={section.category} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 text-[#5F7161]">
                    {section.category}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-black truncate">
                            {item.name}
                          </div>
                          <div className="text-gray-500 text-sm">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <button className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 mr-2">
                          Edit
                        </button>
                        <button className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button className="px-6 py-2 rounded-lg bg-[#5F7161] text-white font-semibold hover:bg-[#4C5B4F]">
                  + Add new menu item
                </button>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="text-gray-600">
                Account settings, password, billing, etc. (Coming soon)
              </div>
            </div>
          )}
          {activeTab === "promote" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Promote / Share</h2>
              <div className="text-gray-600">
                Public menu URL, QR code, review encouragement. (Coming soon)
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

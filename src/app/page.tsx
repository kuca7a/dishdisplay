"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { Avatar } from "@/components/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/sidebar";
import { SidebarLayout } from "@/components/sidebar-layout";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import {
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  TicketIcon,
} from "@heroicons/react/20/solid";

const DashboardPage = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } =
    useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  return (
    <div className="min-h-screen">
      <SpeedInsights />
      <Navbar />
      {/* Hero Section */}
      <section className="bg-[#F0EAD6] text-black py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-['Fjalla_One'] mb-6">
                Bring Your Menu to Life with Beautiful Photos
              </h1>
              <p className="text-xl mb-8 font-['Fjalla_One']">
                Help customers make confident dining decisions with high-quality
                photos of every dish on your menu.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-black text-white px-8 py-4 rounded-lg font-['Fjalla_One'] hover:cursor-pointer hover:bg-gray-800 transition-colors text-lg w-full"
              >
                Get Started Free
              </button>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <Carousel />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#F0EAD6] py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-['Fjalla_One'] text-center mb-16">
            How Dish Display Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Create Your Account
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Sign up for Dish Display and create your restaurant&apos;s
                    profile. Upload your menu items with high-quality photos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Get Your QR Code
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    We&apos;ll provide you with a unique QR code that links
                    directly to your restaurant&apos;s menu on Dish Display.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Print on Your Menu
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Add the QR code to your physical menu. Customers can scan it
                    to instantly view your dishes with photos.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-['Fjalla_One']">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-['Fjalla_One'] mb-2">
                    Delight Your Customers
                  </h3>
                  <p className="text-gray-600 font-['Fjalla_One']">
                    Watch as your customers make more confident ordering
                    decisions with visual menu items. Customers will be prompted
                    to review the restaurant on Google and Tripadvisor. Win win.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" aria-label="Search">
              <MagnifyingGlassIcon />
            </NavbarItem>
            <NavbarItem href="/inbox" aria-label="Inbox">
              <InboxIcon />
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src={user?.picture || ""} square />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="#">
                  <UserIcon />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <ShieldCheckIcon />
                  <DropdownLabel>Privacy policy</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <LightBulbIcon />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  <ArrowRightStartOnRectangleIcon />
                  <DropdownLabel>Sign out</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <SidebarItem href="/">
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/inbox">
                <InboxIcon />
                <SidebarLabel>Inbox</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/orders">
                <TicketIcon />
                <SidebarLabel>Orders</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSpacer />
          </SidebarBody>
          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={user?.picture || ""}
                    className="size-10"
                    square
                    alt=""
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {user?.name}
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {user?.email}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem href="#">
                  <UserIcon />
                  <DropdownLabel>My profile</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  onClick={() => logout({ returnTo: window.location.origin })}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['Fjalla_One'] mb-4">
                Customer Satisfaction
              </h3>
              <p className="text-gray-600 font-['Fjalla_One']">
                Reduce order confusion and improve dining experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-['Fjalla_One'] mb-8">
            Ready to Transform Your Menu?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-['Fjalla_One']">
            Join hundreds of restaurants already using our platform to showcase
            their dishes and delight their customers.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black px-8 py-4 rounded-lg font-['Fjalla_One'] hover:cursor-pointer hover:bg-gray-100 transition-colors text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h3 className="text-3xl font-['Notable'] mb-2">Dish Display</h3>
              <p className="text-gray-400 font-['Fjalla_One'] text-lg">
                Bringing menus to life
              </p>
            </div>
            <div className="flex space-x-8">
              <a
                href="/about"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                About
              </a>
              <a
                href="/contact"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Contact
              </a>
              <a
                href="/privacy"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                T&Cs
              </a>
              <a
                href="/licensing"
                className="hover:text-gray-300 font-['Fjalla_One'] text-lg"
              >
                Licensing
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>

  );
};

export default DashboardPage;

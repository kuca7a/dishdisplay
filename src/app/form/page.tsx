"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";


const page = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  const loadingVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 3.0,
        repeat: Infinity,
        ease: "easeInOut",
        staggerChildren: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen font-['Fjalla_One']">
        <span className="text-lg">Loading</span>
        <motion.div
          className="flex space-x-2 mt-2"
          variants={loadingVariants}
          animate="animate"
        >
          <motion.div className="w-2 h-2 bg-gray-500 rounded-full"></motion.div>
          <motion.div className="w-2 h-2 bg-gray-500 rounded-full"></motion.div>
          <motion.div className="w-2 h-2 bg-gray-500 rounded-full"></motion.div>
        </motion.div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen font-['Fjalla_One']">
        <h1 className="text-2xl font-['Notable'] mb-4">Dish Display</h1>
        <p className="mb-4">Please log in to view this form.</p>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="font-['Fjalla_One'] text-2xl mb-6">Add Menu Item</h1>
        <form className="font-['Fjalla_One'] space-y-4">
          <div>
            <label className="block mb-2">Dish Name:</label>
            <input
              type="text"
              className="border-2 border-solid border-gray-300 p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Description:</label>
            <textarea className="border-2 border-solid border-gray-300 p-2 w-full rounded-md"></textarea>
          </div>
          <div>
            <label className="block mb-2">Price:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border-2 border-solid border-gray-300 p-2 w-full rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Category:</label>
            <select className="border-2 border-solid border-gray-300 p-2 w-full rounded-md">
              <option value="appetizer">Appetizer</option>
              <option value="entree">Entree</option>
              <option value="side-dish">Side dish</option>
              <option value="salad">Salad</option>
              <option value="soup">Soup</option>
              <option value="sandwich">Sandwich</option>
              <option value="wrap">Wrap</option>
              <option value="beverages">Beverages</option>
              <option value="special">Special</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Cuisine Type:</label>
            <select className="border-2 border-solid border-gray-300 p-2 w-full rounded-md">
              <option value="italian">Italian</option>
              <option value="mexican">Mexican</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="french">French</option>
              <option value="indian">Indian</option>
              <option value="thai">Thai</option>
              <option value="special">Special</option>
            </select>
          </div>

          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default page;

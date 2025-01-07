import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore();

  const cards = [
    {
      title: "Create a Space",
      description: "Easily set up a dedicated space to collect testimonials from your clients.",
      icon: "🌍",
      color:"yellow",
      number:"400"
    },
    {
      title: "Wall of love",
      description: "Set up  wall of love to showcase testimonials on your website.",
      icon: "❤️",
      color:"pink",
      number:"400"
    },
    {
      title: "Create Space Using AI",
      description: "Use AI to automate the creation of testimonial spaces with just a website link.",
      icon: "⚛️",
      color:"purple",
      number:"500"
    },
    {
      title: "View Spaces",
      description: "Manage and view all your testimonial spaces in one place.",
      icon: "🖥️",
      color:"orange",
      number:"500"
    },
    {
      title: "Generate AI Summary",
      description: "Summarize your testimonials into impactful insights with AI.",
      icon: "🧠",
      color:"teal",
      number:"500"
    },
    {
      title: "Generate Case Study",
      description: "Transform your testimonials into professional case studies automatically.",
      icon: "📋",
      color:"violet",
      number:"500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white flex flex-col justify-between">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <motion.img 
          src="testiflow_white.png" 
          alt="TestiFlow Logo" 
          className="w-56 h-30" 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8 }}
        />
        {!isAuthenticated ? (
          <nav className="space-x-6">
            <Link
              to="/login"
              className="text-lg hover:text-teal-500 transition-transform transform hover:scale-110"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-lg hover:text-teal-500 transition-transform transform hover:scale-110"
            >
              Sign Up
            </Link>
          </nav>
        ) : (
          <nav className="space-x-6">
            <Link
              to="/dashboard"
              className="text-xl hover:text-teal-500 transition-transform transform hover:scale-110"
            >
              Dashboard
            </Link>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.h2
          className="text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-teal-400">TestiFlow</span> offers effortless Testimonials for Your Website
        </motion.h2>
        <motion.p
          className="text-lg text-gray-400 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Create your testimonial spaces, collect feedback from users, and showcase them beautifully. Empower your brand with real voices.
        </motion.p>
        <div className="space-x-4">
          {!isAuthenticated ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg text-lg shadow-lg"
              >
                Get Started
              </Link>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/dashboard"
                className="bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg text-lg shadow-lg"
              >
                Visit Dashboard
              </Link>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 px-4">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-7 rounded-lg shadow-lg hover:shadow-2xl transition-shadow text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className={`text-4xl text-${card.color}-${card.number} flex items-center gap-3 mb-4`}>
                {card.icon} <h3 className="text-2xl font-light">{card.title} :</h3>
              </div>
              <p className="text-gray-200 text-base">{card.description}</p>
            </motion.div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 p-2 text-center mt-10">
        <motion.p
          className="text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          © {new Date().getFullYear()} TestiFlow. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
};

export default LandingPage;

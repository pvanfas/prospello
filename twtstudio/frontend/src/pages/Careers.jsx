import React from "react";
import { motion } from "framer-motion";
import JobList from "../components/JobList";
import { useTheme } from "../context/ThemeContext";

const Careers = () => {
  const { theme } = useTheme();

  const heroVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900/80" : "bg-[#FDFCF6]"
      }`}
    >
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className={`bg-gradient-to-r ${
          theme === "dark"
            ? "from-gray-900/80 to-gray-900/80"
            : "from-red-500 to-red-400"
        } text-white py-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-24">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Discover exciting career opportunities and be part of our innovative
            journey. Find the perfect role that matches your passion and skills!
          </p>
          <a
            href="#jobs"
            className="inline-block bg-white text-red-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          >
            Explore Open Positions
          </a>
        </div>
      </motion.section>

      <section id="jobs">
        <JobList />
      </section>
    </div>
  );
};

export default Careers;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const OurSolutionSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { theme } = useTheme();

  const imageSets = [
    {
      main: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=600&fit=crop",
      image1:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
      image2:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
    },
    {
      main: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=600&fit=crop",
      image1:
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop",
      image2:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    },
    {
      main: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=600&fit=crop",
      image1:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
      image2:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageSets.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageSets.length) % imageSets.length
    );
  };

  const currentSet = imageSets[currentImageIndex];

  return (
    <div
      className={`px-4 py-8 lg:py-16 flex items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-[#FDFCF6]"
      }`}
    >
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="lg:col-span-4 text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className={`text-5xl lg:text-6xl font-light mb-8 leading-tight ${
                theme === "dark" ? "text-[#FEFEF8]" : "text-gray-900"
              }`}
            >
              Few Of Our Tribal Chiefs
            </h1>
            <p
              className={`text-lg leading-relaxed mb-12 max-w-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              We bring ideas to life by combining years of experience of our
              very talented team.
            </p>
            <button
              className={`border-2 px-8 py-3 font-medium tracking-wider text-sm transition-all duration-300 ${
                theme === "dark"
                  ? "border-red-500 text-[#FEFEF8] hover:bg-[#FEFEF8] hover:text-gray-900 rounded-full"
                  : "border-red-500 text-gray-900 hover:bg-red-600 hover:text-[#FEFEF8] rounded-full"
              }`}
            >
              LEARN MORE
            </button>
          </motion.div>

          {/* Images Section */}
          <div className="lg:col-span-8">
            <div className="flex gap-4 items-center justify-center h-full flex-wrap md:flex-nowrap">
              {[currentSet.main, currentSet.image1, currentSet.image2].map(
                (src, i) => (
                  <AnimatePresence mode="wait" key={src}>
                    <motion.div
                      key={`${i}-${currentImageIndex}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="flex-1 max-w-xs"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                        <img
                          src={src}
                          alt={`Slide ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )
              )}
            </div>

            {/* Navigation Section */}
            <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
              {/* Arrows */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={prevImage}
                  className="w-12 h-12 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center text-[#FEFEF8] transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </motion.button>
                <motion.button
                  onClick={nextImage}
                  className="w-12 h-12 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center text-[#FEFEF8] transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </motion.button>
              </div>

              {/* Dots */}
              <div className="flex space-x-2 mt-4 md:mt-0">
                {imageSets.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-red-400"
                        : theme === "dark"
                        ? "bg-gray-700"
                        : "bg-gray-300"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurSolutionSection;

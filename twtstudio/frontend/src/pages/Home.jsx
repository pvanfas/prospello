import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Intro from "../pages/Intro";
import CorporateSection from "../components/CorporateSection";
import HomePageSection from "../components/HomePageSection";
import OurSolutionSection from "../components/OurSolutionSection";
import FeatureCard from "../components/FeatureCard";
import AgencyCard from "../components/AgencyCard";
import bghero from "../assets/images/main_hero_bg.jpg";
import bgheroMobile from "../assets/images/hero-mobile-fallback.jpg"; // Add a mobile-optimized fallback image

const phrases = ["Digital Growth", "AI Consulting", "Startup Acceleration"];

const Home = () => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-[#111] text-gray-900 dark:text-white transition-colors duration-300 ">
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={isMobile ? bgheroMobile : bghero}
            alt="Background"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-black/70" : "bg-black/70"
            }`}
          />
        </div>

        <div className="relative z-10 h-full flex items-center px-6 sm:px-8 md:px-20 pt-24 mt-28">
          <div className="max-w-2xl w-full text-[#fefef9]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={index}
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {phrases[index]} <br />
                <span className="text-red-600">Solutions</span>
                <span className="text-[#FFFFFF]">.</span>
              </motion.h1>
            </AnimatePresence>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              We help startups and businesses scale through innovative
              technology and strategic consulting.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link to="/appointment" className="w-full sm:w-auto">
                <button className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-base sm:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </Link>

              <Link to="/about" className="w-full sm:w-auto">
                <button className="w-full bg-transparent border-2 border-white hover:border-red-400 hover:text-red-400 text-white px-6 py-3 rounded-lg text-base sm:text-lg font-medium transition-all duration-300">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {isMobile && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
              <motion.div
                className="w-1 h-2 bg-white rounded-full"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </div>
          </motion.div>
        )}
      </section>

      {/* Other Imports */}
      <Intro />
      <CorporateSection />
      <HomePageSection />
      <OurSolutionSection />
      <FeatureCard />
      <AgencyCard />
    </div>
  );
};

export default Home;

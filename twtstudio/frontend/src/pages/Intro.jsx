import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, BrainCircuit, Users } from "lucide-react";
import { useTheme } from "../context/ThemeContext"; // adjust if path differs

// AnimatedTextPhrases cycles through phrases for the heading
const phrases = [
  "Addicted to building",
  "Obsessed with business",
  "United by hustle.",
];

function AnimatedTextPhrases() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return <>{phrases[index]}</>;
}

const Intro = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardHover = { scale: 1.05, transition: { duration: 0.2 } };

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="show"
      className={`w-full py-16 px-6 md:px-12 transition-colors duration-300 ${
        isDark ? "bg-gray-700 text-[#FEFEF8]" : "bg-[#FDFCF6] text-gray-700"
      }`}
    >
      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl leading-snug">
          We are a tribe of workoholics <br />{" "}
          <span className="text-red-500">
            <AnimatedTextPhrases />
          </span>
        </h1>
      </div>

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          {
            icon: Lightbulb,
            title: "Innovative Ideas",
          },
          {
            icon: BrainCircuit,
            title: "Smart Strategy",
          },
          {
            icon: Users,
            title: "Talented Team",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              whileHover={cardHover}
              className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-colors duration-300 shadow-md ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-[#FDFCF6] border-gray-200"
              }`}
            >
              <Icon size={40} className="text-red-500" />
              <p className="text-center text-base font-medium">{item.title}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default Intro;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Handshake, Target } from "lucide-react";
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
          We are a tribe of workaholics <br />{" "}
          <span className="text-red-500">
            <AnimatedTextPhrases />
          </span>
        </h1>
      </div>

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            icon: BookOpen,
            title: "Venture Playbooks",
            description: "Strategic frameworks and actionable insights for startup success",
          },
          {
            icon: Handshake,
            title: "Founders syndicate",
            description: "Collaborative network of ambitious founders driving innovation",
          },
          {
            icon: Target,
            title: "Investment scrutiny",
            description: "Rigorous analysis and due diligence for informed decisions",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              whileHover={cardHover}
              className={`group relative overflow-hidden p-8 rounded-3xl border transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-500/50"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-red-500/50"
              }`}
            >
              {/* Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              
              {/* Icon container */}
              <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDark 
                  ? "bg-red-500/10 group-hover:bg-red-500/20" 
                  : "bg-red-50 group-hover:bg-red-100"
              }`}>
                <Icon size={32} className="text-red-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-3 group-hover:text-red-500 transition-colors duration-300">
                {item.title}
              </h3>
              <p className={`text-sm leading-relaxed ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {item.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};

export default Intro;

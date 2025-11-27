import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import corporateImg from "../assets/images/TheCorporate.jpg";

const faqs = [
  {
    title: "Venture Playbooks",
    content:
      "Access our battle-tested, proprietary methodologies and standardized frameworks for accelerated, repeatable success across all venture stages.",
  },
  {
    title: "Founders syndicate",
    content:
      "A highly curated, high-trust network for confidential peer support, strategic collaboration, and shared accountability among elite founders.",
  },
  {
    title: "Investment scrutiny",
    content:
      "Rigorous pre-funding validation sessions that simulate investor due diligence, ensuring your narrative and data are bulletproof for capital readiness.",
  },
];

const CorporateSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      className={`w-full py-20 px-4 sm:px-6 md:px-12 transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-[#FEFEF8]" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            The Tribe's Arsenal
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            We arm our founders with battle-tested playbooks, exclusive networks, and rigorous capital validation—the unfair advantage for relentless execution
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            className="order-2 md:order-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative group">
              <div className={`absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${
                isDark ? "bg-gradient-to-r from-red-500/20 to-orange-500/20" : "bg-gradient-to-r from-red-500/10 to-orange-500/10"
              }`} />
              <img
                src={corporateImg}
                alt="Corporate"
                className="relative w-full h-auto rounded-3xl object-cover shadow-2xl max-h-[400px]"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Accordion */}
          <div className="order-1 md:order-1 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isDark
                      ? isOpen 
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-red-500/50 shadow-lg shadow-red-500/10"
                        : "bg-gray-800/50 border-gray-700 hover:border-red-500/30"
                      : isOpen
                        ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-500/50 shadow-lg shadow-red-500/10"
                        : "bg-gray-50 border-gray-200 hover:border-red-500/30"
                  }`}
                >
                  <button
                    className="flex justify-between items-center w-full text-left p-6"
                    onClick={() => toggleItem(index)}
                  >
                    <span className={`text-lg font-bold transition-colors duration-300 ${
                      isOpen ? "text-red-500" : ""
                    }`}>
                      {faq.title}
                    </span>
                    <div className={`transform transition-all duration-300 ${
                      isOpen ? "rotate-45 text-red-500" : "text-gray-400"
                    }`}>
                      <Plus size={24} strokeWidth={2.5} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`px-6 pb-6 text-sm leading-relaxed ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          {faq.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CorporateSection;

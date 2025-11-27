import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    title: "Business",
    content:
      "We provide tailored consulting strategies to elevate your business operations and market position.",
  },
  {
    title: "Finances",
    content:
      "Our financial experts offer in-depth analysis and planning to ensure long-term profitability.",
  },
  {
    title: "Planning",
    content:
      "Strategic planning services that align your vision with achievable milestones and KPIs.",
  },
];

const CorporateSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      className={`w-full py-16 px-4 sm:px-6 md:px-12 transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-[#FEFEF8]" : "bg-[#FDFCF6] text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        {/* Left: Text and Accordion */}
        <div className="w-full md:w-1/2">
          <motion.h2
            className="text-3xl sm:text-4xl mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            The Corporate
          </motion.h2>

          <motion.p
            className="mb-8 text-base leading-relaxed text-gray-700 dark:text-gray-500"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We help startups and businesses scale through innovative technology
            and strategic consulting.
          </motion.p>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="border-b border-gray-300 dark:border-gray-600 pb-4"
                >
                  <button
                    className="flex justify-between items-center w-full text-left"
                    onClick={() => toggleItem(index)}
                  >
                    <span className="text-lg font-semibold">{faq.title}</span>
                    {isOpen ? <X size={20} /> : <Plus size={20} />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm mt-4 text-gray-700 dark:text-gray-400"
                      >
                        {faq.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.pexels.com/photos/3182829/pexels-photo-3182829.jpeg"
            alt="Corporate"
            className="w-full h-auto rounded-2xl object-contain max-h-[550px]"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CorporateSection;

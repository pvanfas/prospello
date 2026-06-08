import React from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Typography from "./Typography";
import whyUsImage from "../assets/images/whyus.jpg";

const AgencyCard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className={`w-full py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-[#FDFCF6]"
      }`}
    >
      <motion.div
        className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Left Content */}
        <motion.div
          className="w-full px-4 md:px-8 py-8 lg:py-12"
          variants={itemVariants}
        >
          <motion.div
            className={`inline-block px-4 py-2 rounded-full mb-6 ${
              isDark ? "bg-gray-800 text-red-500" : "bg-red-100 text-red-600"
            }`}
            variants={itemVariants}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Rocket className="w-4 h-4" /> Why Partner with the Tribe?
            </span>
          </motion.div>

          <motion.h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            variants={itemVariants}
          >
            <Typography variant="h2">
              We Replace Consulting with Co-Founder Execution
            </Typography>
          </motion.h2>

          <motion.p
            className={`text-lg md:text-xl mb-8 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
            variants={itemVariants}
          >
            <Typography variant="body">
            Standard agencies offer advice; the Tribe deploys action. We are a full-cycle, dedicated partner that invests proprietary Playbooks, operator support, and Capital Networks directly into your venture. We don't redefine consulting, we provide the strategic, execution-focused partnership required for relentless scale and market dominance.
            </Typography>
          </motion.p>
        </motion.div>

        {/* Right Image */}
        <motion.div
          className="w-full lg:h-[500px] relative"
          variants={itemVariants}
        >
          <div
            className={`absolute -inset-4 rounded-3xl ${
              isDark ? "bg-red-900/20" : "bg-red-200"
            } transform rotate-1 z-0`}
          ></div>
          <div
            className={`absolute -top-8 -left-6 w-32 h-32 rounded-full ${
              isDark ? "bg-yellow-500/20" : "bg-yellow-400/30"
            } z-0 hidden lg:block`}
          ></div>
          <img
            src={whyUsImage}
            alt="Business team collaborating"
            className="w-full h-auto lg:h-[500px] object-cover rounded-2xl shadow-xl relative z-10"
          />
          <div
            className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${
              isDark ? "bg-yellow-500/20" : "bg-yellow-400/30"
            } z-0 hidden lg:block`}
          ></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AgencyCard;

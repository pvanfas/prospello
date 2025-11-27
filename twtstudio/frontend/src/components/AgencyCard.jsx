import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Rocket,
  Headphones,
  BarChart,
  Users,
  Shield,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const AgencyCard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const features = [
    {
      icon: <Rocket className="w-5 h-5" />,
      title: "Personalized Investments",
      description:
        "Tailored financial strategies for your unique business needs",
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: "Fast Support",
      description: "24/7 dedicated support team ready to assist you",
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      title: "Data-Driven Insights",
      description: "Actionable analytics to guide your decisions",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Expert Team",
      description: "Industry specialists with proven track records",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Risk Management",
      description: "Comprehensive protection for your assets",
    },
  ];

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
              isDark
                ? "bg-gray-800 text-red-500"
                : "bg-red-100 text-red-600"
            }`}
            variants={itemVariants}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Rocket className="w-4 h-4" /> Why Choose Us
            </span>
          </motion.div>

          <motion.h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            variants={itemVariants}
          >
            Not Just Your Regular <br className="hidden sm:block" /> Business
            Agency
          </motion.h2>

          <motion.p
            className={`text-lg md:text-xl mb-8 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
            variants={itemVariants}
          >
            We redefine business consulting with innovative solutions tailored
            to your unique challenges and goals.
          </motion.p>

          <motion.div variants={itemVariants}>
            <p
              className={`text-sm font-semibold mb-4 tracking-wider uppercase ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              What We Offer
            </p>

            <motion.ul
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className={`p-4 rounded-lg ${
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-[#FDFCF6] hover:bg-red-100"
                  } transition-colors shadow-sm`}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full mt-1 ${
                        isDark
                          ? "bg-red-900/30 text-red-500"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
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
            src="https://images.pexels.com/photos/6476254/pexels-photo-6476254.jpeg"
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

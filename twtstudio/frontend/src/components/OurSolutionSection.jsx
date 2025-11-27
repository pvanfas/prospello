import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Typography from "./Typography";

// Import client images
import img360 from "../assets/images/clients/360.png";
import imgAifer from "../assets/images/clients/aifer.png";
import imgAtp from "../assets/images/clients/atp.png";
import imgDiabcare from "../assets/images/clients/diabcare.png";
import imgElance from "../assets/images/clients/elance.png";
import imgHosten from "../assets/images/clients/hosten.png";
import imgInterval from "../assets/images/clients/interval.png";
import imgLappino from "../assets/images/clients/lappino.png";
import imgLiwaspring from "../assets/images/clients/liwaspring.png";
import imgOppam from "../assets/images/clients/oppam.png";
import imgSouthbridge from "../assets/images/clients/southbridge.png";

const OurSolutionSection = () => {
  const { theme } = useTheme();

  const allClients = [
    img360,
    imgAifer,
    imgAtp,
    imgDiabcare,
    imgElance,
    imgHosten,
    imgInterval,
    imgLappino,
    imgLiwaspring,
    imgOppam,
    imgSouthbridge,
  ];

  return (
    <section
      className={`w-full py-20 px-4 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
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
          <Typography variant="h2" className="mb-4">
            Trusted by Industry Leaders
          </Typography>
          <p
            className={`text-base max-w-3xl mx-auto ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            We partner with innovative companies to drive growth and transformation
          </p>
        </motion.div>

        {/* Client Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {allClients.map((client, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.3 }
              }}
              className={`group relative flex items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-400/50"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-red-400/50"
              } hover:shadow-xl`}
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <img
                src={client}
                alt={`Client ${index + 1}`}
                className={`relative w-full h-auto object-contain transition-all duration-300 ${
                  theme === "dark" 
                    ? "filter brightness-90 group-hover:brightness-110" 
                    : "filter grayscale-0 group-hover:grayscale-0"
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurSolutionSection;

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sun,
  Moon,
  Rocket,
  LineChart,
  DollarSign,
  Users,
  Lightbulb,
  Globe,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import accelerationStudioImg from "../assets/images/AccelerationStudio.jpg";
import capitalStudioImg from "../assets/images/CapitalStudio.jpg";
import growthStudioImg from "../assets/images/GrowthStudio.jpg";
import ourStudiosImg from "../assets/images/OurStudios.jpg";

const Studio = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const studios = [
    {
      name: "Acceleration Studio",
      slug: "acceleration",
      description:
        "We nurture early-stage startups through structured founder cohorts, hands-on support, and ecosystem access.",
      image: accelerationStudioImg,
      icon: <Rocket className="w-8 h-8" />,
    },
    {
      name: "Capital Studio",
      slug: "capital",
      description:
        "We facilitate strategic investments, fundraising, and M&A advisory for high-growth ventures.",
      image: capitalStudioImg,
      icon: <DollarSign className="w-8 h-8" />,
    },
    {
      name: "Growth Studio",
      slug: "growth",
      description:
        "We offer deep consulting across Operations, Marketing, Sales, Finance,Technology, Legal, and top-tier CXO hiring to help startups scale faster and smarter.",
      image: growthStudioImg,
      icon: <LineChart className="w-8 h-8" />,
    },
  ];


  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900/80 text-white" : "bg-[#FDFCF6] text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className={`relative py-24 ${
          isDark
            ? "bg-gradient-to-r from-gray-900 to-gray-900 text-white"
            : "bg-gradient-to-r from-red-500 to-red-400 text-white"
        }`}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between relative z-10 mt-16 sm:mt-12">
          <div className="text-center md:text-left mb-12 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" /> Building the future
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Our <span className="text-yellow-300">Studios</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mb-8 leading-relaxed">
              Specialized hubs driving innovation, growth, and investment. Join
              us in shaping the future of business and technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="#studios"
                className={`inline-block font-semibold px-6 py-3 rounded-lg shadow-md transition-colors ${
                  isDark
                    ? "bg-gray-100 text-gray-900/80 hover:bg-white"
                    : "bg-[#FDFCF6] text-red-600 hover:bg-gray-100"
                }`}
              >
                Explore Studios
              </a>
              <Link
                to="/appointment"
                className={`inline-block font-semibold px-6 py-3 rounded-lg shadow-md transition-colors ${
                  isDark
                    ? "bg-transparent border border-white hover:bg-white/10"
                    : "bg-transparent border border-white hover:bg-white/10"
                }`}
              >
                Get in Touch
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-1/2 mt-12 md:mt-0"
          >
            <img
              src={ourStudiosImg}
              alt="Innovation illustration"
              className="w-full rounded-xl shadow-2xl border-4 border-white/20"
            />
          </motion.div>
        </div>
      </motion.section>


      {/* Studios Section */}
      <section id="studios" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Specialized Studios
            </h2>
            <p className="text-xl max-w-3xl mx-auto">
              Each studio is designed to address specific challenges and
              opportunities in the innovation lifecycle.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            {studios.map((studio, index) => (
              <motion.div
                key={studio.name}
                variants={sectionVariants}
                className={`flex flex-col ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center gap-8 rounded-xl shadow-2xl overflow-hidden ${
                  isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="w-full md:w-1/2 h-full">
                  <img
                    src={studio.image}
                    alt={`${studio.name} illustration`}
                    className="w-full h-full min-h-[400px] object-cover"
                  />
                </div>
                <div className="w-full md:w-1/2 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`p-3 rounded-lg ${
                        isDark
                          ? "bg-red-600/20 text-red-400"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {studio.icon}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {studio.name}
                    </h2>
                  </div>
                  <p
                    className={`mb-8 text-lg ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {studio.description}
                  </p>

                  <Link
                    to={`/studio/${studio.slug}`}
                    className={`inline-flex items-center font-semibold px-6 py-3 rounded-lg transition-colors ${
                      isDark
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    }`}
                  >
                    Learn More
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Vision?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're launching a startup, scaling your business, or
              seeking investment, our studios have the expertise to help you
              succeed.
            </p>
            <Link
              to="/appointment"
              className={`inline-flex items-center font-semibold px-8 py-4 rounded-lg text-lg shadow-lg transition-colors ${
                isDark
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Get Started Today
              <ArrowRight className="h-6 w-6 ml-3" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Studio;

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Rocket,
  LineChart,
  DollarSign,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Typography from "../components/Typography";
import accelerationStudioImg from "../assets/images/AccelerationStudio.jpg";
import capitalStudioImg from "../assets/images/CapitalStudio.jpg";
import growthStudioImg from "../assets/images/GrowthStudio.jpg";
import ourStudiosImg from "../assets/images/OurStudios.jpg";

const Studio = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        "We offer deep consulting across Operations, Marketing, Sales, Finance, Technology, Legal, and top-tier CXO hiring to help startups scale faster and smarter.",
      image: growthStudioImg,
      icon: <LineChart className="w-8 h-8" />,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[90vh]">
          {/* Left Content */}
          <div className={`flex items-center justify-center px-4 sm:px-6 lg:px-12 py-20 ${
            isDark ? "bg-gray-900" : "bg-gradient-to-br from-red-50 via-white to-orange-50"
          }`}>
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h2" className="mb-6">
                  Where Vision Meets{" "}
                  <span className="text-red-500">Execution</span>
                </Typography>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`text-lg md:text-xl mb-12 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  From early-stage acceleration to strategic capital and growth operations—we provide the infrastructure, expertise, and network to transform ambitious ideas into market-leading ventures.
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <a
                    href="#studios"
                    className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Explore Studios
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <Link
                    to="/appointment"
                    className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all duration-300 border-2 ${
                      isDark
                        ? "border-gray-700 hover:border-red-500 hover:bg-red-500/10"
                        : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                    }`}
                  >
                    Get in Touch
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-full min-h-[500px] lg:min-h-[90vh]"
          >
            <img
              src={ourStudiosImg}
              alt="Our Studios"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent lg:hidden" />
            
            {/* Decorative Elements */}
            <div className="absolute top-8 right-8 w-20 h-20 bg-red-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-16 left-8 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-1/4"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-red-500 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Studios Grid Section */}
      <section id="studios" className={`py-24 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="mb-4">
              Our Studios
            </Typography>
            <p className={`text-lg max-w-3xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Each studio is purpose-built to address specific stages of the venture journey, providing tailored support and expertise.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {studios.map((studio, index) => (
              <motion.div
                key={studio.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <Link to={`/studio/${studio.slug}`}>
                  <div
                    className={`h-full rounded-2xl overflow-hidden border transition-all duration-500 ${
                      isDark
                        ? "bg-gray-800 border-gray-700 hover:border-red-500"
                        : "bg-white border-gray-200 hover:border-red-500"
                    } hover:shadow-2xl`}
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={studio.image}
                        alt={studio.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Icon Badge */}
                      <div className="absolute top-6 left-6 p-4 rounded-xl bg-white/90 backdrop-blur-sm text-red-500 shadow-lg">
                        {studio.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className={`text-2xl font-bold mb-4 group-hover:text-red-500 transition-colors ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {studio.name}
                      </h3>
                      
                      <p className={`mb-6 leading-relaxed ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {studio.description}
                      </p>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-red-500 font-semibold group-hover:gap-4 transition-all">
                        Learn More
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
              <Target className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-semibold">Ready to Build?</span>
            </div>

            <Typography variant="h2" className="mb-6">
              Transform Your Vision Into Reality
            </Typography>

            <p className={`text-xl mb-10 max-w-3xl mx-auto ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              Join founders who are building the future. Whether you're just starting or ready to scale, our studios provide the expertise and support you need.
            </p>

            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Schedule a Consultation
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Studio;

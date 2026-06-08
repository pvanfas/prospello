import { motion } from "framer-motion";
import { TrendingUp, Settings, Zap, Wallet, FileCheck, Users, UserPlus, Network } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import Typography from "./Typography";

// Animation variants for card entry
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  }),
};

const FeatureCard = ({ icon, title, description, button, index }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ 
        scale: 1.03,
        y: -8,
        transition: { duration: 0.3 }
      }}
      className={`group relative rounded-3xl p-8 shadow-lg border-2 transition-all duration-500 ease-out overflow-hidden
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-900 text-[#FEFEF8] border-gray-700 hover:border-red-400/50"
            : "bg-gradient-to-br from-white to-gray-50 text-gray-700 border-gray-200 hover:border-red-400/50"
        }
        flex flex-col items-center min-h-[320px] hover:shadow-2xl`}
    >
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon container with background */}
      <div className={`relative mb-6 p-4 rounded-2xl transition-all duration-300
        ${theme === "dark" 
          ? "bg-gray-700/50 group-hover:bg-red-400/20" 
          : "bg-red-50 group-hover:bg-red-100"
        }`}>
        {icon}
      </div>
      
      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors duration-300">
          {title}
        </h3>
        <p className={`text-sm leading-relaxed flex-1
          ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {description}
        </p>
      </div>
      
      {button && (
        <div className="relative mt-6 w-full">
          {button}
        </div>
      )}
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

const Features = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <TrendingUp className="w-10 h-10 text-red-400" />,
      title: "Growth Strategy",
      description:
        "We design and execute aggressive GTM and revenue strategies to transform early traction into sustainable, repeatable market scaling.",
    },
    {
      icon: <Settings className="w-10 h-10 text-red-400" />,
      title: "Operational Efficiency",
      description:
        "Auditing and streamlining core business processes and technologies to maximize efficiency, reduce friction, and eliminate operational drag.",
    },
    {
      icon: <Zap className="w-10 h-10 text-red-400" />,
      title: "Planning & Execution",
      description:
        "Short-cycle, outcome-driven sprints that bridge the gap between strategic vision and operational deployment, ensuring rapid momentum.",
    },
    {
      icon: <Wallet className="w-10 h-10 text-red-400" />,
      title: "Wealth Management",
      description:
        "Implementing sophisticated financial design and strategic capital allocation models to maximize founder equity value and long-term financial health.",
    },
    {
      icon: <FileCheck className="w-10 h-10 text-red-400" />,
      title: "Investment Readiness",
      description: "Rigorous pre-funding validation sessions that bulletproof your data, narrative, and financial models for external investor due diligence.",
    },
    {
      icon: <Users className="w-10 h-10 text-red-400" />,
      title: "Team & Culture",
      description: "Curating the values, processes, and accountability frameworks necessary to evolve the team into a high-trust, high-velocity execution unit.",
    },
    {
      icon: <UserPlus className="w-10 h-10 text-red-400" />,
      title: "Leadership Hiring",
      description: "Strategic placement of mission-critical C-suite and foundational leaders who fit the operational culture and are prepared for the rigors of scale.",
    },
    {
      icon: <Network className="w-10 h-10 text-red-400" />,
      title: "Organizational Design",
      description: "Installing future-proof structures, roles, and reporting mechanisms to ensure the organization can sustain hyper-growth without chaos.",
    },
    {
      icon: null,
      title: "Ready to Build?",
      description: "Connect with the Architects to fuel your vision for hyper-scale.",
      button: (
        <Link to="/appointment">
          <button className="bg-red-400 text-[#FEFEF8] px-6 py-2 rounded-full hover:bg-red-500 transition">
            CONTACT US
          </button>
        </Link>
      ),
    },
  ];

  return (
    <section
      className={`py-20 px-4 ${
        theme === "dark" ? "bg-gray-900" : "bg-[#E8EBE3]"
      }`}
    >
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className={`text-sm font-semibold tracking-widest uppercase mb-3 ${
            theme === "dark" ? "text-[#FEFEF8]" : "text-gray-600"
          }`}
        >
          SERVICES
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-4xl md:text-5xl mb-4 ${
            theme === "dark" ? "text-[#FEFEF8]" : "text-gray-700"
          }`}
        >
          <Typography variant="h2">
          The Tribe's Integrated Services
          </Typography>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-md md:text-lg max-w-2xl mx-auto mb-12 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
Dedicated source for full-stack strategy, operator support, and capital readiness across the entire venture journey        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

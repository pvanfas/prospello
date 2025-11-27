import { motion } from "framer-motion";
import { Coins, Laptop, Folder, Scale, DollarSign } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

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
      whileHover={{ scale: 1.05 }}
      className={`rounded-2xl p-6 shadow-xl border transition-all duration-300 ease-in-out
        ${
          theme === "dark"
            ? "bg-gray-800 text-[#FEFEF8] border-gray-700"
            : "bg-[#E8EBE3] text-gray-700 border-gray-200"
        }
        flex flex-col items-center justify-between min-h-[280px]`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-center leading-relaxed opacity-80">
        {description}
      </p>
      {button && <div className="mt-6">{button}</div>}
    </motion.div>
  );
};

const Features = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Coins className="w-10 h-10 text-red-400" />,
      title: "Wealth Management",
      description:
        "Over 20 years of experience delivering excellence in financial growth.",
    },
    {
      icon: <Laptop className="w-10 h-10 text-red-400" />,
      title: "Business Consulting",
      description:
        "Strategic insights and digital transformation tailored to your business.",
    },
    {
      icon: <Folder className="w-10 h-10 text-red-400" />,
      title: "Creative Solutions",
      description:
        "Innovative strategies and branding to accelerate your impact.",
    },
    {
      icon: <Scale className="w-10 h-10 text-red-400" />,
      title: "Compliance & Legal",
      description:
        "Robust governance and legal expertise for sustainable growth.",
    },
    {
      icon: <DollarSign className="w-10 h-10 text-red-400" />,
      title: "Professional HR",
      description: "End-to-end HR management solutions for teams that thrive.",
    },
    {
      icon: null,
      title: "Ready to Get Started?",
      description: "Talk to our team today and elevate your business journey.",
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
          FEATURES
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
          We Have the Best <br /> Features for You
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
          Not just your regular business agency – experience transformation.
        </motion.p>

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

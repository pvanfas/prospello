import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import ideasToLifeImg from "../assets/images/ideastolife.jpg";
import Typography from "./Typography";

const HomePageSection = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={`w-full ${
        isDark ? "bg-gray-900" : "bg-[#EFF0E9]"
      } relative overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center px-4 py-16 md:py-24 gap-10">
        {/* Left Image */}
        <div className="w-full h-full">
          <img
            src={ideasToLifeImg}
            alt="Business meeting"
            className="w-full h-auto object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Right Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <Typography variant="h2" className="mb-4">
            From Conception to Capital <br className="hidden md:block" />
            We Build the Future.
          </Typography>

          <Typography variant="body" color="secondary" className="mb-6">
            We provide the strategic framework, operator support, and dedicated capital sourcing needed to accelerate ventures from early-stage concept to market dominance.
          </Typography>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              className={`px-6 py-2 rounded-full text-sm font-semibold border transition ${
                isDark
                  ? "border-red-500 text-white hover:bg-white hover:text-gray-900"
                  : "border-red-500 text-black hover:bg-red-600 hover:text-white"
              }`}
            >
              LEARN MORE
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                isDark
                  ? "bg-white text-gray-900 hover:bg-gray-200"
                  : "bg-black text-[#FEFEF8] hover:bg-gray-800"
              }`}
            >
              CONNECT NOW
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomePageSection;

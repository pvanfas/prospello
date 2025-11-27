import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

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
            src="https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg"
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
          <h2
            className={`text-3xl md:text-4xl mb-4 leading-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Not Just your Regular <br className="hidden md:block" />
            Business Agency
          </h2>

          <p
            className={`text-base md:text-lg mb-6 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            We bring ideas to life by combining years of experience of our very
            talented team.
          </p>

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

import { motion } from "framer-motion";
import {
  Rocket,
  Lightbulb,
  Handshake,
  Target,
  BarChart,
  Globe,
  Users,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Team from "../components/Team";

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme styles
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const cardBg = isDark ? "" : "bg-gray-50";
  const textColor = isDark ? "text-gray-200" : "text-gray-800";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 ">
          <img
            src="https://images.pexels.com/photos/7580827/pexels-photo-7580827.jpeg"
            alt="Corporate team working"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto sm:mt-0 mt-16"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`inline-block px-6 py-2 rounded-full ${
              isDark
                ? "bg-gray-900/80 text-red-400"
                : "bg-white/90 text-red-600"
            } mb-6 backdrop-blur-sm`}
          >
            <span className="flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Since 2015
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            We Help Companies Like <br className="hidden md:block" /> Yours
            Achieve <span className="text-red-400">Greatness</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8"
          >
            Combining innovation, expertise, and passion to drive your business
            forward
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="#story"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Our Story
            </a>
            <a
              href="#team"
              className="inline-block bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors  "
            >
              Meet Our Team
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section
        className={`py-16 ${
          isDark ? "bg-gray-800" : "bg-red-600"
        } text-white`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: "200+",
                label: "Clients Worldwide",
                icon: <Globe className="w-8 h-8 mx-auto mb-3" />,
              },
              {
                value: "8",
                label: "Years Experience",
                icon: <BarChart className="w-8 h-8 mx-auto mb-3" />,
              },
              {
                value: "95%",
                label: "Client Retention",
                icon: <Users className="w-8 h-8 mx-auto mb-3" />,
              },
              {
                value: "3-5x",
                label: "Average Growth",
                icon: <Rocket className="w-8 h-8 mx-auto mb-3" />,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6"
              >
                {stat.icon}
                <p className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base opacity-90">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className={`py-20 ${cardBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2
                  className={`text-3xl md:text-4xl font-bold mb-6 ${textColor}`}
                >
                  Our Journey
                </h2>
                <div className="space-y-5">
                  <p className={`text-lg ${secondaryText}`}>
                    Founded in 2015 by a team of growth hackers and developers,
                    ScaleUp began as a passion project to help startups navigate
                    the challenges of scaling.
                  </p>
                  <p className={`text-lg ${secondaryText}`}>
                    What started as a small consultancy has grown into a
                    full-service digital transformation partner, working with
                    companies across 15 countries to drive sustainable growth.
                  </p>
                  <p className={`text-lg ${secondaryText}`}>
                    Today, we combine cutting-edge technology with proven
                    methodologies to deliver exceptional results for businesses
                    at every stage of their journey.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 relative"
            >
              <div
                className={`rounded-2xl overflow-hidden shadow-2xl ${
                  isDark ? "ring-1 ring-gray-700" : "ring-1 ring-gray-200"
                }`}
              >
                <img
                  src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"
                  alt="Our team working"
                  className="w-full h-auto"
                />
              </div>
              <div
                className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl ${
                  isDark ? "bg-red-600" : "bg-red-500"
                } z-10 hidden md:block`}
              ></div>
              <div
                className={`absolute -top-6 -right-6 w-24 h-24 rounded-2xl ${
                  isDark ? "bg-yellow-500" : "bg-yellow-400"
                } z-10 hidden md:block`}
              ></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
              Our Core Values
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${secondaryText}`}>
              The principles that guide every decision we make and every
              relationship we build
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description:
                  "We embrace change and constantly seek better solutions to complex problems through creative thinking and experimentation.",
                icon: <Lightbulb className="w-8 h-8" />,
                color: "text-blue-500",
              },
              {
                title: "Integrity",
                description:
                  "We build trust through transparency, honesty, and accountability in all our relationships and business practices.",
                icon: <Handshake className="w-8 h-8" />,
                color: "text-red-500",
              },
              {
                title: "Impact",
                description:
                  "We focus on delivering measurable, meaningful results that drive real business value for our clients.",
                icon: <Target className="w-8 h-8" />,
                color: "text-red-500",
              },
              {
                title: "Collaboration",
                description:
                  "We believe the best solutions come from diverse perspectives working together toward common goals.",
                icon: <Users className="w-8 h-8" />,
                color: "text-purple-500",
              },
              {
                title: "Excellence",
                description:
                  "We pursue the highest standards in everything we do, continuously improving our work and ourselves.",
                icon: <Rocket className="w-8 h-8" />,
                color: "text-yellow-500",
              },
              {
                title: "Empathy",
                description:
                  "We listen deeply to understand our clients' unique challenges and design solutions that truly meet their needs.",
                icon: <Handshake className="w-8 h-8" />,
                color: "text-pink-500",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: Math.floor(index / 2) * 0.1,
                }}
                viewport={{ once: true }}
                className={`p-8 rounded-xl shadow-lg ${cardBg} hover:shadow-xl transition-shadow duration-300`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  } ${value.color}`}
                >
                  {value.icon}
                </div>
                <h3 className={`text-2xl font-semibold mb-3 ${textColor}`}>
                  {value.title}
                </h3>
                <p className={secondaryText}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={`py-20 ${cardBg}`}>
        <Team />
      </section>

      {/* CTA Section */}
      <section
        className={`py-20 ${
          isDark ? "bg-gray-900/80" : "bg-red-600"
        } text-white`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Grow Together?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Whether you're just starting out or looking to scale new heights,
              we have the expertise to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/appointment"
                className="inline-block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/services"
                className="inline-block bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

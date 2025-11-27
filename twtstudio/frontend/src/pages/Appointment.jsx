import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Appointment = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme styles
  const bgColor = isDark ? "bg-gray-900" : "bg-[#FDFCF6]";
  const cardBg = isDark ? "bg-gray-800/90" : "bg-white";
  const textColor = isDark ? "text-gray-200" : "text-gray-700";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputStyle = isDark
    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-red-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-500";

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Hero Section */}
      <section
        className={`relative py-24 md:py-32 overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-red-50 to-teal-50"
        }`}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`inline-block px-4 py-2 rounded-full ${
                isDark
                  ? "bg-gray-800 text-red-400"
                  : "bg-red-100 text-red-600"
              } mb-6`}
            >
              We'd love to hear from you
            </motion.span>
            <h1
              className={`text-4xl md:text-6xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Get in <span className="text-red-500">Touch</span>
            </h1>
            <p
              className={`text-xl md:text-2xl max-w-3xl mx-auto md:mx-0 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Have a project in mind or want to learn more about our services?
              Our team is ready to help you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="lg:col-span-1"
        >
          <div
            className={`p-8 rounded-xl shadow-lg ${cardBg} ${borderColor} border sticky top-8`}
          >
            <h2 className={`text-2xl font-bold mb-8 ${textColor}`}>
              Contact Information
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: "Email Us",
                  info: "hello@twtventurestudio.com",
                  icon: <Mail className="w-5 h-5" />,
                  description: "We'll respond within 24 hours",
                },
                {
                  title: "Call Us",
                  info: "+1 (555) 123-4567",
                  icon: <Phone className="w-5 h-5" />,
                  description: "Mon-Fri, 9am-5pm PST",
                },
                {
                  title: "Visit Us",
                  info: "123 Business Ave, San Francisco, CA 94107",
                  icon: <MapPin className="w-5 h-5" />,
                  description: "Schedule a visit in advance",
                },
                {
                  title: "Office Hours",
                  info: "Monday - Friday",
                  icon: <Clock className="w-5 h-5" />,
                  description: "9:00 AM - 5:00 PM PST",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      isDark
                        ? "bg-red-900/30 text-red-400"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`font-medium ${textColor}`}>{item.title}</h3>
                    <p
                      className={`font-semibold my-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.info}
                    </p>
                    <p className={`text-sm ${secondaryText}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="lg:col-span-2"
        >
          <div
            className={`p-8 md:p-10 rounded-xl shadow-lg ${cardBg} ${borderColor} border`}
          >
            <h2 className={`text-2xl font-bold mb-2 ${textColor}`}>
              Send us a message
            </h2>
            <p className={`mb-8 ${secondaryText}`}>
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className={`block mb-2 text-sm font-medium ${textColor}`}
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`w-full px-4 py-3 rounded-lg border ${inputStyle} focus:ring-2 focus:ring-red-500/50`}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className={`block mb-2 text-sm font-medium ${textColor}`}
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`w-full px-4 py-3 rounded-lg border ${inputStyle} focus:ring-2 focus:ring-red-500/50`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className={`block mb-2 text-sm font-medium ${textColor}`}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${inputStyle} focus:ring-2 focus:ring-red-500/50`}
                    placeholder="+91 xx xxx xxxxx"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className={`block mb-2 text-sm font-medium ${textColor}`}
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    className={`w-full px-4 py-3 rounded-lg border ${inputStyle} focus:ring-2 focus:ring-red-500/50`}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="support">Technical Support</option>
                    <option value="careers">Careers</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className={`block mb-2 text-sm font-medium ${textColor}`}
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="6"
                  className={`w-full px-4 py-3 rounded-lg border ${inputStyle} focus:ring-2 focus:ring-red-500/50`}
                  placeholder="Tell us about your project or inquiry..."
                  required
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  id="consent"
                  type="checkbox"
                  className={`w-4 h-4 rounded ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-red-500`}
                  required
                />
                <label
                  htmlFor="consent"
                  className={`ml-2 text-sm ${secondaryText}`}
                >
                  I agree to the privacy policy and terms of service
                </label>
              </div>

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg`}
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div
            className={`mt-8 p-6 rounded-lg ${
              isDark ? "bg-gray-800/50" : "bg-gray-50"
            } ${borderColor} border`}
          >
            <h3 className={`font-medium mb-3 ${textColor}`}>
              Need immediate assistance?
            </h3>
            <p className={`text-sm ${secondaryText}`}>
              For urgent matters, please call our support line at{" "}
              <span
                className={`font-semibold ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              >
                +1 (555) 789-0123
              </span>
              . Our average response time is under 2 hours during business days.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Map Section */}
      <section className={`py-12 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${textColor}`}
          >
            Find Our Office
          </h2>
          <div
            className={`rounded-xl overflow-hidden shadow-xl h-96 ${borderColor} border`}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.538442689271!2d-122.4199066846826!3d37.77492997975938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              className={`${isDark ? "grayscale-[50%] contrast-125" : ""}`}
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Appointment;
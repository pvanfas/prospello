// import { motion, useScroll, useTransform } from "framer-motion";
// import { useTheme } from "../context/ThemeContext";
// import { Mail, Clock, Rocket, Zap, BarChart } from "lucide-react";
// import { useState, useEffect } from "react";
// import { Tilt } from "react-tilt"; // For 3D tilt effect on cards
// import logo from "../assets/logo1.png"; // Replace with your logo path

// const ComingSoon = () => {
//   const { theme } = useTheme();
//   const isDark = theme === "dark";
//   const { scrollY } = useScroll();
//   const parallaxY1 = useTransform(scrollY, [0, 400], [0, -100]);
//   const parallaxY2 = useTransform(scrollY, [0, 400], [0, -60]);

//   // Countdown Timer Logic
//   const [timeLeft, setTimeLeft] = useState({});
//   const launchDate = new Date();
//   launchDate.setDate(launchDate.getDate() + 3);

//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const difference = +launchDate - +new Date();
//       return {
//         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//         minutes: Math.floor((difference / 1000 / 60) % 60),
//         seconds: Math.floor((difference / 1000) % 60),
//       };
//     };

//     const timer = setInterval(() => {
//       setTimeLeft(calculateTimeLeft());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   // Split hero title for staggered letter animation
//   const heroText = "Building the Future of Startups".split("");
//   const heroText2 =
//     "TWT is a modern venture studio building the future of startups.".split(
//       " "
//     );

//   return (
//     <div
//       className={`min-h-screen w-full overflow-x-hidden ${
//         isDark ? "bg-gray-900" : "bg-gradient-to-br from-[#f8faf5] to-red-100"
//       } transition-colors duration-500`}
//     >
//       {/* Parallax Image Background */}
//       <motion.div
//         className="absolute inset-0 overflow-hidden opacity-60"
//         style={{ y: parallaxY1 }}
//       >
//         <img
//           src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//           alt="Parallax Background 1"
//           className="w-full h-full object-cover"
//           aria-hidden="true"
//         />
//       </motion.div>
//       <motion.div
//         className="absolute inset-0 overflow-hidden opacity-10"
//         style={{ y: parallaxY2 }}
//       >
//         <img
//           src="https://images.pexels.com/photos/6476256/pexels-photo-6476256.jpeg"
//           alt="Parallax Background 2"
//           className="w-full h-full object-cover"
//           aria-hidden="true"
//         />
//       </motion.div>

//       {/* Animated Particle Background */}
//       <motion.div
//         className={`absolute inset-0 overflow-hidden ${
//           isDark ? "opacity-15" : "opacity-25"
//         }`}
//         style={{ y: parallaxY1 }}
//       >
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={i}
//             className={`absolute rounded-full ${
//               isDark ? "bg-red-500/40" : "bg-red-300/50"
//             } blur-lg`}
//             style={{
//               width: Math.random() * 300 + 100,
//               height: Math.random() * 300 + 100,
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               x: [0, Math.random() * 120 - 60],
//               y: [0, Math.random() * 120 - 60],
//               scale: [1, 1.3, 1],
//               opacity: [0.3, 0.5, 0.3],
//             }}
//             transition={{
//               duration: Math.random() * 20 + 10,
//               repeat: Infinity,
//               repeatType: "reverse",
//               ease: "easeInOut",
//             }}
//           />
//         ))}
//       </motion.div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-16 flex flex-col items-center">
//         {/* Logo/Branding */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.7 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//           className="flex flex-col items-center gap-4 mb-16"
//         >
//           <img
//             src={logo}
//             alt="TWT Venture Studio Logo"
//             className="h-44 w-auto drop-shadow-2xl"
//             aria-label="TWT Venture Studio Logo"
//           />
//           <div
//             className={`px-5 py-2 rounded-full text-base font-semibold tracking-wider ${
//               isDark
//                 ? "bg-gray-800/90 text-red-400"
//                 : "bg-red-100/90 text-red-600"
//             } shadow-lg border border-red-500/30`}
//           >
//             VENTURE STUDIO
//           </div>
//         </motion.div>

//         {/* Hero Section */}
//         <div className="text-center mb-20">
//           <motion.h1
//             className={`text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight ${
//               isDark ? "text-white" : "text-gray-900"
//             } drop-shadow-lg`}
//           >
//             {heroText.map((char, i) => (
//               <motion.span
//                 key={i}
//                 initial={{ opacity: 0, y: 50 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
//                 className={char === "Future" ? "text-red-500s" : ""}
//               >
//                 {char}
//               </motion.span>
//             ))}
//           </motion.h1>

//           <motion.div
//             className={`text-xl sm:text-2xl max-w-4xl mx-auto ${
//               isDark ? "text-gray-300" : "text-gray-600"
//             } font-medium leading-relaxed`}
//           >
//             {heroText2.map((word, i) => (
//               <motion.span
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
//                 className="inline-block mr-1"
//               >
//                 {word}&nbsp;
//               </motion.span>
//             ))}
//           </motion.div>
//         </div>

//         {/* Countdown Timer */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className={`flex items-center gap-8 mb-20 p-8 rounded-2xl ${
//             isDark ? "bg-gray-800/70" : "bg-[#FDFCF6]"
//           } shadow-xl backdrop-blur-md border border-red-500/30`}
//         >
//           <Clock className="w-10 h-10 text-red-500" aria-hidden="true" />
//           <div className="flex gap-6">
//             {["days", "hours", "minutes", "seconds"].map((unit) => (
//               <motion.div
//                 key={unit}
//                 className="text-center"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: 0.2 * unit.length }}
//               >
//                 <div
//                   className={`text-4xl font-extrabold ${
//                     isDark ? "text-white" : "text-gray-900"
//                   }`}
//                 >
//                   {timeLeft[unit] || 0}
//                 </div>
//                 <div
//                   className={`text-sm uppercase tracking-wide ${
//                     isDark ? "text-gray-400" : "text-gray-500"
//                   }`}
//                 >
//                   {unit}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Studio Verticals */}
//         <div className="w-full mb-24">
//           <motion.h2
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.7, ease: "easeOut" }}
//             className={`text-3xl sm:text-4xl font-extrabold mb-12 text-center ${
//               isDark ? "text-white" : "text-gray-900"
//             } tracking-tight`}
//           >
//             Our <span className="text-red-500">Core Verticals</span>
//           </motion.h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: <Rocket className="w-10 h-10" />,
//                 title: "Acceleration Studio",
//                 description:
//                   "We nurture early-stage startups through structured founder cohorts, hands-on support, and ecosystem access.",
//               },
//               {
//                 icon: <BarChart className="w-10 h-10" />,
//                 title: "Capital Studio",
//                 description:
//                   "We facilitate strategic investments, fundraising, and M&A advisory for high-growth ventures.",
//               },
//               {
//                 icon: <Zap className="w-10 h-10" />,
//                 title: "Growth Studio",
//                 description:
//                   "We offer deep consulting across Operations, Marketing, Sales, Finance, Technology, Legal, and top-tier CXO hiring to help startups scale faster and smarter.",
//               },
//             ].map((vertical, i) => (
//               <Tilt
//                 key={i}
//                 options={{ max: 15, scale: 1.05, speed: 400 }}
//                 className="w-full"
//               >
//                 <motion.div
//                   initial={{ opacity: 0, y: 40 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 0.6, delay: i * 0.15 }}
//                   whileHover={{
//                     scale: 1.05,
//                     boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
//                   }}
//                   className={`p-8 rounded-2xl border ${
//                     isDark
//                       ? "bg-gray-800/70 border-red-500/30"
//                       : "bg-white/90 border-red-500/20"
//                   } shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-md`}
//                   role="region"
//                   aria-label={vertical.title}
//                 >
//                   <div
//                     className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
//                       isDark
//                         ? "bg-red-900/50 text-red-400"
//                         : "bg-red-100/80 text-red-600"
//                     } shadow-md`}
//                   >
//                     {vertical.icon}
//                   </div>
//                   <h3
//                     className={`text-2xl font-bold mb-4 ${
//                       isDark ? "text-white" : "text-gray-900"
//                     }`}
//                   >
//                     {vertical.title}
//                   </h3>
//                   <p
//                     className={`${
//                       isDark ? "text-gray-300" : "text-gray-600"
//                     } text-lg leading-relaxed`}
//                   >
//                     {vertical.description}
//                   </p>
//                 </motion.div>
//               </Tilt>
//             ))}
//           </div>
//         </div>

//         {/* CTA */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           className={`p-10 rounded-3xl w-full max-w-4xl text-center ${
//             isDark ? "bg-gray-800/80" : "bg-white/90"
//           } shadow-2xl backdrop-blur-md border border-red-500/20`}
//         >
//           <h3
//             className={`text-3xl font-extrabold mb-6 ${
//               isDark ? "text-white" : "text-gray-900"
//             } tracking-tight`}
//           >
//             Ready to shape the future with us?
//           </h3>
//           <p
//             className={`max-w-2xl mx-auto mb-8 text-lg ${
//               isDark ? "text-gray-300" : "text-gray-600"
//             } leading-relaxed`}
//           >
//             At TWT, we don’t just support startups — we co-create their success.
//             Join our waitlist to be the first to know when we launch.
//           </p>
//           <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
//             <input
//               type="email"
//               placeholder="Your email address"
//               className={`flex-1 px-5 py-4 rounded-lg border ${
//                 isDark
//                   ? "bg-gray-700/80 border-gray-600 text-white"
//                   : "bg-white border-gray-300"
//               } focus:outline-none focus:ring-2 focus:ring-red-500 text-lg shadow-sm`}
//               required
//               aria-label="Email address for waitlist"
//             />
//             <motion.button
//               type="submit"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               animate={{
//                 boxShadow: [
//                   "0 0 0 rgba(34, 197, 94, 0.5)",
//                   "0 0 20px rgba(34, 197, 94, 0.7)",
//                   "0 0 0 rgba(34, 197, 94, 0.5)",
//                 ],
//               }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               className={`px-8 py-4 rounded-lg font-semibold text-lg ${
//                 isDark
//                   ? "bg-red-600 hover:bg-red-700"
//                   : "bg-red-500 hover:bg-red-600"
//               } text-white transition-colors shadow-md`}
//               aria-label="Join waitlist button"
//             >
//               Join Waitlist
//             </motion.button>
//           </form>
//         </motion.div>

//         {/* Footer */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.8, delay: 0.8 }}
//           className={`mt-24 pt-8 border-t ${
//             isDark ? "border-gray-800" : "border-gray-200"
//           } text-center`}
//         >
//           <p
//             className={`text-sm font-medium ${
//               isDark ? "text-gray-400" : "text-gray-500"
//             }`}
//           >
//             © {new Date().getFullYear()} TWT Venture Studio. All rights
//             reserved.
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default ComingSoon;

import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Clock, Rocket, Zap, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import logo from "../assets/logo1.png";

const ComingSoon = () => {
  const { scrollY } = useScroll();
  const parallaxY1 = useTransform(scrollY, [0, 400], [0, -100]);
  const parallaxY2 = useTransform(scrollY, [0, 400], [0, -60]);
  const phrases = ["Launching Soon", "Almost There!", "Preparing for Liftoff"];

  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({});

  const launchDate = new Date("2025-07-28T11:00:00");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +launchDate - +new Date();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Split hero title for staggered letter animation
  const heroText = "Building the Future of Startups".split("");
  const heroText2 =
    "TWT is a modern venture studio building the future of startups.".split(
      " "
    );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#f8faf5] to-red-100 transition-colors duration-500">
      {/* Parallax Image Background */}
      <motion.div
        className="absolute inset-0 overflow-hidden opacity-60"
        style={{ y: parallaxY1 }}
      >
        <img
          src="https://images.pexels.com/photos/443383/pexels-photo-443383.jpeg"
          alt="Parallax Background 1"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 overflow-hidden opacity-10"
        style={{ y: parallaxY2 }}
      >
        {/* <img
          src="https://images.pexels.com/photos/6476256/pexels-photo-6476256.jpeg"
          alt="Parallax Background 2"
          className="w-full h-full object-cover"
          aria-hidden="true"
        /> */}
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-16 flex flex-col items-center">
        {/* Logo/Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center gap-4 mb-16"
        >
          <img
            src={logo}
            alt="TWT Venture Studio Logo"
            className="h-44 w-auto drop-shadow-2xl"
            aria-label="TWT Venture Studio Logo"
          />
          <div className="px-5 py-2 rounded-full text-base font-semibold tracking-wider bg-red-100/90 text-red-600 shadow-lg border border-red-500/30 -mt-10">
            VENTURE STUDIO
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-gray-900 drop-shadow-lg">
            {heroText.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
                className={char === "Future" ? "text-red-500s" : ""}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.div className="text-xl sm:text-2xl max-w-4xl mx-auto text-gray-700 font-medium leading-relaxed">
            {heroText2.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                className="inline-block mr-1"
              >
                {word} 
              </motion.span>
            ))}
          </motion.div>
        </div>

        <motion.div
          role="status"
          aria-label="Launching Soon"
          className="px-6 py-2 rounded-full text-lg font-bold tracking-wide bg-white text-red-700 shadow-lg border border-red-400 -mt-10 mb-10 inline-flex items-center justify-center gap-3 select-none"
          animate={{
            scale: [1, 1.07, 1],
            boxShadow: [
              "0 0 0 rgba(34, 197, 94, 0.5)",
              "0 0 14px rgba(34, 197, 94, 0.8)",
              "0 0 0 rgba(34, 197, 94, 0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span
            aria-hidden="true"
            className="text-3xl leading-none animate-bounce"
          >
            🚀
          </span>
          <motion.span
            key={phrases[0]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="whitespace-nowrap"
          >
            Launching Soon
          </motion.span>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex items-center gap-8 mb-20 p-8 rounded-2xl bg-[#FDFCF6] shadow-xl backdrop-blur-md border border-red-500/30"
        >
          <Clock className="w-10 h-10 text-red-500" aria-hidden="true" />
          <div className="flex gap-6">
            {["days", "hours", "minutes", "seconds"].map((unit) => (
              <motion.div
                key={unit}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * unit.length }}
              >
                <div className="text-4xl font-extrabold text-gray-900">
                  {timeLeft[unit] || 0}
                </div>
                <div className="text-sm uppercase tracking-wide text-gray-500">
                  {unit}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Studio Verticals */}
        <div className="w-full mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-extrabold mb-12 text-center text-gray-900 tracking-tight"
          >
            Our <span className="text-red-500">Core Verticals</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="w-10 h-10" />,
                title: "Acceleration Studio",
                description:
                  "We nurture early-stage startups through structured founder cohorts, hands-on support, and ecosystem access.",
              },
              {
                icon: <BarChart className="w-10 h-10" />,
                title: "Capital Studio",
                description:
                  "We facilitate strategic investments, fundraising, and M&A advisory for high-growth ventures.",
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Growth Studio",
                description:
                  "We offer deep consulting across Operations, Marketing, Sales, Finance, Technology, Legal, and top-tier CXO hiring to help startups scale faster and smarter.",
              },
            ].map((vertical, i) => (
              <Tilt
                key={i}
                tiltMaxAngleX={15}
                tiltMaxAngleY={15}
                scale={1.05}
                transitionSpeed={400}
                className="w-full"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                  }}
                  className="p-8 rounded-2xl border bg-white/90 border-red-500/20 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-md"
                  role="region"
                  aria-label={vertical.title}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100/80 text-red-600 shadow-md">
                    {vertical.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {vertical.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {vertical.description}
                  </p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="p-10 rounded-3xl w-full max-w-4xl text-center bg-white/90 shadow-2xl backdrop-blur-md border border-red-500/20"
        >
          <h3 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">
            Ready to shape the future with us?
          </h3>
          <p className="max-w-2xl mx-auto mb-8 text-lg text-gray-600 leading-relaxed">
            At TWT, we don’t just support startups — we co-create their success.
            Join our waitlist to be the first to know when we launch.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-4 rounded-lg border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg shadow-sm"
              required
              aria-label="Email address for waitlist"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 0 rgba(34, 197, 94, 0.5)",
                  "0 0 20px rgba(34, 197, 94, 0.7)",
                  "0 0 0 rgba(34, 197, 94, 0.5)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="px-8 py-4 rounded-lg font-semibold text-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
              aria-label="Join waitlist button"
            >
              Join Waitlist
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 pt-8 border-t border-gray-200 text-center"
        >
          <p className="text-sm font-medium text-gray-500">
            © {new Date().getFullYear()} TWT Venture Studio. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;

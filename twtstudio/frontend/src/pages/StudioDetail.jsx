// import React from "react";
// import { motion } from "framer-motion";
// import { ArrowRight } from "lucide-react";
// import { Link, useParams, Navigate } from "react-router-dom";
// import { useTheme } from "../context/ThemeContext";

// const StudioDetail = () => {
//   const { name } = useParams();
//   const { theme } = useTheme();
//   const isDark = theme === "dark";

//   const studios = {
//     venture: {
//       name: "Acceleration Studio",
//       heroTitle: "Venture Studio",
//       heroDescription:
//         "Building the future by turning visionary ideas into thriving startups with unparalleled support and expertise.",
//       mission:
//         "Venture Studio is dedicated to fostering innovation by collaborating with entrepreneurs to create transformative startups. We provide hands-on support, from ideation to execution, leveraging our expertise in technology, design, and business strategy.",
//       features: [
//         {
//           title: "Expert Mentorship",
//           description:
//             "Work with seasoned entrepreneurs and industry experts to guide your startup journey.",
//         },
//         {
//           title: "Resource Support",
//           description:
//             "Access cutting-edge tools, technology, and infrastructure to build your product.",
//         },
//         {
//           title: "Collaborative Environment",
//           description:
//             "Join a vibrant community of innovators to share ideas and drive success.",
//         },
//       ],
//       image:
//         "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
//       department: "Engineering",
//     },
//     growth: {
//       name: "Growth Studio",
//       heroTitle: "Growth Studio",
//       heroDescription:
//         "Scaling businesses to new heights with strategic insights and innovative marketing solutions.",
//       mission:
//         "Growth Studio partners with businesses to unlock their full potential through tailored growth strategies, advanced analytics, and innovative marketing campaigns that drive measurable results.",
//       features: [
//         {
//           title: "Data-Driven Strategies",
//           description:
//             "Leverage analytics to optimize growth and maximize ROI.",
//         },
//         {
//           title: "Innovative Marketing",
//           description:
//             "Create impactful campaigns that resonate with your audience.",
//         },
//         {
//           title: "Scalable Solutions",
//           description:
//             "Build sustainable growth plans tailored to your business needs.",
//         },
//       ],
//       image:
//         "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
//       department: "Marketing",
//     },
//     capital: {
//       name: "Capital Studio",
//       heroTitle: "Capital Studio",
//       heroDescription:
//         "Empowering startups with strategic investments and financial expertise to fuel growth and success.",
//       mission:
//         "Capital Studio bridges the gap between promising startups and the capital they need to thrive. We offer strategic investments, financial advisory, and growth planning to ensure long-term success.",
//       features: [
//         {
//           title: "Strategic Investments",
//           description:
//             "Provide funding to high-potential startups with tailored investment plans.",
//         },
//         {
//           title: "Financial Expertise",
//           description:
//             "Offer expert guidance on financial strategy and growth planning.",
//         },
//         {
//           title: "Network Access",
//           description:
//             "Connect startups with industry leaders and investors for growth opportunities.",
//         },
//       ],
//       image:
//         "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
//       department: "Finance",
//     },
//   };

//   const studio = studios[name];
//   if (!studio) return <Navigate to="/studio" replace />;

//   const sectionVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: "easeOut" },
//     },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.2 },
//     },
//   };

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         isDark ? "bg-gray-900 text-white" : "bg-[#FDFCF6] text-gray-900"
//       }`}
//     >
//       {/* Hero Section */}
//       <motion.section
//         variants={sectionVariants}
//         initial="hidden"
//         animate="visible"
//         className={`py-16 ${
//           isDark
//             ? "bg-gradient-to-r from-gray-900 to-gray-900 text-white"
//             : "bg-gradient-to-r from-red-500 to-red-400 text-white"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between mt-24">
//           <div className="text-center md:text-left">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               {studio.heroTitle}
//             </h1>
//             <p className="text-lg md:text-xl max-w-2xl mb-8">
//               {studio.heroDescription}
//             </p>
//           </div>
//         </div>
//       </motion.section>

//       {/* Content Section */}
//       <section className="py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//             className="space-y-12"
//           >
//             {/* Overview */}
//             <motion.div
//               variants={sectionVariants}
//               className="flex flex-col md:flex-row gap-8"
//             >
//               <div className="w-full md:w-1/2">
//                 <img
//                   src={studio.image}
//                   alt={`${studio.name} illustration`}
//                   className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
//                 />
//               </div>
//               <div className="w-full md:w-1/2">
//                 <h2 className="text-2xl md:text-3xl font-bold mb-4">
//                   Our Mission
//                 </h2>
//                 <p className="mb-6">{studio.mission}</p>
//               </div>
//             </motion.div>

//             {/* Key Features */}
//             <motion.div variants={sectionVariants}>
//               <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
//                 What We Offer
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {studio.features.map((feature) => (
//                   <div
//                     key={feature.title}
//                     className={`rounded-lg shadow-md p-6 border ${
//                       isDark
//                         ? "bg-gray-800 text-white border-gray-700"
//                         : "bg-[#FDFCF6] text-gray-900 border-gray-200"
//                     }`}
//                   >
//                     <h3 className="text-xl mb-2">{feature.title}</h3>
//                     <p>{feature.description}</p>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default StudioDetail;
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import AccelerationStudio from "../components/studios/AccelerationStudio";
import CapitalStudio from "../components/studios/CapitalStudio";
import GrowthStudio from "../components/studios/GrowthStudio";
import { useTheme } from "../context/ThemeContext"; // Custom theme context

const StudioDetail = () => {
  const { name } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark"; // Use theme like your pattern

  const studios = {
    acceleration: <AccelerationStudio />,
    capital: <CapitalStudio />,
    growth: <GrowthStudio />,
  };

  const StudioComponent = studios[name];

  if (!StudioComponent) return <Navigate to="/studio" replace />;

  return (
    <div
      className={`pt-6 transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {StudioComponent}
    </div>
  );
};

export default StudioDetail;




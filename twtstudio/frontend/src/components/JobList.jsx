// import { useState, useMemo, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Search, MapPin, Calendar, X } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { jobAPI } from "../lib/api";
// import { useTheme } from "../context/ThemeContext";

// const JobList = () => {
//   const { theme } = useTheme();

//   const [filterType, setFilterType] = useState("all");
//   const [filterDepartment, setFilterDepartment] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [displayedCount, setDisplayedCount] = useState(8);
//   const sentinelRef = useRef(null);

//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["jobs"],
//     queryFn: () => jobAPI.getJobs(),
//   });

//   const filteredJobs = useMemo(() => {
//     return jobs.filter((job) => {
//       const matchesSearch =
//         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         job.location.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesType = filterType === "all" || job.type === filterType;
//       const matchesDepartment =
//         filterDepartment === "all" || job.department === filterDepartment;

//       return matchesSearch && matchesType && matchesDepartment;
//     });
//   }, [jobs, searchTerm, filterType, filterDepartment]);

//   const departments = useMemo(() => {
//     const uniqueDepartments = [
//       ...new Set(jobs.map((job) => job.department)),
//     ].filter(Boolean);
//     return ["all", ...uniqueDepartments];
//   }, [jobs]);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && displayedCount < filteredJobs.length) {
//           setDisplayedCount((prev) => prev + 8);
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (sentinelRef.current) observer.observe(sentinelRef.current);
//     return () => {
//       if (sentinelRef.current) observer.unobserve(sentinelRef.current);
//     };
//   }, [filteredJobs.length, displayedCount]);

//   useEffect(() => {
//     setDisplayedCount(8);
//     setSelectedJob(null);
//   }, [searchTerm, filterType, filterDepartment]);

//   const cardVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   const panelVariants = {
//     hidden: { x: "100%", opacity: 0 },
//     visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
//     exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
//   };

//   const getTypeColor = (type) => {
//     switch (type) {
//       case "Full-time":
//         return "bg-red-100 text-red-800";
//       case "Part-time":
//         return "bg-purple-100 text-purple-800";
//       case "Contract":
//         return "bg-orange-100 text-orange-800";
//       case "Internship":
//         return "bg-blue-100 text-blue-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const containerBgBorder =
//     theme === "dark"
//       ? "bg-gray-900/80 border border-gray-700"
//       : "bg-[#FDFCF6] border border-gray-200";

//   return (
//     <div
//       className={`min-h-screen py-8 ${
//         theme === "dark"
//           ? "bg-gray-900/80 text-white"
//           : "bg-[#FDFCF6] text-gray-900/80"
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-bold mb-8">Job Listings</h1>

//         {/* Filters */}
//         <div className={`rounded-xl shadow-sm p-6 mb-8 ${containerBgBorder}`}>
//           <div className="flex flex-col lg:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//               <input
//                 type="text"
//                 placeholder="Search jobs..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               />
//             </div>
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//             >
//               <option value="all">All Types</option>
//               <option value="Full-time">Full-time</option>
//               <option value="Part-time">Part-time</option>
//               <option value="Internship">Internship</option>
//               <option value="Contract">Contract</option>
//             </select>
//             <select
//               value={filterDepartment}
//               onChange={(e) => setFilterDepartment(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//             >
//               {departments.map((dept) => (
//                 <option key={dept} value={dept}>
//                   {dept === "all" ? "All Departments" : dept}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Job List + Details Panel */}
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Job List */}
//           <div className="flex-1">
//             {isLoading ? (
//               <p className="text-gray-400 text-center ">Loading jobs...</p>
//             ) : isError ? (
//               <p className="text-red-500">Failed to load jobs.</p>
//             ) : filteredJobs.length === 0 ? (
//               <div className="text-center py-12">
//                 <p className="text-gray-500">
//                   No job postings found matching your criteria.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredJobs.slice(0, displayedCount).map((job, index) => (
//                   <motion.div
//                     key={job.id}
//                     custom={index}
//                     variants={cardVariants}
//                     initial="hidden"
//                     animate="visible"
//                     className={`rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${containerBgBorder}`}
//                     onClick={() => setSelectedJob(job)}
//                   >
//                     <div className="flex flex-col h-full">
//                       <h3 className="text-lg font-semibold mb-2">
//                         {job.title}
//                       </h3>
//                       <p className="text-md text-gray-500 mb-2">
//                         {job.company}
//                       </p>
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-sm text-gray-400">
//                           <MapPin className="h-4 w-4 inline mr-1" />
//                           {job.location}
//                         </span>
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
//                             job.type
//                           )}`}
//                         >
//                           {job.type}
//                         </span>
//                       </div>
//                       <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
//                         <span>₹ {job.salary}</span>
//                         <span>
//                           <Calendar className="h-4 w-4 inline mr-1" />
//                           {new Date(job.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-400">
//                         Department:{" "}
//                         <span className="font-medium">{job.department}</span>
//                       </p>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//             {displayedCount < filteredJobs.length && (
//               <div
//                 ref={sentinelRef}
//                 className="h-10 w-full flex justify-center items-center mt-6"
//               >
//                 <p className="text-gray-500">Loading more jobs...</p>
//               </div>
//             )}
//           </div>

//           {/* Job Detail Panel */}
//           <AnimatePresence>
//             {selectedJob && (
//               <motion.div
//                 variants={panelVariants}
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//                 className={`lg:w-1/3 rounded-xl shadow-lg p-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto ${containerBgBorder}`}
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <h2 className="text-xl font-bold">{selectedJob.title}</h2>
//                   <button
//                     onClick={() => setSelectedJob(null)}
//                     className="text-gray-700 hover:text-gray-600"
//                   >
//                     <X className="h-6 w-6" />
//                   </button>
//                 </div>
//                 <div className="space-y-6">
//                   <div>
//                     <p className="text-lg font-medium">{selectedJob.company}</p>
//                     <p className="text-sm text-gray-700">
//                       <MapPin className="h-4 w-4 inline mr-1" />
//                       {selectedJob.location}
//                     </p>
//                     <p className="text-sm text-gray-700">
//                       <Calendar className="h-4 w-4 inline mr-1" />
//                       {new Date(selectedJob.createdAt).toLocaleDateString(
//                         "en-US",
//                         {
//                           year: "numeric",
//                           month: "long",
//                           day: "numeric",
//                         }
//                       )}
//                     </p>
//                   </div>
//                   <div>
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
//                         selectedJob.type
//                       )}`}
//                     >
//                       {selectedJob.type}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-700">Salary</p>
//                     <p className="font-medium">
//                       ₹ {selectedJob.salary || "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-700">Department</p>
//                     <p className="font-medium text-gray-500">
//                       {selectedJob.department || "Not specified"}
//                     </p>
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold mb-2">
//                       Job Description
//                     </h3>
//                     <p className="text-gray-500 whitespace-pre-wrap">
//                       {selectedJob.description || "No description provided."}
//                     </p>
//                   </div>
//                   {selectedJob.requirements && (
//                     <div>
//                       <h3 className="text-lg font-semibold mb-2">
//                         Requirements
//                       </h3>
//                       <ul className="list-disc pl-5 space-y-1 text-gray-500">
//                         {typeof selectedJob.requirements === "string" ? (
//                           selectedJob.requirements
//                             .split("\n")
//                             .filter((req) => req.trim())
//                             .map((req, idx) => <li key={idx}>{req}</li>)
//                         ) : (
//                           <li>No requirements provided.</li>
//                         )}
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobList;

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jobAPI } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

const JobList = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [filterType, setFilterType] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(8);
  const sentinelRef = useRef(null);

  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobAPI.getJobs(),
  });

  // Shimmer Loading Component
  const ShimmerJobCard = () => (
    <div
      className={`rounded-xl p-4 ${
        isDark ? "bg-gray-800" : "bg-gray-100"
      } animate-pulse`}
    >
      <div className="flex flex-col h-full space-y-3">
        <div
          className={`h-6 rounded-md ${
            isDark ? "bg-gray-700" : "bg-gray-300"
          } w-3/4`}
        ></div>
        <div
          className={`h-4 rounded-md ${
            isDark ? "bg-gray-700" : "bg-gray-300"
          } w-1/2`}
        ></div>
        <div className="flex justify-between">
          <div
            className={`h-4 rounded-md ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } w-1/3`}
          ></div>
          <div
            className={`h-4 rounded-md ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } w-1/4`}
          ></div>
        </div>
        <div className="flex justify-between">
          <div
            className={`h-4 rounded-md ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } w-1/3`}
          ></div>
          <div
            className={`h-4 rounded-md ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } w-1/3`}
          ></div>
        </div>
        <div
          className={`h-3 rounded-md ${
            isDark ? "bg-gray-700" : "bg-gray-300"
          } w-2/3`}
        ></div>
      </div>
    </div>
  );

  const ShimmerJobList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <ShimmerJobCard key={index} />
      ))}
    </div>
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || job.type === filterType;
      const matchesDepartment =
        filterDepartment === "all" || job.department === filterDepartment;

      return matchesSearch && matchesType && matchesDepartment;
    });
  }, [jobs, searchTerm, filterType, filterDepartment]);

  const departments = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(jobs.map((job) => job.department)),
    ].filter(Boolean);
    return ["all", ...uniqueDepartments];
  }, [jobs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredJobs.length) {
          setDisplayedCount((prev) => prev + 8);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [filteredJobs.length, displayedCount]);

  useEffect(() => {
    setDisplayedCount(8);
    setSelectedJob(null);
  }, [searchTerm, filterType, filterDepartment]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const panelVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-red-100 text-red-800";
      case "Part-time":
        return "bg-purple-100 text-purple-800";
      case "Contract":
        return "bg-orange-100 text-orange-800";
      case "Internship":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const containerBgBorder = isDark
    ? "bg-gray-900/80 border border-gray-700"
    : "bg-[#FDFCF6] border border-gray-200";

  return (
    <div
      className={`min-h-screen py-8 ${
        isDark ? "bg-gray-900/80 text-white" : "bg-[#FDFCF6] text-gray-900/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Job Listings</h1>

        {/* Filters */}
        <div className={`rounded-xl shadow-sm p-6 mb-8 ${containerBgBorder}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job List + Details Panel */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Job List */}
          <div className="flex-1">
            {isLoading ? (
              <ShimmerJobList />
            ) : isError ? (
              <p
                className={`text-center py-12 ${
                  isDark ? "text-red-400" : "text-red-500"
                }`}
              >
                Failed to load jobs. Please try again later.
              </p>
            ) : filteredJobs.length === 0 ? (
              <div
                className={`text-center py-12 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p>No job postings found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterDepartment("all");
                  }}
                  className={`mt-4 px-4 py-2 rounded-lg ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.slice(0, displayedCount).map((job, index) => (
                  <motion.div
                    key={job.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${containerBgBorder}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-2">
                        {job.title}
                      </h3>
                      <p
                        className={`text-md mb-2 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {job.company}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {job.location}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            job.type
                          )}`}
                        >
                          {job.type}
                        </span>
                      </div>
                      <div
                        className={`flex items-center justify-between text-sm mb-2 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <span>₹ {job.salary}</span>
                        <span>
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Department:{" "}
                        <span className="font-medium">{job.department}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {displayedCount < filteredJobs.length && (
              <div
                ref={sentinelRef}
                className="h-10 w-full flex justify-center items-center mt-6"
              >
                <div
                  className={`h-8 w-8 rounded-full border-2 ${
                    isDark ? "border-gray-600" : "border-gray-300"
                  } border-t-red-500 animate-spin`}
                ></div>
              </div>
            )}
          </div>

          {/* Job Detail Panel */}
          <AnimatePresence>
            {selectedJob && (
              <motion.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`lg:w-1/3 rounded-xl shadow-lg p-6 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto ${containerBgBorder}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className={`p-1 rounded-full ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-lg font-medium">{selectedJob.company}</p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {selectedJob.location}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(selectedJob.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                        selectedJob.type
                      )}`}
                    >
                      {selectedJob.type}
                    </span>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Salary
                    </p>
                    <p className="font-medium">
                      ₹ {selectedJob.salary || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Department
                    </p>
                    <p className="font-medium">
                      {selectedJob.department || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Job Description
                    </h3>
                    <p
                      className={`whitespace-pre-wrap ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {selectedJob.description || "No description provided."}
                    </p>
                  </div>
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Requirements
                      </h3>
                      <ul
                        className={`list-disc pl-5 space-y-1 ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {typeof selectedJob.requirements === "string" ? (
                          selectedJob.requirements
                            .split("\n")
                            .filter((req) => req.trim())
                            .map((req, idx) => <li key={idx}>{req}</li>)
                        ) : (
                          <li>No requirements provided.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JobList;

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { jobAPI } from "../lib/api";
import toast, { Toaster } from "react-hot-toast";

const JobManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(8); // Initial number of jobs to display
  const sentinelRef = useRef(null); // Ref for the sentinel element

  // 🔁 Fetch Jobs from backend
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobAPI.getJobs(),
  });

  // ❌ Delete Job
  const deleteJobMutation = useMutation({
    mutationFn: (id) => jobAPI.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
      toast.success("Job deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete job");
    },
  });

  const handleDeleteJob = (id) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm w-full bg-[#FDFCF6] shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5`}
      >
        <div className="p-4">
          <p className="text-sm font-medium text-gray-900 mb-1">Delete Job?</p>
          <p className="text-sm text-gray-500 mb-3">
            Are you sure you want to delete this job post?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                deleteJobMutation.mutate(id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === "all" || job.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [jobs, searchTerm, filterType]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredJobs.length) {
          setDisplayedCount((prev) => prev + 8); // Load 8 more jobs
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the sentinel is visible
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [filteredJobs.length, displayedCount]);

  // Reset displayedCount when filters change
  useEffect(() => {
    setDisplayedCount(8); // Reset to initial 8 jobs when filters change
  }, [searchTerm, filterType]);

  const getTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-red-100 text-red-800";
      case "Part-time":
        return "bg-purple-100 text-purple-800";
      case "Contract":
        return "bg-orange-100 text-orange-800";
      case "Internship":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedJob(null);
  };

  // Animation variants for job cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6]">
      {/* Header */}
      <header className="bg-[#FDFCF6] shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Job Management
                </h1>
                <p className="text-gray-600">Create and manage job postings</p>
              </div>
            </div>
            <Link
              to="/admin/jobs/new"
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Job Post</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-[#FDFCF6] rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        {/* Job Posts Grid */}
        {isLoading ? (
          <p className="text-gray-600">Loading jobs...</p>
        ) : isError ? (
          <p className="text-red-600">Failed to load jobs.</p>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No job postings found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredJobs.slice(0, displayedCount).map((job, index) => (
              <motion.div
                key={job._id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-[#FDFCF6] rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-md text-gray-600 mb-2">{job.company}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
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
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>
                        <span className="font-medium">₹</span> {job.salary}
                      </span>
                      <span>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Department:{" "}
                      <span className="font-medium">{job.department}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between space-x-2">
                    <Link
                      to={`/admin/jobs/${job._id}`}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Edit className="h-4 w-4 inline mr-1" /> Edit
                    </Link>
                    <button
                      onClick={() => openModal(job)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Eye className="h-4 w-4 inline mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sentinel for lazy loading */}
        {displayedCount < filteredJobs.length && (
          <div
            ref={sentinelRef}
            className="h-10 w-full flex justify-center items-center"
          >
            <p className="text-gray-500">Loading more jobs...</p>
          </div>
        )}
      </main>

      {/* Job Details Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#FDFCF6] p-6 text-left align-middle shadow-2xl transition-all">
                  {selectedJob ? (
                    <>
                      <div className="flex justify-between items-start">
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-bold text-gray-900"
                        >
                          {selectedJob.title || "Untitled Job"}
                        </Dialog.Title>
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                          onClick={closeModal}
                          aria-label="Close modal"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-lg font-medium text-gray-700">
                              {selectedJob.company || "Unknown Company"}
                            </p>
                            <div className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-gray-600">
                                {selectedJob.location || "Unknown Location"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                                selectedJob.type
                              )}`}
                            >
                              {selectedJob.type || "Unknown Type"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm text-gray-500">Salary</p>
                              <p className="font-medium">
                                <span className="font-medium text-gray-500">
                                  ₹{" "}
                                </span>
                                {selectedJob.salary || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                              <p className="text-sm text-gray-500">Posted on</p>
                              <p className="font-medium">
                                {selectedJob.createdAt
                                  ? new Date(
                                      selectedJob.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                Department
                              </p>
                              <p className="font-medium">
                                {selectedJob.department || "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold mb-2">
                            Job Description
                          </h4>
                          <p className="text-gray-700 whitespace-pre-wrap break-words">
                            {selectedJob.description ||
                              "No description provided."}
                          </p>
                        </div>

                        {selectedJob.requirements && (
                          <div>
                            <h4 className="text-lg font-semibold mb-2">
                              Requirements
                            </h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                              {typeof selectedJob.requirements === "string" ? (
                                selectedJob.requirements
                                  .split("\n")
                                  .filter((req) => req.trim())
                                  .map((req, idx) => (
                                    <li key={idx} className="break-words">
                                      {req}
                                    </li>
                                  ))
                              ) : (
                                <li>No requirements provided.</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">No job selected.</p>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Toaster position="top-right" />
    </div>
  );
};

export default JobManagement;

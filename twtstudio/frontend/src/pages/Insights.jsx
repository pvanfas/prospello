import React from "react";
import { motion } from "framer-motion";
import { useBlogs } from "../hooks/useAPI";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import moment from "moment";
import clsx from "clsx";

const SkeletonCard = ({ theme }) => {
  const base = theme === "dark" ? "bg-gray-700" : "bg-gray-200";

  return (
    <div
      className={clsx(
        "rounded-xl overflow-hidden shadow-lg animate-pulse",
        theme === "dark" ? "bg-gray-800" : "bg-[#fdfcf6]"
      )}
    >
      <div className={clsx("h-48 sm:h-56 w-full", base)} />
      <div className="p-6 space-y-3">
        <div className={clsx("h-4 rounded w-1/2", base)} />
        <div className={clsx("h-6 rounded w-3/4", base)} />
        <div className={clsx("h-4 rounded w-full", base)} />
        <div className={clsx("h-4 rounded w-5/6", base)} />
        <div className={clsx("h-4 rounded w-1/3", base)} />
      </div>
    </div>
  );
};

const Insights = () => {
  const { theme } = useTheme();
  const { data, isLoading } = useBlogs();
  const blogs = Array.isArray(data) ? data : [];

  return (
    <section
      className={clsx(
        "py-12 md:py-20 min-h-screen",
        theme === "dark" ? "bg-gray-900" : "bg-[#FDFCF6]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Page heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className={clsx(
              "text-3xl sm:text-4xl md:text-5xl font-bold",
              theme === "dark" ? "text-white" : "text-gray-900"
            )}
          >
            Insights & Articles
          </h1>
          <p
            className={clsx(
              "mt-4 max-w-2xl mx-auto text-lg",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            Discover the latest trends, tips, and best practices
          </p>
        </motion.div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} theme={theme} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p
              className={clsx(
                "text-lg",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}
            >
              No articles found. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog._id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={clsx(
                  "rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                )}
              >
                <div className="h-48 sm:h-56 overflow-hidden">
                  <img
                    src={blog.image || " "}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div
                    className={clsx(
                      "text-xs font-medium mb-2",
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {moment(blog.createdAt).format("MMMM D, YYYY")} ·{" "}
                    {Math.ceil(blog.description?.length / 200) || 3} min read
                  </div>
                  <h2
                    className={clsx(
                      "text-xl font-semibold mb-3",
                      theme === "dark" ? "text-white" : "text-gray-800"
                    )}
                  >
                    {blog.title}
                  </h2>
                  <p
                    className={clsx(
                      "text-sm mb-4 line-clamp-3",
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    {blog.description}
                  </p>
                  <Link
                    to={`/blog/${blog._id || " "}`}
                    className={clsx(
                      "inline-flex items-center font-medium",
                      theme === "dark"
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-600 hover:text-red-700"
                    )}
                  >
                    Read more
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights;

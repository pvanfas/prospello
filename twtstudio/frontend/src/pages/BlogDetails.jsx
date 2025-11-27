import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogAPI } from "../lib/api";
import { motion } from "framer-motion";
import moment from "moment";
import { useTheme } from "../context/ThemeContext";

const BlogDetails = () => {
  const { id } = useParams();
  const { theme } = useTheme();

  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogAPI.getBlog(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500 animate-pulse">Loading blog...</p>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Blog not found.</p>
      </div>
    );
  }

  return (
    <div className={`${theme === "dark" ? "bg-gray-900" : "bg-[#FDFCF6]"}`}>
      {/* Hero Image - Medium-sized */}
      <motion.div
        className="w-full max-w-3xl mx-auto h-[400px] md:h-[450px] overflow-hidden mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-fit object-center rounded-lg mt-36 p-4 md:rounded-2xl sm:rounded-2xl lg:rounded-2xl"
        />
      </motion.div>

      {/* Blog Content Container */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Article Container */}
        <article
          className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {/* Title */}
          <motion.h1
            className={`text-3xl md:text-4xl font-serif font-bold mb-6 leading-snug ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {blog.title}
          </motion.h1>

          {/* Author and Date */}
          <motion.div
            className={`mb-8 flex items-center ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-4 overflow-hidden">
              {/* Add author image if available */}
            </div>
            <div>
              <p className="font-medium">{blog.author}</p>
              <p className="text-sm">
                {moment(blog.createdAt).format("MMMM D, YYYY")} ·{" "}
                {Math.ceil(blog.description.length / 1000)} min read
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className={`prose prose-lg max-w-none font-serif ${
              theme === "dark" ? "prose-invert" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xl leading-relaxed">{blog.description}</p>
          </motion.div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetails;

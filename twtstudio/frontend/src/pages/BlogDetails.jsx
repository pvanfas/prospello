import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogAPI } from "../lib/api";
import { motion } from "framer-motion";
import moment from "moment";
import { useTheme } from "../context/ThemeContext";
import Typography from "../components/Typography";

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
        <Typography variant="h5" color="muted" className="animate-pulse">
          Loading blog...
        </Typography>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography variant="h5" color="accent">
          Blog not found.
        </Typography>
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              className={`mb-6 font-serif ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {blog.title}
            </Typography>
          </motion.div>

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
              <Typography variant="body" className="font-medium">
                {blog.author}
              </Typography>
              <Typography variant="small">
                {moment(blog.createdAt).format("MMMM D, YYYY")} ·{" "}
                {Math.ceil(blog.description.length / 1000)} min read
              </Typography>
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
            <Typography variant="body" className="text-xl leading-relaxed">
              {blog.description}
            </Typography>
          </motion.div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetails;

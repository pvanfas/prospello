import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  X,
} from "lucide-react";
import { useBlogs, useDeleteBlog } from "../hooks/useAPI";
import toast from "react-hot-toast";

const BlogManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);

  const { data: blogs = [], isLoading } = useBlogs();
  const deleteBlogMutation = useDeleteBlog();

  const filteredBlogs = useMemo(() => {
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);

  const handleDeleteBlog = (id) => {
    toast.custom((t) => (
      <div className="bg-[#FDFCF6] rounded-xl p-4 shadow-md border border-gray-300 w-full max-w-sm">
        <p className="text-gray-800 font-medium mb-3">Delete this blog post?</p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await toast.promise(deleteBlogMutation.mutateAsync(id), {
                  loading: "Deleting...",
                  success: "Blog deleted!",
                  error: "Delete failed",
                });
              } catch (err) {
                console.error(err);
              }
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-md text-sm"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-[#FDFCF6] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FDFCF6] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:bg-gray-200 p-1 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Blog Manager</h1>
          </div>
          <Link
            to="/admin/blogs/new"
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </Link>
        </div>
      </header>

      {/* Search */}
      <section className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full bg-[#FDFCF6] focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Blog List */}
      <main className="px-4 pb-10 space-y-4">
        {filteredBlogs.length === 0 && (
          <div className="text-center text-gray-500">No blogs found.</div>
        )}
        {filteredBlogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#FDFCF6] rounded-lg p-4 shadow border border-gray-200"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {blog.title}
              </h2>
              <div className="flex flex-wrap text-sm text-gray-500 gap-3">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Link
                  to={`/admin/blogs/${blog._id}`}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Edit className="inline w-4 h-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => setSelectedBlog(blog)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Eye className="inline w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleDeleteBlog(blog._id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Trash2 className="inline w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </main>

      {/* View Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#FDFCF6] max-w-md w-full p-4 rounded-xl relative shadow-lg"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedBlog(null)}
              >
                <X className="w-5 h-5" />
              </button>

              {selectedBlog.image ? (
                <img
                  src={selectedBlog.image}
                  alt="No Preview"
                  className="rounded-lg mb-3 w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-[#FDFCF6] rounded-lg mb-3 flex items-center justify-center text-sm text-gray-500">
                  No image
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedBlog.title}
              </h3>

              <p className="text-sm text-gray-600 mb-2">
                <strong>Author:</strong> {selectedBlog.author}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong>{" "}
                {new Date(selectedBlog.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {selectedBlog.description}
              </p>

              <div className="prose prose-sm">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogManagement;

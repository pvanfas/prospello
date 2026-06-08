import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BlogForm = ({ initialData = {}, onSubmit, isLoading }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    image: "",
  });

  const [errors, setErrors] = useState({});

  // Initialize form data once when component mounts or initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        author: initialData.author || prev.author,
        image: initialData.image || prev.image,
      }));
    }
  }, [initialData]); // Only run when initialData changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF6] px-4 py-6 md:px-10 md:py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-md rounded-xl space-y-8 border border-gray-200"
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Blog Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter blog title"
            className={`w-full px-4 py-2 rounded-md border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-red-500 focus:outline-none`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-1">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            name="author"
            type="text"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Author name"
            className={`w-full px-4 py-2 rounded-md border ${
              errors.author ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-red-500 focus:outline-none`}
          />
          {errors.author && (
            <p className="text-red-500 text-sm mt-1">{errors.author}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={8}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Write your blog content..."
            className={`w-full px-4 py-2 rounded-md border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-red-500 focus:outline-none resize-none`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Featured Image */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Featured Image (URL)
          </label>
          <input
            id="image"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="mt-4 w-full h-48 object-contain rounded-md border border-gray-200"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;

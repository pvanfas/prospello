import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobAPI } from "../lib/api";
import toast from "react-hot-toast";

const JobForm = () => {
  const { id } = useParams(); // Get job ID from URL for editing
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id; // Determine if this is an edit or create form

  // Initial form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    department: "",
    description: "",
    requirements: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch job data for editing
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobAPI.getJobById(id),
    enabled: isEditing, // Only fetch if editing
  });

  // Populate form with job data when editing
  useEffect(() => {
    if (isEditing && job) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "Full-time",
        salary: job.salary ? job.salary.toString() : "", // Convert to string for input
        department: job.department || "",
        description: job.description || "",
        requirements: job.requirements || "",
      });
    }
  }, [job, isEditing]);

  // Mutation for creating a job
  const createJobMutation = useMutation({
    mutationFn: (jobData) => jobAPI.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]); // Trigger refetch in JobManagement
      toast.success("Job created successfully");
      navigate("/admin/jobs");
    },
    onError: () => {
      toast.error("Failed to create job");
    },
  });

  // Mutation for updating a job
  const updateJobMutation = useMutation({
    mutationFn: (jobData) => jobAPI.updateJob(id, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]); // Trigger refetch in JobManagement
      toast.success("Job updated successfully");
      navigate("/admin/jobs");
    },
    onError: () => {
      toast.error("Failed to update job");
    },
  });

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "title",
      "company",
      "location",
      "type",
      "salary",
      "department",
      "description",
      "requirements",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = `${field} is required`;
      }
    });

    // Additional validation for salary
    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = "Salary must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If salary field, allow only digits
    if (name === "salary") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for the current field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Send salary as number
    const formattedData = {
      ...formData,
      salary: Number(formData.salary),
    };

    if (isEditing) {
      updateJobMutation.mutate(formattedData);
    } else {
      createJobMutation.mutate(formattedData);
    }
  };

  if (isEditing && isJobLoading) {
    return <p className="text-gray-600">Loading job details...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#FDFCF6] border-gray-200 rounded-md shadow-md">
      <button
        type="button"
        onClick={() => navigate("/admin/jobs")}
        className="mb-6 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
      >
        <ArrowLeft size={18} />
        Back to Jobs
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Job" : "Create New Job"}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormInput
            label="Job Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Software Engineer"
          />

          {/* Company */}
          <FormInput
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            error={errors.company}
            placeholder="Tech Corp"
          />

          {/* Location */}
          <FormInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder="Bangalore, India"
          />

          {/* Job Type */}
          <div>
            <label className="block font-medium mb-1">Job Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full border p-3 rounded transition focus:outline-none focus:ring-1 ${
                errors.type
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-red-500 focus:ring-red-500"
              }`}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type}</p>
            )}
          </div>

          {/* Salary */}
          <FormInput
            label="Salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            error={errors.salary}
            placeholder="1000000"
            type="text"
          />

          {/* Department */}
          <FormInput
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="Engineering"
          />
        </div>

        {/* Description */}
        <FormTextarea
          label="Job Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Write a short description about the job..."
        />

        {/* Requirements */}
        <FormTextarea
          label="Requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          error={errors.requirements}
          placeholder="List down job requirements..."
        />

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            disabled={
              createJobMutation.isLoading || updateJobMutation.isLoading
            }
          >
            {createJobMutation.isLoading || updateJobMutation.isLoading
              ? "Saving..."
              : "Save Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --------------------
// Reusable components
// --------------------

const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="block font-medium mb-1">{label} *</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border p-3 rounded transition focus:outline-none focus:ring-1 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-red-500 focus:ring-red-500"
      }`}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const FormTextarea = ({ label, name, value, onChange, error, placeholder }) => (
  <div>
    <label className="block font-medium mb-1">{label} *</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      placeholder={placeholder}
      className={`w-full border p-3 rounded transition focus:outline-none focus:ring-1 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
          : "border-gray-300 focus:border-red-500 focus:ring-red-500"
      }`}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default JobForm;

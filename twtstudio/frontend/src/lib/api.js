import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding token for login/register routes
    if (config.url.includes("/login") || config.url.includes("/register")) {
      return config;
    }

    const token = localStorage.getItem("token") || " ";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Redirect to login if no token found (except for public routes)
      if (!config.url.includes("/public")) {
        window.location.href = "/login";
        return Promise.reject(new Error("No authentication token found"));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(error);
  }
);

// Helper function to handle token refresh if needed
const refreshToken = async () => {
  try {
    const response = await api.post("/refresh-token", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    localStorage.setItem("token", response.data.token);
    return response.data.token;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw error;
  }
};

// Add retry mechanism for failed requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Blog API functions
export const blogAPI = {
  getBlogs: async (params = {}) => {
    const response = await api.get("/blogs", { params });
    return response.data.blogs || response.data;
  },

  getBlog: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data.blog || response.data;
  },

  createBlog: async (blogData) => {
    const response = await api.post("/blogs", blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },
};

// Job API functions
export const jobAPI = {
  getJobs: async (params = {}) => {
    try {
      const response = await api.get("/jobs", { params });
      return response.data.jobs || [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  },

  getJob: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data.job;
    } catch (error) {
      console.error("Error fetching job:", error);
      throw error;
    }
  },

  createJob: async (jobData) => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/register", userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  },
};

export default api;

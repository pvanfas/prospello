// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";

// export const useCreateBlog = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (formData) => {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/blogs`,
//         formData
//       );
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["blogs"] });
//     },
//   });
// };

// export const useUpdateBlog = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ id, formData }) => {
//       const res = await axios.put(
//         `${import.meta.env.VITE_BASE_URL}/blogs/${id}`,
//         formData
//       );
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["blogs"] });
//     },
//   });
// };

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api"; // Import your configured axios instance

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // Use your configured api instance which automatically handles auth headers
      const response = await api.post("/blogs", formData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error) => {
      console.error("Error creating blog:", error);
      // You can add additional error handling here if needed
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      // Use your configured api instance
      const response = await api.put(`/blogs/${id}`, formData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the blogs query and also update the cache for the specific blog
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.setQueryData(["blog", variables.id], data);
    },
    onError: (error) => {
      console.error("Error updating blog:", error);
      // Additional error handling
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
    onError: (error) => {
      console.error("Error deleting blog:", error);
    },
  });
};

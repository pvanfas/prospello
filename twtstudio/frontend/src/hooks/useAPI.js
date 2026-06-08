import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogAPI, jobAPI } from "../lib/api";

// Blog hooks
export const useBlogs = (params = {}) => {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogAPI.getBlogs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBlog = (id) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogAPI.getBlog(id),
    enabled: !!id,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogAPI.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => blogAPI.updateBlog(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", variables.id] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogAPI.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

// Job hooks
export const useJobs = (params = {}) => {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobAPI.getJobs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJob = (id) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => jobAPI.getJob(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobAPI.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => jobAPI.updateJob(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", variables.id] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobAPI.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

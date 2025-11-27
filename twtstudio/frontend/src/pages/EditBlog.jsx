import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogAPI } from "../lib/api";
import { useUpdateBlog } from "../lib/hooks";
import BlogForm from "../components/BlogForm";
import toast from "react-hot-toast";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: blog, isLoading: isFetching } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogAPI.getBlog(id),
  });

  const { mutateAsync: updateBlog, isLoading } = useUpdateBlog();

  const handleUpdate = async (data) => {
    try {
      await updateBlog({ id, formData: { ...data, featuredImage: data.image } });
      toast.success("Blog updated!");
      navigate("/admin/blogs");
    } catch {
      toast.error("Failed to update blog.");
    }
  };

  if (isFetching) return <p>Loading...</p>;
  return (
    <BlogForm
      initialData={blog}
      onSubmit={handleUpdate}
      isLoading={isLoading}
    />
  );
};

export default EditBlog;

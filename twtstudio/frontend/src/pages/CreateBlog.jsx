import BlogForm from "../components/BlogForm";
import { useCreateBlog } from "../lib/hooks";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateBlog = () => {
  const { mutateAsync, isLoading } = useCreateBlog();
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await mutateAsync({
        ...data,
        featuredImage: data.image,
        publishDate: new Date().toISOString(),
        status: "published",
      });
      toast.success("Blog created!");
      navigate("/admin/blogs");
    } catch {
      toast.error("Failed to create blog.");
    }
  };

  return <BlogForm onSubmit={handleCreate} isLoading={isLoading} />;
};

export default CreateBlog;

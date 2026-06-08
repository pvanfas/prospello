import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import JobForm from "../components/JobForm";
import { jobAPI } from "../lib/api";
import { useMutation } from "@tanstack/react-query";

const CreateJob = () => {
  const navigate = useNavigate();

  const { mutate: createJob, isPending } = useMutation({
    mutationFn: jobAPI.createJob,
    onSuccess: () => {
      toast.success("Job created successfully");
      navigate("/admin/jobs");
    },
    onError: (err) => toast.error("Error creating job: " + err.message),
  });

  return (
    <div className="p-6 bg-[#FDFCF6] shadow-sm border-b border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Create Job</h1>
      <JobForm onSubmit={createJob} isSubmitting={isPending} />
    </div>
  );
};

export default CreateJob;
